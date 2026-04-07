// app/landlord/listings/[id]/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  PencilIcon,
  EyeIcon,
  UsersIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckSolid,
} from '@heroicons/react/24/solid';

// ── Helpers ────────────────────────────────────────────────────────────────────

function safeJson(val, fallback) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateRelative(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  return formatDate(ts);
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
      toast.type === 'success'
        ? 'bg-green-50 text-green-800 border border-green-200'
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {toast.type === 'success'
        ? <CheckSolid className="w-5 h-5 text-green-600" />
        : <XCircleIcon className="w-5 h-5 text-red-600" />}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status, size = 'md' }) {
  const map = {
    pending:  { label: 'Pending',  cls: 'bg-amber-100 text-amber-700',  Icon: ClockIcon },
    approved: { label: 'Approved', cls: 'bg-green-100 text-green-700',  Icon: CheckCircleIcon },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700',      Icon: XCircleIcon },
    active:   { label: 'Active',   cls: 'bg-green-100 text-green-700',  Icon: CheckCircleIcon },
    rented:   { label: 'Rented',   cls: 'bg-blue-100 text-blue-700',    Icon: HomeIcon },
    inactive: { label: 'Inactive', cls: 'bg-slate-100 text-slate-600',  Icon: ArchiveBoxIcon },
  };
  const cfg = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600', Icon: ClockIcon };
  const sz  = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold capitalize ${cfg.cls} ${sz}`}>
      <cfg.Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ── Application row ────────────────────────────────────────────────────────────

function ApplicationRow({ app, onAction, busy }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-4 bg-white hover:bg-slate-50 transition-colors">
        {/* Initials */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
          {(app.tenant_name ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>

        {/* Name + date */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{app.tenant_name ?? '—'}</p>
          <p className="text-xs text-slate-400">{formatDateRelative(app.created_at)}</p>
        </div>

        {/* Status */}
        <StatusBadge status={app.status} size="sm" />

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {app.status === 'pending' && (
            <>
              <button
                onClick={() => onAction(app.id, 'approved')}
                disabled={!!busy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {busy === app.id + 'approved'
                  ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircleIcon className="w-3.5 h-3.5" />}
                Approve
              </button>
              <button
                onClick={() => onAction(app.id, 'rejected')}
                disabled={!!busy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
              >
                {busy === app.id + 'rejected'
                  ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                  : <XCircleIcon className="w-3.5 h-3.5" />}
                Reject
              </button>
            </>
          )}
          {app.status === 'approved' && (
            <button
              onClick={() => onAction(app.id, 'pending')}
              disabled={!!busy}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50 transition"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ${expanded ? 'rotate-180' : ''}`}
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <EnvelopeIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a href={`mailto:${app.tenant_email}`} className="text-primary hover:underline truncate">
                {app.tenant_email ?? '—'}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CalendarDaysIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              Applied {formatDate(app.created_at)}
            </div>
            {app.updated_at !== app.created_at && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ClockIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                Updated {formatDate(app.updated_at)}
              </div>
            )}
          </div>
          {app.notes && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Applicant Note</p>
              <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 italic">
                "{app.notes}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function LandlordListingDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();

  const [property,     setProperty]     = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats,        setStats]        = useState({ views: 0, saves: 0, inquiries: 0 });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [toast,        setToast]        = useState({ show: false, message: '', type: 'success' });

  const [appFilter, setAppFilter]       = useState('all');
  const [busy,      setBusy]            = useState(null);

  // Property status change
  const [statusChanging, setStatusChanging] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // ── Load ─────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/landlord/properties/${id}`, { credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      const { property: p, applications: apps } = await res.json();

      const images    = safeJson(p.images, []);
      const amenities = safeJson(p.amenities, []);

      // stats from landlord listings endpoint (views/saves/inquiries)
      const lstRes = await fetch('/api/landlord/listings', { credentials: 'include' });
      let views = 0, saves = 0, inquiries = 0;
      if (lstRes.ok) {
        const { listings } = await lstRes.json();
        const match = listings.find((l) => l.id === id);
        if (match) { views = match.views; saves = match.saves; inquiries = match.inquiries; }
      }

      setProperty({ ...p, images, amenities });
      setApplications(apps ?? []);
      setStats({ views, saves, inquiries });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (id) load(); }, [id, load]);

  // ── Application action ────────────────────────────────────────────────────────

  const handleAppAction = async (appId, status) => {
    setBusy(appId + status);
    try {
      const res = await fetch(`/api/landlord/properties/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ application_id: appId, status }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status, updated_at: Date.now() } : a)
      );
      showToast(`Application ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'reset'}`);
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setBusy(null);
    }
  };

  // ── Property status change ────────────────────────────────────────────────────

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    try {
      const res = await fetch(`/api/landlord/properties/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      setProperty((p) => ({ ...p, status: newStatus }));
      showToast(`Listing marked as ${newStatus}`);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setStatusChanging(false);
    }
  };

  // ── Loading / Error ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading listing…</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-2">Failed to load listing</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button onClick={load}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const filteredApps = appFilter === 'all'
    ? applications
    : applications.filter((a) => a.status === appFilter);

  const countBy = (s) => applications.filter((a) => a.status === s).length;

  const coverImage = property.images?.[0] ?? null;

  const mgmtActions = [
    property.status !== 'active'   && { label: 'Mark Active',   value: 'active',   cls: 'bg-green-600 hover:bg-green-700 text-white' },
    property.status !== 'rented'   && { label: 'Mark as Rented', value: 'rented',  cls: 'bg-blue-600 hover:bg-blue-700 text-white' },
    property.status !== 'inactive' && { label: 'Deactivate',     value: 'inactive', cls: 'bg-slate-200 hover:bg-slate-300 text-slate-700' },
  ].filter(Boolean);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* ── Breadcrumb + header ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/landlord/listings"
            className="inline-flex items-center gap-1.5 text-slate-500 text-sm hover:text-slate-700 mb-2">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Listings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
            <MapPinIcon className="w-4 h-4" /> {property.location}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {property.status === 'active' && (
            <Link href={`/property/${id}`} target="_blank"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
              <EyeIcon className="w-4 h-4" /> View Public
            </Link>
          )}
          <Link href={`/landlord/listings/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition">
            <PencilIcon className="w-4 h-4" /> Edit Listing
          </Link>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Views',    value: stats.views,                  Icon: EyeIcon,                  color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Applications',   value: applications.length,          Icon: UsersIcon,                 color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Saved',          value: stats.saves,                  Icon: BookmarkIcon,              color: 'text-amber-600',  bg: 'bg-amber-50'  },
          { label: 'Inquiries',      value: stats.inquiries,              Icon: ChatBubbleLeftRightIcon,   color: 'text-green-600',  bg: 'bg-green-50'  },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: property details + management ─────────────────────────── */}
        <div className="space-y-6">

          {/* Cover image */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {coverImage ? (
              <img src={coverImage} alt={property.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                <BuildingOfficeIcon className="w-12 h-12 text-slate-300" />
              </div>
            )}
            {property.images?.length > 1 && (
              <div className="flex gap-1 p-2 overflow-x-auto">
                {property.images.slice(1, 5).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-16 h-12 object-cover rounded flex-shrink-0" />
                ))}
                {property.images.length > 5 && (
                  <div className="w-16 h-12 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-500 flex-shrink-0">
                    +{property.images.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Property details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Listing Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Rent',         value: `BWP ${property.price?.toLocaleString()}/mo`,   Icon: CurrencyDollarIcon },
                { label: 'Bedrooms',     value: `${property.beds ?? '—'} bed`,                  Icon: HomeIcon },
                { label: 'Bathrooms',    value: `${property.baths ?? '—'} bath`,                Icon: HomeIcon },
                { label: 'Size',         value: property.sqm ? `${property.sqm} m²` : '—',     Icon: BuildingOfficeIcon },
                { label: 'Type',         value: property.type ?? '—',                           Icon: BuildingOfficeIcon },
                { label: 'Listed',       value: formatDate(property.created_at),                Icon: CalendarDaysIcon },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Management actions */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Management Actions</h3>
            <div className="space-y-2">
              {mgmtActions.map(({ label, value, cls }) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  disabled={statusChanging}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50 ${cls}`}
                >
                  {statusChanging ? <ArrowPathIcon className="w-4 h-4 animate-spin inline mr-2" /> : null}
                  {label}
                </button>
              ))}
              <Link
                href={`/landlord/listings/${id}/edit`}
                className="w-full block text-center py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Edit Details
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right: applications ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Applications
              {applications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-full font-bold">
                  {applications.length}
                </span>
              )}
            </h2>
          </div>

          {/* Filter tabs */}
          {applications.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all',      label: `All (${applications.length})` },
                { key: 'pending',  label: `Pending (${countBy('pending')})` },
                { key: 'approved', label: `Approved (${countBy('approved')})` },
                { key: 'rejected', label: `Rejected (${countBy('rejected')})` },
              ].map(({ key, label }) => (
                <button key={key}
                  onClick={() => setAppFilter(key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    appFilter === key
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Applications list */}
          {applications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-500 text-sm">
                {property.status === 'active'
                  ? 'Applications from tenants will appear here once they apply.'
                  : 'This listing is not active. Set it to Active to receive applications.'}
              </p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-slate-500 text-sm">No {appFilter} applications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  onAction={handleAppAction}
                  busy={busy}
                />
              ))}
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 mt-2">
              <h3 className="font-bold text-slate-900 mb-3">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}