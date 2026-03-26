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

  // Auto-dismiss success banner
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 6000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const filtered = listings.filter((l) => {
    const matchesFilter = filter === 'all' || l.status === filter;
    const matchesSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.location?.toLowerCase().includes(search.toLowerCase());
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
    if (result.success) {
      setShowDeleteConfirm(null);
    } else {
      alert('Failed to delete: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0 text-green-500" />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
          <p className="text-slate-500 mt-1">Manage and track your property listings</p>
        </div>
        <Link
          href="/landlord/listings/new"
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <PlusIcon className="w-5 h-5" />
          Create New Listing
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all',      label: `All (${listings.length})` },
              { key: 'active',   label: `Active (${countByStatus('active')})` },
              { key: 'pending',  label: `Pending (${countByStatus('pending')})` },
              { key: 'rented',   label: `Rented (${countByStatus('rented')})` },
              { key: 'rejected', label: `Rejected (${countByStatus('rejected')})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              <div key={listing.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-slate-100">
                  {image ? (
                    <img src={image} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BuildingOfficeIcon className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyle(listing.status)}`}>
                    {listing.status}
                  </div>
                  {/* Pending notice overlay */}
                  {listing.status === 'pending' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white text-xs font-medium px-3 py-1.5 text-center">
                      Awaiting admin approval
                    </div>
                  )}
                  {listing.status === 'rejected' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-xs font-medium px-3 py-1.5 text-center">
                      Rejected — edit and resubmit
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{listing.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">{listing.beds} bed · {listing.baths} bath · {listing.type}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-bold">BWP {listing.price?.toLocaleString()}/mo</span>
                    <span className="text-xs text-slate-400">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Stats — only meaningful once active */}
                  {listing.status === 'active' && (
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100">
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-900">{listing.views ?? 0}</p>
                        <p className="text-xs text-slate-500">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-900">{listing.inquiries ?? 0}</p>
                        <p className="text-xs text-slate-500">Inquiries</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-900">{listing.saves ?? 0}</p>
                        <p className="text-xs text-slate-500">Saved</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {listing.status === 'active' && (
                      <Link
                        href={`/property/${listing.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </Link>
                    )}
                    <Link
                      href={`/landlord/listings/${listing.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(listing.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Delete confirm */}
                  {showDeleteConfirm === listing.id && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-center justify-between">
                      <p className="text-sm text-red-700 font-medium">Delete this listing?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(listing.id)}
                          disabled={deleting}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 bg-white text-slate-600 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {search ? 'No listings match your search' : 'No listings found'}
          </h3>
          <p className="text-slate-500 mb-6">
            {search ? 'Try a different search term' : 'Get started by creating your first property listing'}
          </p>
          {!search && (
            <Link
              href="/landlord/listings/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              Create New Listing
            </Link>
          )}
        </div>
      )}
    </div>
  );
}