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
  EnvelopeIcon,
  ChevronDownIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';

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

function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
      toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {toast.message}
    </div>
  );
}

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
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold capitalize ${cfg.cls} ${sz}`}>
      <cfg.Icon className="w-3.5 h-3.5" /> {cfg.label}
    </span>
  );
}

function ApplicationRow({ app, onAction, busy }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-border-light rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 p-4 bg-white hover:bg-surface/50 transition-colors">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
          {(app.tenant_name ?? '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink truncate">{app.tenant_name ?? '—'}</p>
          <p className="text-xs text-text-muted">{formatDateRelative(app.created_at)}</p>
        </div>
        <StatusBadge status={app.status} size="sm" />
        <div className="flex items-center gap-2 flex-shrink-0">
          {app.status === 'pending' && (
            <>
              <button onClick={() => onAction(app.id, 'approved')} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50">
                {busy === app.id + 'approved' ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircleIcon className="w-3.5 h-3.5" />} Approve
              </button>
              <button onClick={() => onAction(app.id, 'rejected')} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 disabled:opacity-50">
                {busy === app.id + 'rejected' ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <XCircleIcon className="w-3.5 h-3.5" />} Reject
              </button>
            </>
          )}
          {app.status === 'approved' && (
            <button onClick={() => onAction(app.id, 'pending')} disabled={!!busy} className="px-3 py-1.5 bg-surface text-ink-soft text-xs font-bold rounded-lg hover:bg-accent/10 disabled:opacity-50">Reset</button>
          )}
          <button onClick={() => setExpanded(v => !v)} className={`p-1.5 rounded-lg text-text-muted hover:text-ink hover:bg-surface transition ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border-light p-4 bg-surface grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm"><EnvelopeIcon className="w-4 h-4 text-text-muted" /><a href={`mailto:${app.tenant_email}`} className="text-accent hover:underline truncate">{app.tenant_email ?? '—'}</a></div>
            <div className="flex items-center gap-2 text-sm text-ink-soft"><CalendarDaysIcon className="w-4 h-4 text-text-muted" /> Applied {formatDate(app.created_at)}</div>
            {app.updated_at !== app.created_at && (<div className="flex items-center gap-2 text-sm text-ink-soft"><ClockIcon className="w-4 h-4 text-text-muted" /> Updated {formatDate(app.updated_at)}</div>)}
          </div>
          {app.notes && (
            <div><p className="text-xs font-bold text-text-muted uppercase mb-1">Applicant Note</p><p className="text-sm text-ink-soft bg-white border border-border-light rounded-xl p-3 italic">"{app.notes}"</p></div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LandlordListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ views: 0, saves: 0, inquiries: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [appFilter, setAppFilter] = useState('all');
  const [busy, setBusy] = useState(null);
  const [statusChanging, setStatusChanging] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/landlord/properties/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error ?? `Error ${res.status}`);
      const { property: p, applications: apps } = await res.json();
      const images = safeJson(p.images, []);
      const amenities = safeJson(p.amenities, []);
      const lstRes = await fetch('/api/landlord/listings', { credentials: 'include' });
      let views = 0, saves = 0, inquiries = 0;
      if (lstRes.ok) {
        const { listings } = await lstRes.json();
        const match = listings.find(l => l.id === id);
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

  const handleAppAction = async (appId, status) => {
    setBusy(appId + status);
    try {
      const res = await fetch(`/api/landlord/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ application_id: appId, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status, updated_at: Date.now() } : a));
      showToast(`Application ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'reset'}`);
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    try {
      const res = await fetch(`/api/landlord/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setProperty(p => ({ ...p, status: newStatus }));
      showToast(`Listing marked as ${newStatus}`);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setStatusChanging(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (error || !property) {
    return (
      <div className="text-center py-16">
        <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-xl font-bold mb-2">Failed to load listing</p>
        <p className="text-text-muted mb-4">{error}</p>
        <button onClick={load} className="btn-primary px-6 py-2">Retry</button>
      </div>
    );
  }

  const filteredApps = appFilter === 'all' ? applications : applications.filter(a => a.status === appFilter);
  const countBy = (s) => applications.filter(a => a.status === s).length;
  const coverImage = property.images?.[0] ?? null;
  const mgmtActions = [
    property.status !== 'active' && { label: 'Mark Active', value: 'active', cls: 'bg-green-600 hover:bg-green-700 text-white' },
    property.status !== 'rented' && { label: 'Mark as Rented', value: 'rented', cls: 'bg-blue-600 hover:bg-blue-700 text-white' },
    property.status !== 'inactive' && { label: 'Deactivate', value: 'inactive', cls: 'bg-slate-200 hover:bg-slate-300 text-slate-700' },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/landlord/listings" className="inline-flex items-center gap-1.5 text-text-muted text-sm hover:text-accent mb-2 transition">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Listings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          <p className="text-text-muted text-sm mt-1 flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {property.location}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {property.status === 'active' && (
            <Link href={`/property/${id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 border border-border-light rounded-full text-sm font-medium hover:bg-surface transition">
              <EyeIcon className="w-4 h-4" /> View Public
            </Link>
          )}
          <Link href={`/landlord/listings/${id}/edit`} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <PencilIcon className="w-4 h-4" /> Edit Listing
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: stats.views, Icon: EyeIcon, color: '#2563eb', bg: 'bg-blue-50' },
          { label: 'Applications', value: applications.length, Icon: UsersIcon, color: '#8b5cf6', bg: 'bg-purple-50' },
          { label: 'Saved', value: stats.saves, Icon: BookmarkIcon, color: '#f59e0b', bg: 'bg-amber-50' },
          { label: 'Inquiries', value: stats.inquiries, Icon: ChatBubbleLeftRightIcon, color: '#10b981', bg: 'bg-green-50' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-border-light">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${bg}`}><Icon className={`w-5 h-5`} style={{ color }} /></div>
              <div><p className="text-2xl font-bold text-ink">{value}</p><p className="text-xs text-text-muted">{label}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
            {coverImage ? (
              <img src={coverImage} alt={property.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-surface flex items-center justify-center"><BuildingOfficeIcon className="w-12 h-12 text-text-muted/30" /></div>
            )}
            {property.images?.length > 1 && (
              <div className="flex gap-1 p-2 overflow-x-auto">
                {property.images.slice(1, 5).map((img, i) => <img key={i} src={img} alt="" className="w-16 h-12 object-cover rounded flex-shrink-0" />)}
                {property.images.length > 5 && <div className="w-16 h-12 bg-surface rounded flex items-center justify-center text-xs text-text-muted flex-shrink-0">+{property.images.length - 5}</div>}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-border-light">
            <h3 className="font-bold mb-4">Listing Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Rent', value: `BWP ${property.price?.toLocaleString()}/mo`, Icon: CurrencyDollarIcon },
                { label: 'Bedrooms', value: `${property.beds ?? '—'} bed`, Icon: HomeIcon },
                { label: 'Bathrooms', value: `${property.baths ?? '—'} bath`, Icon: HomeIcon },
                { label: 'Size', value: property.sqm ? `${property.sqm} m²` : '—', Icon: BuildingOfficeIcon },
                { label: 'Type', value: property.type ?? '—', Icon: BuildingOfficeIcon },
                { label: 'Listed', value: formatDate(property.created_at), Icon: CalendarDaysIcon },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div className="flex items-center gap-2 text-text-muted"><Icon className="w-4 h-4" /><span className="text-sm">{label}</span></div>
                  <span className="text-sm font-semibold text-ink capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {property.amenities?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-border-light">
              <h3 className="font-bold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(a => <span key={a} className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">{a}</span>)}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-border-light">
            <h3 className="font-bold mb-4">Management Actions</h3>
            <div className="space-y-2">
              {mgmtActions.map(({ label, value, cls }) => (
                <button key={value} onClick={() => handleStatusChange(value)} disabled={statusChanging} className={`w-full py-2.5 rounded-full text-sm font-bold transition disabled:opacity-50 ${cls}`}>
                  {statusChanging ? <ArrowPathIcon className="w-4 h-4 animate-spin inline mr-2" /> : null}{label}
                </button>
              ))}
              <Link href={`/landlord/listings/${id}/edit`} className="w-full block text-center py-2.5 border border-border-light rounded-full text-sm font-bold text-ink-soft hover:bg-surface transition">Edit Details</Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display">Applications {applications.length > 0 && <span className="ml-2 px-2 py-0.5 bg-accent/10 text-accent text-sm rounded-full font-bold">{applications.length}</span>}</h2>
          </div>
          {applications.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all', label: `All (${applications.length})` },
                { key: 'pending', label: `Pending (${countBy('pending')})` },
                { key: 'approved', label: `Approved (${countBy('approved')})` },
                { key: 'rejected', label: `Rejected (${countBy('rejected')})` },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setAppFilter(key)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${appFilter === key ? 'bg-accent text-white' : 'bg-surface text-ink-soft hover:bg-accent/10'}`}>{label}</button>
              ))}
            </div>
          )}
          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
              <UsersIcon className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No applications yet</h3>
              <p className="text-text-muted text-sm">{property.status === 'active' ? 'Applications from tenants will appear here once they apply.' : 'This listing is not active. Set it to Active to receive applications.'}</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-light p-8 text-center"><p className="text-text-muted text-sm">No {appFilter} applications</p></div>
          ) : (
            <div className="space-y-3">{filteredApps.map(app => <ApplicationRow key={app.id} app={app} onAction={handleAppAction} busy={busy} />)}</div>
          )}
          {property.description && (
            <div className="bg-white rounded-2xl p-5 border border-border-light mt-2">
              <h3 className="font-bold mb-3">Description</h3>
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}