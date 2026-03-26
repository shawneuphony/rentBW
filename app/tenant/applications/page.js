// app/tenant/applications/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  DocumentArrowUpIcon,
  CalendarIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalise(app) {
  return {
    ...app,
    // UI field aliases
    property:    app.title          ?? 'Unknown Property',
    location:    app.location       ?? '',
    landlord:    app.landlord_name  ?? 'Unknown Landlord',
    landlordId:  app.landlord_id    ?? null,
    price:       app.price          ?? 0,
    appliedDate: app.created_at
      ? new Date(app.created_at).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        })
      : '—',
    image:       Array.isArray(app.images) && app.images.length > 0
      ? app.images[0]
      : (typeof app.images === 'string' ? tryParseImage(app.images) : null),
    statusText:  getStatusText(app.status),
  };
}

function tryParseImage(str) {
  try {
    const arr = JSON.parse(str);
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
  } catch {
    return null;
  }
}

function getStatusText(status) {
  switch (status) {
    case 'pending':   return 'Under Review';
    case 'reviewing': return 'Documents Pending';
    case 'approved':  return 'Approved';
    case 'rejected':  return 'Not Selected';
    case 'withdrawn': return 'Withdrawn';
    default:          return status ?? '—';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'pending':   return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'reviewing': return 'bg-blue-100  text-blue-700  border-blue-200';
    case 'approved':  return 'bg-green-100 text-green-700 border-green-200';
    case 'rejected':  return 'bg-red-100   text-red-700   border-red-200';
    case 'withdrawn': return 'bg-slate-100 text-slate-600 border-slate-200';
    default:          return 'bg-slate-100 text-slate-600';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'pending':   return <ClockIcon       className="w-5 h-5 text-amber-500" />;
    case 'reviewing': return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
    case 'approved':  return <CheckCircleIcon  className="w-5 h-5 text-green-500" />;
    case 'rejected':
    case 'withdrawn': return <XCircleIcon      className="w-5 h-5 text-red-500" />;
    default:          return <ClockIcon        className="w-5 h-5 text-slate-400" />;
  }
}

function getTimelineSteps(status) {
  const steps = [
    { key: 'submitted', label: 'Submitted', icon: DocumentTextIcon },
    { key: 'reviewing', label: 'Review',    icon: ClockIcon },
    { key: 'decision',  label: 'Decision',  icon: CheckCircleIcon },
  ];

  let current = 0;
  if (status === 'pending' || status === 'reviewing') current = 1;
  if (status === 'approved' || status === 'rejected') current = 2;

  return steps.map((step, i) => ({
    ...step,
    active:    i <= current,
    completed: i <  current,
  }));
}

function calcStats(apps) {
  return {
    total:     apps.length,
    pending:   apps.filter((a) => a.status === 'pending').length,
    approved:  apps.filter((a) => a.status === 'approved').length,
    rejected:  apps.filter((a) => a.status === 'rejected').length,
    reviewing: apps.filter((a) => a.status === 'reviewing').length,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const { user } = useAuth();

  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [applications, setApplications] = useState([]);    // raw normalised
  const [filtered, setFiltered]   = useState([]);
  const [stats, setStats]         = useState({ total: 0, pending: 0, approved: 0, rejected: 0, reviewing: 0 });

  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy]           = useState('newest');
  const [expandedId, setExpandedId]   = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // ── Data fetching ────────────────────────────────────────────────────────────

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tenant/applications');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const normalised = (data.applications ?? []).map(normalise);
      setApplications(normalised);
      setStats(calcStats(normalised));
    } catch (err) {
      console.error('[ApplicationsPage]', err);
      setError(err.message);
      showToast('Error loading applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user, fetchApplications]);

  // ── Filtering / sorting ──────────────────────────────────────────────────────

  useEffect(() => {
    let result = [...applications];

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.property.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)  ||
          a.landlord.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.created_at - a.created_at);
        break;
      case 'oldest':
        result.sort((a, b) => a.created_at - b.created_at);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
    }

    setFiltered(result);
  }, [searchTerm, statusFilter, sortBy, applications]);

  // ── Withdraw ─────────────────────────────────────────────────────────────────

  const handleWithdraw = async (appId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawing(appId);
    try {
      const res = await fetch(`/api/tenant/applications/${appId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      // Optimistic update
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: 'withdrawn', statusText: 'Withdrawn' }
            : a
        )
      );
      showToast('Application withdrawn successfully');
    } catch (err) {
      showToast(err.message || 'Error withdrawing application', 'error');
    } finally {
      setWithdrawing(null);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────

  if (error && applications.length === 0) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center max-w-sm">
          <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-2">Failed to load applications</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchApplications}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background-light">

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50   text-red-800   border border-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircleSolid className="w-5 h-5 text-green-600" />
            : <XCircleIcon      className="w-5 h-5 text-red-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Sticky Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-primary/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <DocumentTextIcon className="w-8 h-8 text-primary" />
                My Applications
              </h1>
              <p className="text-slate-500 mt-1">Track the status of your rental applications</p>
            </div>
            <Link
              href="/property/search"
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Browse More Properties
            </Link>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {[
              { label: 'Total',     value: stats.total,     cls: 'bg-primary/5  text-primary  border-primary/10' },
              { label: 'Pending',   value: stats.pending,   cls: 'bg-amber-50   text-amber-600 border-amber-100' },
              { label: 'Reviewing', value: stats.reviewing, cls: 'bg-blue-50    text-blue-600  border-blue-100'  },
              { label: 'Approved',  value: stats.approved,  cls: 'bg-green-50   text-green-600 border-green-100' },
              { label: 'Rejected',  value: stats.rejected,  cls: 'bg-red-50     text-red-600   border-red-100'   },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`p-4 rounded-lg border ${cls}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Search / filter bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by property, location, or landlord…"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>

              <button
                onClick={fetchApplications}
                className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Application List ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Collapsed row */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Thumbnail */}
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      {app.image ? (
                        <img
                          src={app.image}
                          alt={app.property}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <DocumentTextIcon className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 truncate">{app.property}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                            {app.location}
                          </p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.statusText}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Monthly Rent</p>
                          <p className="text-sm font-bold text-primary">
                            BWP {app.price?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Applied</p>
                          <p className="text-sm font-medium">{app.appliedDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Landlord</p>
                          <p className="text-sm font-medium truncate">{app.landlord}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Response Time</p>
                          <p className="text-sm font-medium">
                            {app.status === 'pending' ? '2–3 days avg' : '1 day'}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        {expandedId === app.id
                          ? <ChevronUpIcon   className="w-5 h-5 text-slate-400" />
                          : <ChevronDownIcon className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === app.id && (
                  <div className="border-t border-slate-100 bg-slate-50 p-6">

                    {/* Timeline */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-slate-700 mb-4">Application Timeline</h4>
                      <div className="flex items-center justify-between">
                        {getTimelineSteps(app.status).map((step, index) => {
                          const Icon = step.icon;
                          return (
                            <div key={step.key} className="flex-1 relative">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  step.completed ? 'bg-green-500' :
                                  step.active    ? 'bg-primary'   : 'bg-slate-200'
                                }`}>
                                  <Icon className={`w-4 h-4 ${
                                    step.completed || step.active ? 'text-white' : 'text-slate-400'
                                  }`} />
                                </div>
                                <p className={`text-xs mt-2 ${
                                  step.active ? 'text-primary font-bold' : 'text-slate-500'
                                }`}>
                                  {step.label}
                                </p>
                              </div>
                              {index < 2 && (
                                <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                                  step.completed ? 'bg-green-500' : 'bg-slate-200'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <DocumentArrowUpIcon className="w-4 h-4" />
                        Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">ID Document (Omang)</p>
                              <p className="text-xs text-green-600">Verified</p>
                            </div>
                          </div>
                          <button className="text-primary text-xs font-bold hover:underline">View</button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <ClockIcon className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Proof of Income</p>
                              <p className="text-xs text-amber-600">Pending</p>
                            </div>
                          </div>
                          <button className="text-primary text-xs font-bold hover:underline">Upload</button>
                        </div>
                      </div>
                    </div>

                    {/* Landlord notes */}
                    {app.notes && (
                      <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-sm text-slate-600 italic">"{app.notes}"</p>
                        <p className="text-xs text-slate-400 mt-2">— Landlord note</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/property/${app.property_id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Property
                      </Link>

                      {app.landlordId && (
                        <Link
                          href={`/tenant/messages?landlord=${app.landlordId}`}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                        >
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          Message Landlord
                        </Link>
                      )}

                      {app.status === 'approved' && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
                          <CalendarIcon className="w-4 h-4" />
                          Schedule Move-in
                        </button>
                      )}

                      {(app.status === 'pending' || app.status === 'reviewing') && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          disabled={withdrawing === app.id}
                          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors ml-auto disabled:opacity-50"
                        >
                          {withdrawing === app.id ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircleIcon className="w-4 h-4" />
                          )}
                          Withdraw Application
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* ── Empty state ────────────────────────────────────────────────────── */
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentTextIcon className="w-12 h-12 text-primary/40" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {applications.length > 0 ? 'No matching applications' : 'No applications yet'}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              {applications.length > 0
                ? 'Try adjusting your search or filters.'
                : 'Start applying to properties you love. Your applications will appear here for easy tracking.'}
            </p>

            {applications.length === 0 && (
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
                    href="/tenant/saved"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    <EyeIcon className="w-5 h-5" />
                    View Saved Properties
                  </Link>
                </div>

                <div className="mt-12 max-w-2xl mx-auto">
                  <h4 className="font-bold mb-6">How Applications Work</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: DocumentTextIcon, title: '1. Submit Application', desc: 'Fill out the application form for properties you\'re interested in' },
                      { icon: ClockIcon,         title: '2. Landlord Review',    desc: 'Landlords review applications and documents' },
                      { icon: CheckCircleIcon,   title: '3. Get Response',       desc: 'Receive approval, schedule viewing, or move in' },
                    ].map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium mb-1">{title}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}