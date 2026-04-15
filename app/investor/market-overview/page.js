// app/investor/market-overview/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  HomeIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { BarChart, ProgressBar } from '@/app/components/ui/Charts';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatPrice(p) {
  if (!p) return 'BWP 0';
  if (p >= 1_000_000) return `BWP ${(p / 1_000_000).toFixed(1)}M`;
  if (p >= 1_000)     return `BWP ${(p / 1_000).toFixed(0)}K`;
  return `BWP ${p}`;
}

const TYPE_LABELS = {
  apartment:  'Apartment',
  house:      'House',
  studio:     'Studio',
  townhouse:  'Townhouse',
  commercial: 'Commercial',
};

const TYPE_COLORS = {
  apartment:  'bg-blue-500',
  house:      'bg-green-500',
  studio:     'bg-purple-500',
  townhouse:  'bg-teal-500',
  commercial: 'bg-orange-500',
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-primary/10 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MarketOverviewPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch('/api/investor/stats', { credentials: 'include' })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Failed to load');
        setStats(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-500">Loading market data…</p>
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

  const { marketStats, districts, propertyTypes, monthlyTrends, topProperties } = stats ?? {};

  // Prepare bar chart data for monthly listing activity
  const trendChartData = (monthlyTrends ?? []).map(t => ({
    label: t.month?.slice(5) ?? '',   // "MM" only
    value: t.listings ?? 0,
  }));

  // Total count for property type distribution
  const typeTotal = (propertyTypes ?? []).reduce((s, t) => s + t.count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Market Overview</h1>
          <p className="text-slate-500 mt-1">Live snapshot of the Botswana rental market</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/investor/yield-analysis"
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors"
          >
            <ChartBarIcon className="w-4 h-4" />
            Yield Analysis
          </Link>
          <Link
            href="/investor/geospatial"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <MapPinIcon className="w-4 h-4" />
            Map Explorer
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BuildingOfficeIcon}
          label="Active listings"
          value={marketStats?.totalProperties ?? 0}
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Average monthly rent"
          value={formatPrice(marketStats?.avgPrice)}
          sub="Across all active listings"
        />
        <StatCard
          icon={ArrowTrendingUpIcon}
          label="Average gross yield"
          value={`${marketStats?.avgYield ?? 0}%`}
          sub="Estimated based on BWP market rates"
          color="text-green-600"
        />
        <StatCard
          icon={HomeIcon}
          label="Total market value"
          value={formatPrice(marketStats?.totalValue)}
          sub="Sum of monthly rents × 150"
        />
      </div>

      {/* Districts + Property types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top districts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Top Districts</h2>
            <span className="text-xs text-slate-400 font-medium">By listing count</span>
          </div>
          {(districts ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No district data yet</p>
          ) : (
            <div className="space-y-5">
              {districts.map((d, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{d.name}</span>
                      <span className="ml-2 text-xs text-slate-400">{d.count} listing{d.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">{formatPrice(d.avgPrice)}</span>
                      <span className="ml-2 text-xs text-green-600 font-medium">{d.avgYield}% yield</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.round((d.count / (districts[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Property type distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Property Types</h2>
            <span className="text-xs text-slate-400 font-medium">{typeTotal} total</span>
          </div>
          {(propertyTypes ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No type data yet</p>
          ) : (
            <div className="space-y-4">
              {propertyTypes.map((t, i) => {
                const pct = typeTotal > 0 ? Math.round((t.count / typeTotal) * 100) : 0;
                const dot = TYPE_COLORS[t.type] ?? 'bg-slate-400';
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${dot} flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 capitalize">
                          {TYPE_LABELS[t.type] ?? t.type}
                        </span>
                        <span className="text-slate-500">{t.count} · {formatPrice(t.avgPrice)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${dot}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Monthly trend chart */}
      {trendChartData.length > 0 && (
        <BarChart
          data={trendChartData}
          title="New Listings — Last 6 Months"
          subtitle="Active listings added per month"
        />
      )}

      {/* Top properties */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Top Performing Properties</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by saves + inquiries</p>
          </div>
          <Link
            href="/investor/yield-analysis"
            className="text-sm text-primary font-medium hover:underline"
          >
            Full yield table →
          </Link>
        </div>

        {(topProperties ?? []).length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">No properties yet</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {topProperties.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <span className="text-lg font-bold text-slate-300 w-6 text-center">{i + 1}</span>

                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BuildingOfficeIcon className="w-6 h-6 text-primary/50" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <MapPinIcon className="inline w-3 h-3 mr-0.5" />
                    {p.location}
                    <span className="mx-1.5 text-slate-300">·</span>
                    {TYPE_LABELS[p.type] ?? p.type}
                  </p>
                </div>

                <div className="hidden sm:flex gap-6 text-center">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.saves}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Saves</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.inquiries}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Enquiries</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-600">{p.grossYield}%</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Yield</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatPrice(p.price)}</p>
                  <p className="text-[10px] text-slate-400">/ month</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          Yield figures are gross estimates based on a standard Botswana market rent-to-value ratio (×150).
          They do not account for vacancies, maintenance, agent fees, or taxes.
          Use the <Link href="/investor/yield-analysis" className="underline font-medium">Yield Analysis</Link> tool for detailed projections.
        </p>
      </div>
    </div>
  );
}