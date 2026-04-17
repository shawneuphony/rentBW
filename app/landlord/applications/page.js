// app/landlord/applications/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  FunnelIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid, XCircleIcon as XCircleSolid } from '@heroicons/react/24/solid';

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: 'Pending', bg: 'bg-amber-100 text-amber-700', Icon: ClockIcon },
    approved: { label: 'Approved', bg: 'bg-green-100 text-green-700', Icon: CheckCircleIcon },
    rejected: { label: 'Rejected', bg: 'bg-red-100 text-red-700', Icon: XCircleIcon },
  };
  const { label, bg, Icon } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${bg}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

export default function LandlordApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [actionBusy, setActionBusy] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (propertyFilter) params.set('propertyId', propertyFilter);
      
      const res = await fetch(`/api/landlord/applications?${params}`, { credentials: 'include' });
      const data = await res.json();
      setApplications(data.applications || []);
      setProperties(data.properties || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, propertyFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setActionBusy(applicationId);
    try {
      const res = await fetch('/api/landlord/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ applicationId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus, updated_at: Date.now() } : app
        )
      );
      showToast(`Application ${newStatus === 'approved' ? 'approved' : 'rejected'}`);
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setActionBusy(null);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckSolid className="w-5 h-5 text-green-600" />
            : <XCircleSolid className="w-5 h-5 text-red-600" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Applications</h1>
          <p className="text-text-muted mt-1">Review and manage tenant applications for your properties</p>
        </div>
        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-4 py-2 border border-border-light rounded-lg text-sm font-medium hover:bg-surface transition"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: '#c8a96e', bg: 'bg-accent/10' },
          { label: 'Pending', value: stats.pending, color: '#d97706', bg: 'bg-amber-50' },
          { label: 'Approved', value: stats.approved, color: '#10b981', bg: 'bg-green-50' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444', bg: 'bg-red-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-border-light text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-border-light flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-muted">Filter by:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: `All (${stats.total})` },
            { key: 'pending', label: `Pending (${stats.pending})` },
            { key: 'approved', label: `Approved (${stats.approved})` },
            { key: 'rejected', label: `Rejected (${stats.rejected})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                statusFilter === key
                  ? 'bg-accent text-white'
                  : 'bg-surface text-ink-soft hover:bg-accent/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {properties.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <BuildingOfficeIcon className="w-4 h-4 text-text-muted" />
            <select
              value={propertyFilter}
              onChange={e => setPropertyFilter(e.target.value)}
              className="px-3 py-1.5 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-16 text-center">
          <DocumentTextIcon className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No applications yet</h3>
          <p className="text-text-muted">
            {statusFilter !== 'all'
              ? `No ${statusFilter} applications match your filters.`
              : 'Tenants will appear here when they apply to your properties.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-border-light overflow-hidden">
              {/* Header */}
              <div
                className="p-5 cursor-pointer hover:bg-surface/50 transition-colors"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Tenant Avatar */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-base flex-shrink-0">
                      {getInitials(app.tenant_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold font-display">{app.tenant_name}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-sm text-accent truncate">{app.property_title}</p>
                      <p className="text-xs text-text-muted mt-1">{app.property_location}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-text-muted">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>Applied {formatDate(app.created_at)}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-1 text-text-muted">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>BWP {app.property_price?.toLocaleString()}/mo</span>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 text-text-muted transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === app.id && (
                <div className="border-t border-border-light p-5 bg-surface">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tenant Info */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-accent" />
                        Tenant Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-text-muted" />
                          <a href={`mailto:${app.tenant_email}`} className="text-accent hover:underline">
                            {app.tenant_email}
                          </a>
                        </div>
                        {app.tenant_phone && (
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-text-muted" />
                            <span>{app.tenant_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Application Notes */}
                    {app.notes && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Applicant Message</h4>
                        <p className="text-sm text-ink-soft bg-white p-3 rounded-xl border border-border-light italic">
                          "{app.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border-light">
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(app.id, 'approved');
                          }}
                          disabled={actionBusy === app.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          {actionBusy === app.id ? 'Processing...' : 'Approve Application'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(app.id, 'rejected');
                          }}
                          disabled={actionBusy === app.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          {actionBusy === app.id ? 'Processing...' : 'Reject Application'}
                        </button>
                      </>
                    )}
                    <Link
                      href={`/property/${app.property_id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-border-light rounded-lg text-sm font-medium hover:bg-white transition"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Property
                    </Link>
                    <Link
                      href={`/landlord/messages?tenant=${app.tenant_id}&property=${app.property_id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-border-light rounded-lg text-sm font-medium hover:bg-white transition"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      Message Tenant
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}