// app/tenant/saved/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import PropertyCard from '@/app/components/ui/PropertyCard';
import {
  HeartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

function formatSavedDate(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now = new Date();
  const diff = now - date;
  if (diff < 86_400_000) return 'Today';
  if (diff < 2 * 86_400_000) return 'Yesterday';
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function normalise(row) {
  return {
    ...row,
    saved_date: formatSavedDate(row.saved_at),
    saved_ts: row.saved_at ?? 0,
  };
}

export default function SavedPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [removing, setRemoving] = useState(new Set());
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/saved');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProperties((data.saved ?? []).map(normalise));
    } catch {
      setError('Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchSaved();
  }, [user, fetchSaved]);

  const handleRemove = async (propertyId) => {
    setRemoving(prev => new Set(prev).add(propertyId));
    try {
      const res = await fetch(`/api/properties/${propertyId}/save`, { method: 'POST' });
      if (!res.ok) throw new Error();
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      showToast('Property removed');
    } catch {
      showToast('Error removing property', 'error');
    } finally {
      setRemoving(prev => {
        const s = new Set(prev);
        s.delete(propertyId);
        return s;
      });
    }
  };

  const filtered = properties.filter(p =>
    !searchTerm ||
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return b.saved_ts - a.saved_ts;
    if (sortBy === 'oldest') return a.saved_ts - b.saved_ts;
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Failed to load saved properties</h3>
        <p className="text-text-muted mb-4">{error}</p>
        <button onClick={fetchSaved} className="btn-primary px-6 py-2">Try again</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Saved Properties</h1>
          <p className="text-text-muted mt-1">{properties.length} saved {properties.length === 1 ? 'property' : 'properties'}</p>
        </div>
        <button onClick={fetchSaved} className="p-2 hover:bg-surface rounded-full transition-colors" title="Refresh">
          <ArrowPathIcon className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search saved properties..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-border-light rounded-full focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-5 py-3 bg-white border border-border-light rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="newest">Newest saved</option>
          <option value="oldest">Oldest saved</option>
          <option value="price-high">Price: High to Low</option>
          <option value="price-low">Price: Low to High</option>
        </select>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Results */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map(property => (
            <div key={property.id} className="relative group">
              <PropertyCard property={property} />
              <button
                onClick={() => handleRemove(property.id)}
                disabled={removing.has(property.id)}
                className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur rounded-full text-white text-xs font-medium hover:bg-red-600 transition-colors"
              >
                {removing.has(property.id) ? (
                  <ArrowPathIcon className="w-3 h-3 animate-spin" />
                ) : (
                  <XMarkIcon className="w-3 h-3" />
                )}
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border-light">
          <HeartSolid className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display mb-2">No saved properties yet</h2>
          <p className="text-text-muted mb-6">Start exploring properties and save the ones you love.</p>
          <Link href="/property/search" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            Browse Properties <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-border-light">
          <MagnifyingGlassIcon className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No matching properties</h3>
          <p className="text-text-muted">Try adjusting your search term.</p>
          <button onClick={() => setSearchTerm('')} className="text-accent mt-4 underline">Clear search</button>
        </div>
      )}
    </div>
  );
}