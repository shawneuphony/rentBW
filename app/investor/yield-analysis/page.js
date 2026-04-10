// app/investor/yield-analysis/page.js
'use client';

import { useState, useEffect } from 'react';
import {
  CalculatorIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  HomeIcon,
  BookmarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';
import { BarChart, ProgressBar } from '@/app/components/ui/Charts';

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

// ── Save report modal ──────────────────────────────────────────────────────────
function SaveModal({ params, onSave, onClose, saving }) {
  const [title, setTitle] = useState(`Yield Report — ${new Date().toLocaleDateString('en-GB')}`);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1">Save Report</h2>
        <p className="text-sm text-slate-500 mb-5">Give this analysis a name to reference later</p>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none mb-5"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button
            onClick={() => onSave(title)}
            disabled={saving || !title.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition disabled:opacity-50"
          >
            {saving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function YieldAnalysisPage() {
  // Calculator state (manual inputs)
  const [formData, setFormData] = useState({
    purchasePrice: 2500000,
    annualRent:    300000,
    expenses:      50000,
  });

  // Real DB data
  const [dbYields,    setDbYields]    = useState([]);
  const [dbLoading,   setDbLoading]   = useState(true);
  const [dbError,     setDbError]     = useState(null);

  // Filters for DB table
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');

  // Export
  const [exporting,   setExporting]   = useState(false);

  // Save
  const [showSave,    setShowSave]    = useState(false);
  const [saving,      setSaving]      = useState(false);

  const [toast,       setToast]       = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // ── Load DB yields ────────────────────────────────────────────────────────────
  const loadYields = async () => {
    setDbLoading(true);
    setDbError(null);
    try {
      const res = await fetch('/api/investor/yield', { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      const { yields } = await res.json();
      setDbYields(yields ?? []);
    } catch (err) {
      setDbError(err.message);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => { loadYields(); }, []);

  // ── Calculator ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleReset = () => setFormData({ purchasePrice: 2500000, annualRent: 300000, expenses: 50000 });

  const noi        = formData.annualRent - formData.expenses;
  const capRate    = formData.purchasePrice > 0 ? ((noi / formData.purchasePrice) * 100).toFixed(2) : '0.00';
  const cashOnCash = formData.purchasePrice > 0 ? (noi / formData.purchasePrice * 100).toFixed(2) : '0.00';

  // ── Market benchmarks from DB ─────────────────────────────────────────────────
  const avgDbYield    = dbYields.length
    ? (dbYields.reduce((s, y) => s + y.grossYield, 0) / dbYields.length).toFixed(1)
    : 8.0;
  const topYield      = dbYields.length ? dbYields[0]?.grossYield?.toFixed(1) : '—';
  const vsMarket      = (parseFloat(capRate) - parseFloat(avgDbYield)).toFixed(1);
  const vsMarketPos   = parseFloat(vsMarket) >= 0;

  // ── Filtered DB table ─────────────────────────────────────────────────────────
  const filtered = dbYields.filter((y) => {
    const matchSearch = !search || y.title?.toLowerCase().includes(search.toLowerCase()) || y.location?.toLowerCase().includes(search.toLowerCase());
    const matchType   = !typeFilter || y.type === typeFilter;
    return matchSearch && matchType;
  });

  const propertyTypes = [...new Set(dbYields.map(y => y.type).filter(Boolean))];

  // ── Export CSV ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/investor/export', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ format: 'csv', filters: typeFilter ? { type: typeFilter } : {} }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      a.download     = `rentbw_yield_report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export downloaded successfully');
    } catch (err) {
      showToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  // ── Save report ───────────────────────────────────────────────────────────────
  const handleSave = async (title) => {
    setSaving(true);
    try {
      const res = await fetch('/api/investor/saved-reports', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          type:   'yield',
          params: { formData, filters: { search, typeFilter }, timestamp: Date.now() },
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      setShowSave(false);
      showToast('Report saved successfully');
    } catch (err) {
      showToast(err.message || 'Failed to save report', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Bar chart data from DB ────────────────────────────────────────────────────
  const barData = dbYields.slice(0, 6).map(y => ({
    label: y.location?.split(',')[0]?.slice(0, 10) ?? '—',
    value: y.grossYield,
  }));

  return (
    <div className="space-y-8">
      <Toast toast={toast} />
      {showSave && (
        <SaveModal
          params={{ formData }}
          onSave={handleSave}
          onClose={() => setShowSave(false)}
          saving={saving}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Yield Analysis</h1>
          <p className="text-slate-500 mt-1">
            Analyze property returns and compare against live Gaborone market data.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSave(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition"
          >
            <BookmarkIcon className="w-4 h-4" />
            Save Report
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition disabled:opacity-60"
          >
            {exporting
              ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
              : <ArrowDownTrayIcon className="w-4 h-4" />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Market snapshot from DB */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Listings', value: dbYields.length, Icon: BuildingOfficeIcon, color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Avg Gross Yield', value: `${avgDbYield}%`, Icon: ArrowTrendingUpIcon, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Top Yield',        value: topYield ? `${topYield}%` : '—', Icon: CheckCircleIcon, color: 'text-primary',   bg: 'bg-primary/10' },
          { label: 'Your Cap Rate',    value: `${capRate}%`, Icon: CalculatorIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Calculator Panel ─────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5 text-primary" />
                Yield Calculator
              </h3>
              <button onClick={handleReset} className="text-xs text-primary font-bold hover:underline">
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Purchase Price (BWP)',      name: 'purchasePrice' },
                { label: 'Annual Rent (BWP)',          name: 'annualRent' },
                { label: 'Operating Expenses (BWP/yr)', name: 'expenses' },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">BWP</span>
                    <input
                      type="number" name={name} value={formData[name]} onChange={handleChange}
                      className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary uppercase">Net Operating Income</p>
                  <p className="text-2xl font-black text-primary">BWP {noi.toLocaleString()}</p>
                </div>
                <CalculatorIcon className="w-8 h-8 text-primary/30" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Cap Rate</p>
                    <InformationCircleIcon className="w-3 h-3 text-slate-400" title="NOI / Purchase Price" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{capRate}%</p>
                  <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${vsMarketPos ? 'text-green-600' : 'text-red-500'}`}>
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                    {vsMarketPos ? '+' : ''}{vsMarket}% vs avg ({avgDbYield}%)
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Cash-on-Cash ROI</p>
                    <InformationCircleIcon className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{cashOnCash}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Gross estimate (pre-tax)</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-primary mb-2">
                  <span className="flex items-center gap-1">
                    <ArrowTrendingUpIcon className="w-4 h-4" /> Your Property vs Market
                  </span>
                  <span>{capRate}% / {avgDbYield}% avg</span>
                </div>
                <div className="w-full bg-slate-100 h-8 rounded-full overflow-hidden border border-primary/10 p-0.5">
                  <div
                    className={`h-full rounded-full flex items-center justify-center text-[10px] text-white font-bold transition-all ${vsMarketPos ? 'bg-primary' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, Math.max(5, parseFloat(capRate) * 10))}%` }}
                  >
                    {vsMarketPos ? 'ABOVE MARKET' : 'BELOW MARKET'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Comparison Panel ──────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Bar chart — real DB data */}
          {!dbLoading && barData.length > 0 && (
            <BarChart
              title="Top Properties by Gross Yield"
              subtitle={`Live data — ${dbYields.length} active listings`}
              data={barData}
            />
          )}

          {dbLoading && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                <p className="text-sm text-slate-500">Loading market data…</p>
              </div>
            </div>
          )}

          {dbError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">{dbError}</p>
                <button onClick={loadYields} className="text-xs text-red-600 hover:underline mt-1">Retry</button>
              </div>
            </div>
          )}

          {/* Sector benchmarks */}
          {!dbLoading && dbYields.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold">Market Benchmarks</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Average gross yield by location — live DB</p>
                </div>
                <button onClick={loadYields} className="p-1.5 hover:bg-slate-100 rounded-lg transition" title="Refresh">
                  <ArrowPathIcon className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                {(() => {
                  // Group by location prefix and average yields
                  const groups = {};
                  dbYields.forEach(y => {
                    const loc = y.location?.split(',')[0] ?? 'Other';
                    if (!groups[loc]) groups[loc] = [];
                    groups[loc].push(y.grossYield);
                  });
                  return Object.entries(groups)
                    .map(([loc, yields]) => ({
                      loc,
                      avg: yields.reduce((s, v) => s + v, 0) / yields.length,
                      count: yields.length,
                    }))
                    .sort((a, b) => b.avg - a.avg)
                    .slice(0, 5)
                    .map(({ loc, avg, count }) => (
                      <div key={loc}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{loc} <span className="text-xs text-slate-400">({count} listings)</span></span>
                          <span className="font-bold text-primary">{avg.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, avg * 8)}%` }} />
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Live properties table ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold">Live Property Yields</h3>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} of {dbYields.length} active listings</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search title or location…"
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {propertyTypes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <FunnelIcon className="w-4 h-4 text-slate-400" />
                <select
                  value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Types</option>
                  {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {dbLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading properties…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BuildingOfficeIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">{dbYields.length === 0 ? 'No active properties in database' : 'No properties match your filter'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {['Property', 'Location', 'Type', 'Monthly Rent', 'Est. Value', 'Gross Yield', 'Beds'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((y, i) => (
                  <tr key={y.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${i < 3 ? 'bg-primary' : 'bg-slate-200'}`} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 max-w-[180px] truncate">{y.title}</p>
                          {i === 0 && <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Top Yield</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPinIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="max-w-[120px] truncate">{y.location}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full capitalize">
                        {y.type ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-900">
                      BWP {y.price?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      BWP {y.estimatedValue?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${y.grossYield >= parseFloat(avgDbYield) ? 'text-green-600' : 'text-slate-700'}`}>
                          {y.grossYield}%
                        </span>
                        {y.grossYield >= parseFloat(avgDbYield) && (
                          <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 flex items-center gap-1">
                      <HomeIcon className="w-3.5 h-3.5 text-slate-400" />
                      {y.beds ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}