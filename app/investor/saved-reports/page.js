// app/investor/saved-reports/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BookmarkIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  MapIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';

// ── Helpers ────────────────────────────────────────────────────────────────────
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

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
      toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {toast.type === 'success' ? <CheckSolid className="w-5 h-5 text-green-600" /> : <XCircleIcon className="w-5 h-5 text-red-600" />}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}

// ── Type config ────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  yield:       { label: 'Yield Analysis',      Icon: ChartBarIcon,    color: 'text-green-600',  bg: 'bg-green-50',  href: '/investor/yield-analysis' },
  geospatial:  { label: 'Geospatial Explorer',  Icon: MapIcon,         color: 'text-blue-600',   bg: 'bg-blue-50',   href: '/investor/geospatial' },
  market:      { label: 'Market Overview',      Icon: DocumentTextIcon, color: 'text-purple-600', bg: 'bg-purple-50', href: '/investor/dashboard' },
};

// ── Report card ────────────────────────────────────────────────────────────────
function ReportCard({ report, onDelete, onExport, deleteConfirm, setDeleteConfirm, busy }) {
  const cfg = TYPE_CONFIG[report.type] ?? TYPE_CONFIG.yield;
  const { Icon } = cfg;
  const confirming = deleteConfirm === report.id;

  const params = report.params ?? {};
  const hasCalc = params.formData;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-2.5 rounded-xl ${cfg.bg} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 truncate">{report.title}</h3>
              <p className={`text-xs font-medium mt-0.5 ${cfg.color}`}>{cfg.label}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onExport(report)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600"
                title="Download params as JSON"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </button>
              {!confirming ? (
                <button
                  onClick={() => setDeleteConfirm(report.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition text-slate-400 hover:text-red-500"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDelete(report.id)}
                    disabled={busy === report.id}
                    className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                  >
                    {busy === report.id ? '…' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Params summary */}
          {hasCalc && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: 'Purchase Price', value: `BWP ${params.formData.purchasePrice?.toLocaleString()}` },
                { label: 'Annual Rent',    value: `BWP ${params.formData.annualRent?.toLocaleString()}` },
                { label: 'Cap Rate',       value: `${params.formData.purchasePrice > 0 ? (((params.formData.annualRent - params.formData.expenses) / params.formData.purchasePrice) * 100).toFixed(1) : '0.0'}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{label}</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDaysIcon className="w-3.5 h-3.5" />
              Saved {formatDateRelative(report.created_at)}
            </div>
            <Link
              href={cfg.href}
              className="text-xs font-bold text-primary hover:underline"
            >
              Open Analysis →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SavedReportsPage() {
  const [reports,       setReports]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [toast,         setToast]         = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [busy,          setBusy]          = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/investor/saved-reports', { credentials: 'include' });
      const data = await res.json();
      setReports(data.reports ?? []);
    } catch {
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    setBusy(id);
    try {
      const res = await fetch('/api/investor/saved-reports', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setReports(prev => prev.filter(r => r.id !== id));
      setDeleteConfirm(null);
      showToast('Report deleted');
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleExport = (report) => {
    downloadJSON(report, `rentbw_report_${report.id.slice(0, 8)}.json`);
    showToast('Report params downloaded');
  };

  const filtered = typeFilter === 'all' ? reports : reports.filter(r => r.type === typeFilter);
  const countBy  = (t) => reports.filter(r => r.type === t).length;

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Saved Reports</h1>
          <p className="text-slate-500 mt-1">Your saved analyses and yield snapshots</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link href="/investor/yield-analysis"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition">
            <PlusIcon className="w-4 h-4" />
            New Analysis
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Saved',       value: reports.length,          Icon: BookmarkSolid,  color: 'text-primary',    bg: 'bg-primary/10' },
            { label: 'Yield Reports',     value: countBy('yield'),         Icon: ChartBarIcon,   color: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Geospatial Views',  value: countBy('geospatial'),    Icon: MapIcon,        color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Market Reports',    value: countBy('market'),        Icon: DocumentTextIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {reports.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'all',         label: `All (${reports.length})` },
            { key: 'yield',       label: `Yield (${countBy('yield')})` },
            { key: 'geospatial',  label: `Geospatial (${countBy('geospatial')})` },
            { key: 'market',      label: `Market (${countBy('market')})` },
          ].map(({ key, label }) => (
            <button key={key}
              onClick={() => setTypeFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                typeFilter === key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-500">Loading reports…</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <BookmarkIcon className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No saved reports yet</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Run a yield analysis and click <strong>Save Report</strong> to keep a snapshot for future reference.
          </p>
          <Link href="/investor/yield-analysis"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition">
            <PlusIcon className="w-5 h-5" />
            Start a Yield Analysis
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-500 text-sm">No {typeFilter} reports saved</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={handleDelete}
              onExport={handleExport}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              busy={busy}
            />
          ))}
        </div>
      )}

      {/* Info note */}
      {reports.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500">
            Reports save your calculator inputs and filter settings as a snapshot. Market data is live — click
            <strong> Open Analysis</strong> to re-run the analysis with current property data.
          </p>
        </div>
      )}
    </div>
  );
}