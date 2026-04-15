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
  CalendarIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

function normalise(app) {
  let firstImage = null;
  if (app.images) {
    try {
      const parsed = JSON.parse(app.images);
      if (Array.isArray(parsed) && parsed.length > 0) firstImage = parsed[0];
    } catch (e) {}
  }
  return {
    ...app,
    property: app.property_title ?? 'Unknown Property',
    location: app.location ?? '',
    landlord: app.landlord_name ?? 'Unknown Landlord',
    landlordId: app.landlord_id,
    price: app.price ?? 0,
    appliedDate: app.created_at
      ? new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—',
    image: firstImage,
    statusText: getStatusText(app.status),
  };
}

function getStatusText(status) {
  switch (status) {
    case 'pending': return 'Under Review';
    case 'reviewing': return 'Documents Pending';
    case 'approved': return 'Approved';
    case 'rejected': return 'Not Selected';
    case 'withdrawn': return 'Withdrawn';
    default: return status ?? '—';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'pending': return '#d97706';
    case 'reviewing': return '#2563eb';
    case 'approved': return '#10b981';
    case 'rejected': return '#ef4444';
    default: return '#6b6b6b';
  }
}

function getStatusBg(status) {
  switch (status) {
    case 'pending': return '#fef3c7';
    case 'reviewing': return '#dbeafe';
    case 'approved': return '#d1fae5';
    case 'rejected': return '#fee2e2';
    default: return '#f3f4f6';
  }
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/applications');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setApplications((data.applications ?? []).map(normalise));
    } catch (err) {
      setError(err.message);
      showToast('Error loading applications', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user, fetchApplications]);

  const handleWithdraw = async (appId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawing(appId);
    try {
      const res = await fetch(`/api/tenant/applications/${appId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'withdrawn', statusText: 'Withdrawn' } : a));
      showToast('Application withdrawn');
    } catch {
      showToast('Error withdrawing application', 'error');
    } finally {
      setWithdrawing(null);
    }
  };

  const filtered = applications.filter(app => {
    const matchesSearch = !searchTerm ||
      app.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && applications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Failed to load applications</h3>
        <p className="text-text-muted mb-4">{error}</p>
        <button onClick={fetchApplications} className="btn-primary px-6 py-2">Try again</button>
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display">My Applications</h1>
          <p className="text-text-muted mt-1">Track the status of your rental applications</p>
        </div>
        <Link href="/property/search" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5">
          Browse Properties <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending, color: '#d97706' },
          { label: 'Reviewing', value: stats.reviewing, color: '#2563eb' },
          { label: 'Approved', value: stats.approved, color: '#10b981' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 text-center border border-border-light">
            <p className="text-2xl font-bold" style={{ color: stat.color || '#c8a96e' }}>{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by property or location..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-border-light rounded-full focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-5 py-3 bg-white border border-border-light rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <button onClick={fetchApplications} className="p-3 bg-white border border-border-light rounded-full hover:bg-surface transition-colors">
          <ArrowPathIcon className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      {/* Applications List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(app => (
            <div key={app.id} className="bg-white rounded-2xl border border-border-light overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-surface/50 transition-colors"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Thumbnail */}
                  <div className="w-full md:w-32 h-24 rounded-xl bg-surface overflow-hidden flex-shrink-0">
                    {app.image ? (
                      <img src={app.image} alt={app.property} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <DocumentTextIcon className="w-8 h-8 text-text-muted/50" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <h3 className="text-lg font-bold font-display">{app.property}</h3>
                      <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: getStatusBg(app.status), color: getStatusColor(app.status) }}>
                        {app.statusText}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted flex items-center gap-1 mb-3">
                      <MapPinIcon className="w-4 h-4" /> {app.location}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="font-bold text-accent">BWP {app.price.toLocaleString()}/mo</span>
                      <span className="text-text-muted">Applied {app.appliedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {expandedId === app.id ? (
                      <ChevronUpIcon className="w-5 h-5 text-text-muted" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                </div>
              </div>

              {expandedId === app.id && (
                <div className="border-t border-border-light p-5 bg-surface">
                  {/* Timeline */}
                  <div className="flex justify-between mb-6">
                    {['Submitted', 'Review', 'Decision'].map((step, i) => (
                      <div key={step} className="flex-1 text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${i < 2 ? 'bg-accent' : 'bg-text-muted/30'}`} />
                        <p className="text-xs font-medium text-text-muted">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/property/${app.property_id}`} className="flex items-center gap-2 px-4 py-2 bg-white border border-border-light rounded-full text-sm font-medium hover:border-accent transition-colors">
                      <EyeIcon className="w-4 h-4" /> View Property
                    </Link>
                    {app.landlordId && (
                      <Link href={`/tenant/messages?landlord=${app.landlordId}`} className="flex items-center gap-2 px-4 py-2 bg-white border border-border-light rounded-full text-sm font-medium hover:border-accent transition-colors">
                        <ChatBubbleLeftIcon className="w-4 h-4" /> Message Landlord
                      </Link>
                    )}
                    {/* 🔧 FIX (Bug 4): Only show withdraw for 'pending' status (not 'reviewing' because backend never sets it) */}
                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawing === app.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition-colors ml-auto"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        {withdrawing === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border-light">
          <DocumentTextIcon className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display mb-2">No applications yet</h2>
          <p className="text-text-muted mb-6">Start applying to properties you love.</p>
          <Link href="/property/search" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            Browse Properties <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-border-light">
          <MagnifyingGlassIcon className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No matching applications</h3>
          <p className="text-text-muted">Try adjusting your search or filters.</p>
          <button onClick={() => setSearchTerm('')} className="text-accent mt-4 underline">Clear search</button>
        </div>
      )}
    </div>
  );
}