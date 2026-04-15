// app/landlord/listings/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLandlordData } from '@/app/lib/hooks/useLandlordData';
import {
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function ListingsPage() {
  const { listings, loading, deleteProperty } = useLandlordData();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(
    searchParams.get('created') === '1'
      ? "Listing submitted! It's pending admin review before going live."
      : searchParams.get('updated') === '1'
      ? "Listing updated and resubmitted for admin review."
      : ''
  );

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 6000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const filtered = listings.filter((l) => {
    const matchesFilter = filter === 'all' || l.status === filter;
    const matchesSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.location?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const countByStatus = (status) => listings.filter((l) => l.status === status).length;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':   return 'bg-green-100 text-green-700';
      case 'pending':  return 'bg-amber-100 text-amber-700';
      case 'rented':   return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default:         return 'bg-slate-100 text-slate-600';
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    const result = await deleteProperty(id);
    setDeleting(false);
    if (result.success) setShowDeleteConfirm(null);
    else alert('Failed to delete: ' + result.error);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">My Listings</h1>
          <p className="text-text-muted mt-1">Manage and track your property listings</p>
        </div>
        <Link href="/landlord/listings/new" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
          <PlusIcon className="w-4 h-4" /> Create New Listing
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-2xl p-4 border border-border-light">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all', label: `All (${listings.length})` },
              { key: 'active', label: `Active (${countByStatus('active')})` },
              { key: 'pending', label: `Pending (${countByStatus('pending')})` },
              { key: 'rented', label: `Rented (${countByStatus('rented')})` },
              { key: 'rejected', label: `Rejected (${countByStatus('rejected')})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === key ? 'bg-accent text-white' : 'bg-surface text-ink-soft hover:bg-accent/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-auto">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-2 border border-border-light rounded-full text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => {
            const image = listing.images?.[0] || null;
            return (
              <div key={listing.id} className="bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-md transition-all group">
                <div className="relative h-48 bg-surface">
                  {image ? (
                    <img src={image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><BuildingOfficeIcon className="w-12 h-12 text-text-muted/30" /></div>
                  )}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyle(listing.status)}`}>
                    {listing.status}
                  </div>
                  {listing.status === 'pending' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white text-xs font-medium px-3 py-1.5 text-center">Awaiting admin approval</div>
                  )}
                  {listing.status === 'rejected' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-xs font-medium px-3 py-1.5 text-center">Rejected — edit and resubmit</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-ink mb-1 truncate">{listing.title}</h3>
                  <p className="text-sm text-text-muted mb-2">{listing.beds} bed · {listing.baths} bath · {listing.type}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-accent font-bold">BWP {listing.price?.toLocaleString()}/mo</span>
                    <span className="text-xs text-text-muted">{new Date(listing.created_at).toLocaleDateString()}</span>
                  </div>
                  {listing.status === 'active' && (
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-border-light">
                      <div className="text-center"><p className="text-sm font-bold text-ink">{listing.views ?? 0}</p><p className="text-xs text-text-muted">Views</p></div>
                      <div className="text-center"><p className="text-sm font-bold text-ink">{listing.inquiries ?? 0}</p><p className="text-xs text-text-muted">Inquiries</p></div>
                      <div className="text-center"><p className="text-sm font-bold text-ink">{listing.saves ?? 0}</p><p className="text-xs text-text-muted">Saved</p></div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    {listing.status === 'active' && (
                      <Link href={`/property/${listing.id}`} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium hover:bg-accent/20 transition">
                        <EyeIcon className="w-4 h-4" /> View
                      </Link>
                    )}
                    <Link href={`/landlord/listings/${listing.id}/edit`} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-surface text-ink-soft rounded-full text-sm font-medium hover:bg-accent/10 transition">
                      <PencilIcon className="w-4 h-4" /> Edit
                    </Link>
                    <button onClick={() => setShowDeleteConfirm(listing.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-full transition">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {showDeleteConfirm === listing.id && (
                    <div className="mt-3 p-3 bg-red-50 rounded-xl flex items-center justify-between">
                      <p className="text-sm text-red-700 font-medium">Delete this listing?</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(listing.id)} disabled={deleting} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg">{deleting ? '...' : 'Yes'}</button>
                        <button onClick={() => setShowDeleteConfirm(null)} className="px-3 py-1 bg-white text-slate-600 text-xs font-bold rounded-lg border">No</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-border-light">
          <BuildingOfficeIcon className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{search ? 'No listings match your search' : 'No listings found'}</h3>
          <p className="text-text-muted mb-6">{search ? 'Try a different search term' : 'Get started by creating your first property listing'}</p>
          {!search && (
            <Link href="/landlord/listings/new" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
              <PlusIcon className="w-5 h-5" /> Create New Listing
            </Link>
          )}
        </div>
      )}
    </div>
  );
}