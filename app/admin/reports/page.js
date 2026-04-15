// app/admin/reports/page.js
'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';
import { BarChart } from '@/app/components/ui/Charts';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function downloadCSV(rows, filename) {
  if (!rows?.length) return;
  const keys = Object.keys(rows[0]);
  const esc  = v => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n');
  const a   = Object.assign(document.createElement('a'), {
    href:     URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: filename,
  });
  a.click();
  URL.revokeObjectURL(a.href);
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

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className={`inline-flex p-2.5 rounded-xl ${bg} ${color} mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Report section with export button ─────────────────────────────────────────
function ReportSection({ title, description, icon: Icon, datasetId, onExport, busy }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
      <div className="p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onExport(datasetId)}
        disabled={busy === datasetId}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium
                   hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
      >
        {busy === datasetId
          ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
          : <ArrowDownTrayIcon className="w-4 h-4" />}
        {busy === datasetId ? 'Exporting…' : 'Export CSV'}
      </button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [busy,    setBusy]    = useState(null);
  const [toast,   setToast]   = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Failed to load');
        setStats(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (dataset) => {
    setBusy(dataset);
    try {
      const res  = await fetch('/api/admin/datasets', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'export', dataset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Export failed');
      downloadCSV(data.rows, `rentbw_${dataset}_${new Date().toISOString().slice(0, 10)}.csv`);
      showToast(`Exported ${data.count} ${dataset} records`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-500">Loading report data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const s = stats?.stats ?? {};

  // Weekly signups chart data
  const signupChartData = (stats?.weeklySignups ?? []).map(w => ({
    label: w.label,
    value: w.value,
  }));

  // Application status breakdown for a simple inline chart
  const appBreakdown = [
    { label: 'Pending',  value: s.pendingApplications   ?? 0, color: 'bg-amber-400' },
    { label: 'Approved', value: s.approvedApplications  ?? 0, color: 'bg-green-500' },
    { label: 'Other',    value: Math.max(0, (s.totalApplications ?? 0) - (s.pendingApplications ?? 0) - (s.approvedApplications ?? 0)), color: 'bg-slate-300' },
  ];
  const appTotal = appBreakdown.reduce((n, a) => n + a.value, 0);

  return (
    <div className="space-y-8">
      <Toast toast={toast} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Platform Reports</h1>
        <p className="text-slate-500 mt-1">Platform-wide metrics and data exports</p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UsersIcon}
          label="Total users"
          value={s.totalUsers ?? 0}
          sub={`${s.tenants ?? 0} tenants · ${s.landlords ?? 0} landlords · ${s.investors ?? 0} investors`}
        />
        <StatCard
          icon={BuildingOfficeIcon}
          label="Active listings"
          value={s.activeListings ?? 0}
          sub={`${s.pendingListings ?? 0} pending approval`}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={DocumentTextIcon}
          label="Applications"
          value={s.totalApplications ?? 0}
          sub={`${s.pendingApplications ?? 0} awaiting decision`}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          icon={ChatBubbleLeftRightIcon}
          label="Messages"
          value={s.totalMessages ?? 0}
          sub={`${s.unreadMessages ?? 0} unread`}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Weekly signups chart + application breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Signups */}
        {signupChartData.length > 0 && (
          <BarChart
            data={signupChartData}
            title="New Signups — Last 4 Weeks"
            subtitle="All roles combined"
          />
        )}

        {/* Application breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Application Status</h2>
          <p className="text-xs text-slate-400 mb-6">{appTotal} total applications</p>
          <div className="space-y-5">
            {appBreakdown.map((a, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{a.label}</span>
                  <span className="font-bold text-slate-900">{a.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${a.color}`}
                    style={{ width: appTotal > 0 ? `${Math.round((a.value / appTotal) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* User role breakdown */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Tenants',   value: s.tenants   ?? 0 },
              { label: 'Landlords', value: s.landlords ?? 0 },
              { label: 'Investors', value: s.investors ?? 0 },
            ].map((r, i) => (
              <div key={i}>
                <p className="text-xl font-bold text-slate-900">{r.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users table */}
      {stats?.recentUsers?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Recent Registrations</h2>
            <span className="text-xs text-slate-400">5 most recent</span>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-6 py-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                  u.role === 'tenant'   ? 'bg-blue-100 text-blue-700'   :
                  u.role === 'landlord' ? 'bg-green-100 text-green-700' :
                  u.role === 'investor' ? 'bg-amber-100 text-amber-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {u.role}
                </span>
                <span className={`flex items-center gap-1 text-xs ${u.verified ? 'text-green-600' : 'text-slate-400'}`}>
                  {u.verified
                    ? <CheckCircleIcon className="w-4 h-4" />
                    : <ClockIcon       className="w-4 h-4" />}
                  {u.verified ? 'Verified' : 'Pending'}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block">{formatDate(u.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent listings table */}
      {stats?.recentProperties?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Recent Listings</h2>
            <span className="text-xs text-slate-400">5 most recent</span>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentProperties.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <BuildingOfficeIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.location} · by {p.landlord_name}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  p.status === 'active'   ? 'bg-green-100 text-green-700' :
                  p.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                  p.status === 'rejected' ? 'bg-red-100 text-red-700'     :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {p.status}
                </span>
                <span className="text-sm font-bold text-slate-900 hidden sm:block">
                  BWP {Number(p.price).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block">{formatDate(p.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data exports */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Export Reports</h2>
        <div className="space-y-3">
          <ReportSection
            title="User Report"
            description="All registered users — name, email, role, verification status"
            icon={UsersIcon}
            datasetId="users"
            onExport={handleExport}
            busy={busy}
          />
          <ReportSection
            title="Listings Report"
            description="All property listings across all statuses — location, price, type, landlord"
            icon={BuildingOfficeIcon}
            datasetId="properties"
            onExport={handleExport}
            busy={busy}
          />
          <ReportSection
            title="Applications Report"
            description="All rental applications — tenant, property, status, notes"
            icon={DocumentTextIcon}
            datasetId="applications"
            onExport={handleExport}
            busy={busy}
          />
          <ReportSection
            title="Messages Report"
            description="All platform messages — sender, receiver, property, content"
            icon={ChatBubbleLeftRightIcon}
            datasetId="messages"
            onExport={handleExport}
            busy={busy}
          />
        </div>
      </div>
    </div>
  );
}