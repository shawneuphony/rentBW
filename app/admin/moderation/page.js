// app/admin/moderation/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  TrashIcon,
  BuildingOfficeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function safeJson(val, fallback) {
  try { return JSON.parse(val); } catch { return fallback; }
}

const STATUS_COLORS = {
  active:   'bg-green-100 text-green-700',
  pending:  'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  rented:   'bg-blue-100 text-blue-700',
};

export default function AdminModerationPage() {
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('pending');
  const [busy,       setBusy]       = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/properties?${params}`, { credentials: 'include' });
      const data = await res.json();
      setProperties(data.properties ?? []);
    } catch {
      showToast('Failed to load properties', 'error');
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleAction = async (propertyId, action) => {
    setBusy(propertyId + action);
    try {
      const res = await fetch('/api/admin/properties', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProperties(prev => prev.map(p =>
        p.id === propertyId
          ? { ...p, status: data.property.status, featured: data.property.featured }
          : p
      ));
      showToast(`Property ${action}d successfully`);
    } catch (err) {
      showToast(err.message || `Failed to ${action}`, 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (propertyId) => {
    setBusy(propertyId + 'delete');
    try {
      const res = await fetch('/api/admin/properties', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setDeleteConfirm(null);
      showToast('Property deleted');
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-sm flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckSolid className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Moderation</h1>
        <p className="text-slate-500 mt-1">Review and approve property listings</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or location..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-slate-400" />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="rented">Rented</option>
          </select>
        </div>
        <div className="text-sm text-slate-500 self-center">{properties.length} listings</div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <BuildingOfficeIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No properties found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {properties.map(p => {
            const images = Array.isArray(p.images) ? p.images : safeJson(p.images, []);
            return (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Image */}
                <div className="relative h-40 bg-slate-100">
                  {images[0] ? (
                    <img src={images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BuildingOfficeIcon className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded capitalize ${STATUS_COLORS[p.status] || 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                  {p.featured ? (
                    <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <StarSolid className="w-3 h-3" /> Featured
                    </span>
                  ) : null}
                </div>

                <div className="p-4">
                  <Link href={`/property/${p.id}`} className="font-bold text-slate-900 hover:text-primary transition-colors">
                    {p.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">
                    {p.location} · BWP {p.price?.toLocaleString()}/mo · {p.beds} bed · {p.baths} bath
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    By {p.landlord_name || '—'} · Submitted {formatDate(p.created_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {p.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(p.id, 'approve')}
                          disabled={!!busy}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          {busy === p.id + 'approve' ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'reject')}
                          disabled={!!busy}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200 disabled:opacity-50 transition"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          {busy === p.id + 'reject' ? '...' : 'Reject'}
                        </button>
                      </>
                    )}
                    {p.status === 'active' && (
                      <button
                        onClick={() => handleAction(p.id, p.featured ? 'unfeature' : 'feature')}
                        disabled={!!busy}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition"
                      >
                        <StarIcon className="w-4 h-4" />
                        {busy === p.id + (p.featured ? 'unfeature' : 'feature') ? '...' : p.featured ? 'Unfeature' : 'Feature'}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-600 transition ml-auto"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  {/* Delete confirm */}
                  {deleteConfirm === p.id && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-center justify-between">
                      <p className="text-sm text-red-700 font-medium">Delete this listing?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={!!busy}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded disabled:opacity-50"
                        >
                          {busy === p.id + 'delete' ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 bg-white text-slate-600 text-xs font-bold rounded border border-slate-200"
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
      )}
    </div>
  );
}