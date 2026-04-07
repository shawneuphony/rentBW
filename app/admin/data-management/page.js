// app/admin/data-management/page.js
'use client';

import { useState, useEffect } from 'react';
import {
  CircleStackIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function downloadCSV(rows, filename) {
  if (!rows?.length) return;
  const keys = Object.keys(rows[0]);
  const csv  = [
    keys.join(','),
    ...rows.map((r) =>
      keys.map((k) => {
        const v = r[k] ?? '';
        return typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))
          ? `"${v.replace(/"/g, '""')}"`
          : v;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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

// ── Dataset icon map ───────────────────────────────────────────────────────────

const DS_ICONS = {
  users:        { Icon: UsersIcon,                  color: 'text-blue-600',   bg: 'bg-blue-50'   },
  properties:   { Icon: BuildingOfficeIcon,          color: 'text-green-600',  bg: 'bg-green-50'  },
  applications: { Icon: DocumentTextIcon,            color: 'text-purple-600', bg: 'bg-purple-50' },
  messages:     { Icon: ChatBubbleLeftRightIcon,     color: 'text-amber-600',  bg: 'bg-amber-50'  },
};

// ── Data Preview Modal ─────────────────────────────────────────────────────────

function PreviewModal({ data, label, onClose }) {
  const [search, setSearch] = useState('');
  if (!data) return null;

  const keys    = data.length ? Object.keys(data[0]) : [];
  const filtered = data.filter((row) =>
    !search || Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold">{label} Data</h2>
            <p className="text-sm text-slate-500">{filtered.length} of {data.length} records</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition">
              <XCircleIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          {data.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No records found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {keys.map((k) => (
                    <th key={k} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.slice(0, 200).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {keys.map((k) => (
                      <td key={k} className="px-4 py-2.5 text-slate-700 max-w-xs truncate" title={String(row[k] ?? '')}>
                        {k === 'created_at' || k === 'updated_at'
                          ? formatDate(row[k])
                          : k === 'verified'
                          ? (row[k] ? '✓' : '✗')
                          : String(row[k] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
                {filtered.length > 200 && (
                  <tr>
                    <td colSpan={keys.length} className="px-4 py-3 text-center text-sm text-slate-400">
                      Showing first 200 rows — export CSV for full dataset
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminDataManagementPage() {
  const [datasets,    setDatasets]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState({ show: false, message: '', type: 'success' });
  const [busy,        setBusy]        = useState(null); // datasetId + action
  const [preview,     setPreview]     = useState(null); // { rows, label }
  const [purgeConfirm, setPurgeConfirm] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // ── Load datasets ─────────────────────────────────────────────────────────────

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/datasets', { credentials: 'include' });
      const data = await res.json();
      setDatasets(data.datasets ?? []);
    } catch {
      showToast('Failed to load datasets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDatasets(); }, []);

  // ── Export ────────────────────────────────────────────────────────────────────

  const handleExport = async (ds, format = 'csv') => {
    setBusy(ds.id + 'export');
    try {
      const res = await fetch('/api/admin/datasets', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'export', dataset: ds.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Export failed');
      const { rows } = await res.json();

      if (format === 'preview') {
        setPreview({ rows, label: ds.label });
      } else {
        downloadCSV(rows, `rentbw_${ds.id}_${new Date().toISOString().slice(0, 10)}.csv`);
        showToast(`Exported ${rows.length} ${ds.label.toLowerCase()} records`);
      }
    } catch (err) {
      showToast(err.message || 'Export failed', 'error');
    } finally {
      setBusy(null);
    }
  };

  // ── Purge ─────────────────────────────────────────────────────────────────────

  const handlePurge = async (ds) => {
    setBusy(ds.id + 'purge');
    try {
      const res = await fetch('/api/admin/datasets', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'purge', dataset: ds.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Purge failed');
      showToast(`${ds.label} data purged`);
      setPurgeConfirm(null);
      loadDatasets();
    } catch (err) {
      showToast(err.message || 'Purge failed', 'error');
    } finally {
      setBusy(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      {preview && (
        <PreviewModal rows={preview.rows} label={preview.label} onClose={() => setPreview(null)} />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Management</h1>
          <p className="text-slate-500 mt-1">View, export, and manage platform datasets</p>
        </div>
        <button onClick={loadDatasets} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50">
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary row */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {datasets.map((ds) => {
            const { Icon, color, bg } = DS_ICONS[ds.id] ?? { Icon: CircleStackIcon, color: 'text-slate-600', bg: 'bg-slate-100' };
            return (
              <div key={ds.id} className="bg-white p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{ds.count.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{ds.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dataset cards */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-500">Loading datasets…</p>
        </div>
      ) : (
        <div className="space-y-4">
          {datasets.map((ds) => {
            const { Icon, color, bg } = DS_ICONS[ds.id] ?? { Icon: CircleStackIcon, color: 'text-slate-600', bg: 'bg-slate-100' };
            const isBusy = busy?.startsWith(ds.id);
            const confirming = purgeConfirm === ds.id;

            return (
              <div key={ds.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${bg} flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{ds.label}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{ds.description}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {ds.count.toLocaleString()} records · Fields: {ds.exportFields.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleExport(ds, 'preview')}
                      disabled={isBusy}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      {busy === ds.id + 'export'
                        ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        : <MagnifyingGlassIcon className="w-4 h-4" />}
                      Preview
                    </button>

                    <button
                      onClick={() => handleExport(ds, 'csv')}
                      disabled={isBusy}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition disabled:opacity-50"
                    >
                      {busy === ds.id + 'export'
                        ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        : <ArrowDownTrayIcon className="w-4 h-4" />}
                      Export CSV
                    </button>

                    {ds.purgeable && !confirming && (
                      <button
                        onClick={() => setPurgeConfirm(ds.id)}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Purge
                      </button>
                    )}

                    {confirming && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                        <span className="text-xs text-red-700 font-medium">Purge all {ds.label.toLowerCase()}?</span>
                        <button
                          onClick={() => handlePurge(ds)}
                          disabled={isBusy}
                          className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                        >
                          {busy === ds.id + 'purge' ? '…' : 'Yes, Purge'}
                        </button>
                        <button
                          onClick={() => setPurgeConfirm(null)}
                          className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-700">Data Handling Notice</p>
            <p className="text-xs text-slate-500 mt-1">
              Exported files contain personal data and must be handled in accordance with Botswana's data protection regulations.
              Sensitive fields (passwords, documents) are excluded from all exports.
              Purge actions are irreversible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}