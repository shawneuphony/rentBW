// app/admin/dashboard/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  HomeIcon,
  FlagIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, XCircleIcon as XCircleSolid } from '@heroicons/react/24/solid';
import { BarChart, DoughnutChart } from '@/app/components/ui/Charts';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
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
        ? <CheckCircleSolid className="w-5 h-5 text-green-600 flex-shrink-0" />
        : <XCircleSolid     className="w-5 h-5 text-red-600   flex-shrink-0" />}
      <span className="text-sm">{toast.message}</span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user }  = useAuth();
  const router    = useRouter();

  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [data,       setData]       = useState(null);
  const [actionBusy, setActionBusy] = useState(null); // userId being actioned
  const [toast,      setToast]      = useState({ show: false, message: '', type: 'success' });

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') router.push(`/${user.role}/dashboard`);
  }, [user, router]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('[AdminDashboard]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user?.role === 'admin') fetchDashboard(); }, [user, fetchDashboard]);

  // ── User actions ───────────────────────────────────────────────────────────

  const handleUserAction = async (userId, action) => {
    setActionBusy(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId, action }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      const { user: updated } = await res.json();

      // Optimistically update recentUsers list
      setData((prev) => ({
        ...prev,
        recentUsers: prev.recentUsers.map((u) =>
          u.id === userId ? { ...u, verified: updated.verified } : u
        ),
        stats: {
          ...prev.stats,
          pendingVerification:
            action === 'approve'
              ? Math.max(0, prev.stats.pendingVerification - 1)
              : prev.stats.pendingVerification,
        },
      }));

      showToast(`User ${action}d successfully`);
    } catch (err) {
      showToast(err.message || `Failed to ${action} user`, 'error');
    } finally {
      setActionBusy(null);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { stats, weeklySignups, recentUsers, recentProperties } = data;

  const kpiCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      sub:   `${stats.tenants} tenants · ${stats.landlords} landlords`,
      icon:  UsersIcon,
      trend: 'up',
      change: `+${stats.tenants + stats.landlords}`,
    },
    {
      label: 'Active Listings',
      value: stats.activeListings.toLocaleString(),
      sub:   `${stats.pendingListings} pending approval`,
      icon:  HomeIcon,
      trend: 'up',
      change: `${stats.pendingListings} pending`,
    },
    {
      label: 'Pending Verification',
      value: stats.pendingVerification.toLocaleString(),
      sub:   'Users awaiting ID check',
      icon:  FlagIcon,
      trend: stats.pendingVerification > 10 ? 'warning' : 'up',
      change: stats.pendingVerification > 10 ? 'High' : 'Normal',
    },
    {
      label: 'Total Messages',
      value: stats.totalMessages.toLocaleString(),
      sub:   `${stats.unreadMessages} unread`,
      icon:  ChatBubbleLeftIcon,
      trend: 'up',
      change: `${stats.unreadMessages} unread`,
    },
  ];

  // Active rate: verified users / total
  const activeRate = stats.totalUsers > 0
    ? Math.round((stats.totalUsers - stats.pendingVerification) / stats.totalUsers * 100)
    : 0;

  return (
    <div className="space-y-8">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time intelligence for the Gaborone rental ecosystem.</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          title="Refresh"
        >
          <ArrowPathIcon className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl border border-primary/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-6 h-6 text-primary" />
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  card.trend === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-500 mt-1">{card.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Platform Growth */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-primary/10 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold">Platform Growth</h3>
              <p className="text-xs text-slate-500">New user signups — last 4 weeks</p>
            </div>
          </div>
          <BarChart data={weeklySignups} title="" />
        </div>

        {/* User Engagement */}
        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <h3 className="font-bold mb-6">User Verification</h3>
          <div className="flex flex-col items-center">
            <DoughnutChart percentage={activeRate} label="Verified Rate" />

            <div className="w-full mt-8 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Verified Users</span>
                  <span className="font-bold">{stats.totalUsers - stats.pendingVerification}</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${activeRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Applications Approved</span>
                  <span className="font-bold">{stats.approvedApplications}</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: stats.totalApplications > 0
                        ? `${Math.round(stats.approvedApplications / stats.totalApplications * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Pending Listings</span>
                  <span className="font-bold">{stats.pendingListings}</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{
                      width: (stats.activeListings + stats.pendingListings) > 0
                        ? `${Math.round(stats.pendingListings / (stats.activeListings + stats.pendingListings) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
        <div className="p-6 border-b border-primary/5 flex justify-between items-center">
          <div>
            <h3 className="font-bold">Recent Users</h3>
            <p className="text-xs text-slate-500">Latest registrations — approve or suspend accounts</p>
          </div>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors"
          >
            View All Users
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5">
              <tr>
                {['User Details', 'Role', 'Joined', 'Verification', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-xs font-bold text-primary/60 uppercase ${
                      h === 'Actions' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                    {/* User details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs flex-shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium capitalize text-primary/70 px-2 py-1 bg-primary/5 rounded-full">
                        {u.role}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(u.created_at)}
                    </td>

                    {/* Verification */}
                    <td className="px-6 py-4">
                      {u.verified ? (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-black rounded uppercase bg-amber-100 text-amber-700">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2">
                      {u.role !== 'admin' && (
                        <>
                          {!u.verified && (
                            <button
                              onClick={() => handleUserAction(u.id, 'approve')}
                              disabled={actionBusy === u.id}
                              className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary/90 transition disabled:opacity-50"
                            >
                              {actionBusy === u.id ? '…' : 'Approve'}
                            </button>
                          )}
                          {u.verified && (
                            <button
                              onClick={() => handleUserAction(u.id, 'suspend')}
                              disabled={actionBusy === u.id}
                              className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-md hover:bg-red-200 transition disabled:opacity-50"
                            >
                              {actionBusy === u.id ? '…' : 'Suspend'}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
        <div className="p-6 border-b border-primary/5 flex justify-between items-center">
          <div>
            <h3 className="font-bold">Recent Listings</h3>
            <p className="text-xs text-slate-500">Latest properties submitted for approval</p>
          </div>
          <Link
            href="/admin/moderation"
            className="px-4 py-2 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors"
          >
            View Moderation
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5">
              <tr>
                {['Property', 'Landlord', 'Submitted', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-primary/60 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {recentProperties.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-400">
                    No properties found
                  </td>
                </tr>
              ) : (
                recentProperties.map((p) => (
                  <tr key={p.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/property/${p.id}`} className="text-sm font-bold text-primary hover:underline">
                        {p.title}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        BWP {p.price?.toLocaleString()}/mo · {p.location}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {p.landlord_name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-black rounded uppercase ${
                        p.status === 'active'  ? 'bg-green-100 text-green-700' :
                        p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}