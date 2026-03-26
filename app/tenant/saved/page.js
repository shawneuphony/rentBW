// app/tenant/saved/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  HeartIcon,
  MapPinIcon,
  HomeIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  StarIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatSavedDate(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now  = new Date();
  const diff = now - date;
  if (diff < 86_400_000)     return 'Today';
  if (diff < 2 * 86_400_000) return 'Yesterday';
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getFirstImage(row) {
  if (Array.isArray(row.images) && row.images.length > 0) return row.images[0];
  if (typeof row.images === 'string') {
    try { const a = JSON.parse(row.images); return Array.isArray(a) ? a[0] : null; } catch { return null; }
  }
  return null;
}

function normalise(row) {
  return {
    ...row,
    image:      getFirstImage(row),
    saved_date: formatSavedDate(row.saved_at),
    saved_ts:   row.saved_at ?? 0,
  };
}

function calcStats(props) {
  if (!props.length) return null;
  return {
    total:   props.length,
    avgPrice: Math.round(props.reduce((s, p) => s + (p.price  || 0), 0) / props.length),
    avgBeds:  Math.round(props.reduce((s, p) => s + (p.beds   || 0), 0) / props.length),
    avgSqm:   Math.round(props.reduce((s, p) => s + (p.sqm    || 0), 0) / props.length),
  };
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all ${
      toast.type === 'success'
        ? 'bg-green-50 text-green-800 border border-green-200'
        : 'bg-red-50   text-red-800   border border-red-200'
    }`}>
      {toast.type === 'success'
        ? <CheckCircleSolid className="w-5 h-5 text-green-600 flex-shrink-0" />
        : <XMarkIcon        className="w-5 h-5 text-red-600   flex-shrink-0" />}
      <span className="text-sm">{toast.message}</span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SavedPropertiesPage() {
  const { user } = useAuth();

  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [properties, setProperties] = useState([]);   // normalised, source of truth
  const [filtered,   setFiltered]   = useState([]);
  const [removing,   setRemoving]   = useState(new Set());

  const [searchTerm,  setSearchTerm]  = useState('');
  const [sortBy,      setSortBy]      = useState('newest');
  const [viewMode,    setViewMode]    = useState('grid');
  const [selected,    setSelected]    = useState([]);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tenant/saved');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      // API returns { saved: [...] }
      const normalised = (data.saved ?? []).map(normalise);
      setProperties(normalised);
    } catch (err) {
      console.error('[SavedPage]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchSaved();
  }, [user, fetchSaved]);

  // ── Filter / sort ────────────────────────────────────────────────────────────

  useEffect(() => {
    let result = [...properties];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'newest':     result.sort((a, b) => b.saved_ts  - a.saved_ts);  break;
      case 'oldest':     result.sort((a, b) => a.saved_ts  - b.saved_ts);  break;
      case 'price-high': result.sort((a, b) => b.price     - a.price);     break;
      case 'price-low':  result.sort((a, b) => a.price     - b.price);     break;
      case 'rating':     result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }

    setFiltered(result);
  }, [searchTerm, sortBy, properties]);

  // ── Remove single ────────────────────────────────────────────────────────────

  const handleRemove = async (propertyId) => {
    setRemoving((prev) => new Set(prev).add(propertyId));
    try {
      // POST toggles save — since it's already saved this will unsave it
      const res = await fetch(`/api/properties/${propertyId}/save`, { method: 'POST' });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      setSelected((prev) => prev.filter((id) => id !== propertyId));
      showToast('Property removed from saved');
    } catch (err) {
      showToast('Error removing property', 'error');
    } finally {
      setRemoving((prev) => { const s = new Set(prev); s.delete(propertyId); return s; });
    }
  };

  // ── Bulk remove ──────────────────────────────────────────────────────────────

  const handleBulkRemove = async () => {
    if (!selected.length) return;
    const ids = [...selected];
    ids.forEach((id) => setRemoving((prev) => new Set(prev).add(id)));
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/properties/${id}/save`, { method: 'POST' }))
      );
      setProperties((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelected([]);
      showToast(`${ids.length} ${ids.length === 1 ? 'property' : 'properties'} removed`);
    } catch {
      showToast('Error removing some properties', 'error');
    } finally {
      ids.forEach((id) => setRemoving((prev) => { const s = new Set(prev); s.delete(id); return s; }));
    }
  };

  // ── Selection helpers ────────────────────────────────────────────────────────

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleSelectAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.id));

  // ── Loading / error ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading your saved properties…</p>
        </div>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center max-w-sm">
          <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-2">Failed to load saved properties</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchSaved}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const stats = calcStats(properties);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background-light">
      <Toast toast={toast} />

      {/* ── Sticky header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-primary/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <HeartIconSolid className="w-8 h-8 text-red-500" />
                Saved Properties
              </h1>
              <p className="text-slate-500 mt-1">
                {properties.length} saved {properties.length === 1 ? 'property' : 'properties'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selected.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-red-700">{selected.length} selected</span>
                  <button
                    onClick={handleBulkRemove}
                    className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove Selected
                  </button>
                  <button onClick={() => setSelected([])} className="p-1 hover:bg-red-100 rounded-lg">
                    <XMarkIcon className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
              <button
                onClick={fetchSaved}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Search / sort / view toggle */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by property name or location…"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="newest">Newest Saved</option>
                <option value="oldest">Oldest Saved</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* Grid / List toggle */}
              <button
                onClick={() => setViewMode((v) => v === 'grid' ? 'list' : 'grid')}
                className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filtered.length > 0 ? (
          <>
            {/* Select-all bar */}
            <div className="mb-4 flex items-center gap-4 p-3 bg-white rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium">Select All</span>
              </label>
              <span className="text-sm text-slate-500">({filtered.length} properties)</span>
            </div>

            {/* ── Grid view ───────────────────────────────────────────────────── */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((property) => (
                  <div
                    key={property.id}
                    className={`relative bg-white rounded-xl border overflow-hidden hover:shadow-xl transition-all duration-300 group ${
                      selected.includes(property.id) ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selected.includes(property.id)}
                        onChange={() => toggleSelect(property.id)}
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                    </div>

                    {/* Image */}
                    <Link href={`/property/${property.id}`}>
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        {property.image ? (
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HomeIcon className="w-12 h-12 text-slate-300" />
                          </div>
                        )}

                        {property.verified === 1 && (
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-primary flex items-center gap-1 shadow-lg">
                            <CheckBadgeIcon className="w-3 h-3" />
                            VERIFIED
                          </div>
                        )}

                        {property.saved_date && (
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-[10px] font-medium">
                            Saved {property.saved_date}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link href={`/property/${property.id}`}>
                        <h3 className="text-lg font-bold text-primary mb-1">
                          BWP {property.price?.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
                        </h3>
                        <p className="text-sm font-semibold text-slate-800 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                          {property.title}
                        </p>
                      </Link>

                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                        <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>

                      <div className="flex items-center gap-4 py-3 border-t border-slate-100">
                        {property.beds != null && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <HomeIcon className="w-4 h-4" />
                            <span>{property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}</span>
                          </div>
                        )}
                        {property.baths != null && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <BeakerIcon className="w-4 h-4" />
                            <span>{property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}</span>
                          </div>
                        )}
                        {property.sqm != null && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            <span>{property.sqm} m²</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Link
                          href={`/property/${property.id}`}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                        >
                          <EyeIcon className="w-3 h-3" />
                          View
                        </Link>

                        {property.landlord_id && (
                          <Link
                            href={`/tenant/messages?landlord=${property.landlord_id}`}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                          >
                            <ChatBubbleLeftIcon className="w-3 h-3" />
                            Contact
                          </Link>
                        )}

                        <button
                          onClick={() => handleRemove(property.id)}
                          disabled={removing.has(property.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove from saved"
                        >
                          {removing.has(property.id)
                            ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            : <HeartIconSolid className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── List view ──────────────────────────────────────────────────── */
              <div className="space-y-4">
                {filtered.map((property) => (
                  <div
                    key={property.id}
                    className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all ${
                      selected.includes(property.id) ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Checkbox */}
                      <div className="p-4 flex items-start">
                        <input
                          type="checkbox"
                          checked={selected.includes(property.id)}
                          onChange={() => toggleSelect(property.id)}
                          className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary mt-1"
                        />
                      </div>

                      {/* Image */}
                      <Link href={`/property/${property.id}`} className="md:w-56 h-40 md:h-auto flex-shrink-0 bg-slate-100">
                        {property.image ? (
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HomeIcon className="w-10 h-10 text-slate-300" />
                          </div>
                        )}
                      </Link>

                      {/* Content */}
                      <div className="flex-1 p-6 min-w-0">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                          <div className="min-w-0">
                            <Link href={`/property/${property.id}`}>
                              <h3 className="text-xl font-bold text-primary hover:underline">
                                BWP {property.price?.toLocaleString()}/mo
                              </h3>
                              <h4 className="text-lg font-semibold mt-1 truncate">{property.title}</h4>
                            </Link>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                              {property.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {property.verified === 1 && (
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-1">
                                <CheckBadgeIcon className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                            <span className="text-xs text-slate-400">Saved {property.saved_date}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {property.beds  != null && <span className="text-sm bg-slate-100 px-3 py-1 rounded-full">{property.beds}  {property.beds  === 1 ? 'Bedroom'  : 'Bedrooms'}</span>}
                          {property.baths != null && <span className="text-sm bg-slate-100 px-3 py-1 rounded-full">{property.baths} {property.baths === 1 ? 'Bathroom' : 'Bathrooms'}</span>}
                          {property.sqm   != null && <span className="text-sm bg-slate-100 px-3 py-1 rounded-full">{property.sqm} m²</span>}
                        </div>

                        {property.description && (
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{property.description}</p>
                        )}

                        <div className="flex gap-3">
                          <Link
                            href={`/property/${property.id}`}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                          >
                            View Details
                          </Link>
                          {property.landlord_id && (
                            <Link
                              href={`/tenant/messages?landlord=${property.landlord_id}`}
                              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                            >
                              Contact Landlord
                            </Link>
                          )}
                          <button
                            onClick={() => handleRemove(property.id)}
                            disabled={removing.has(property.id)}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto flex items-center gap-1"
                          >
                            {removing.has(property.id)
                              ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              : <HeartIconSolid className="w-4 h-4" />}
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* ── Empty state ──────────────────────────────────────────────────── */
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-12 h-12 text-red-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {properties.length > 0 ? 'No matching properties' : 'No saved properties yet'}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              {properties.length > 0
                ? 'Try adjusting your search term.'
                : 'Start exploring properties and save the ones you love. They\'ll appear here for easy access.'}
            </p>

            {properties.length === 0 && (
              <>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/property/search"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    Browse Properties
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    <HomeIcon className="w-5 h-5" />
                    Go to Homepage
                  </Link>
                </div>

                <div className="mt-12">
                  <p className="text-sm text-slate-400 mb-4">Popular searches:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['2 Bedroom Apartment', 'House with Garden', 'CBD Studio', 'Phakalane'].map((term) => (
                      <Link
                        key={term}
                        href={`/property/search?q=${encodeURIComponent(term)}`}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Stats footer ──────────────────────────────────────────────────────── */}
      {stats && (
        <div className="bg-white border-t border-primary/10 mt-8">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-xs text-slate-500">Total Saved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">BWP {stats.avgPrice.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Avg. Price</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{stats.avgBeds}</p>
                <p className="text-xs text-slate-500">Avg. Bedrooms</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{stats.avgSqm}</p>
                <p className="text-xs text-slate-500">Avg. Size (m²)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}