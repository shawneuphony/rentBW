// app/landlord/analytics/page.js
'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { BarChart } from '@/app/components/ui/Charts';

export default function LandlordAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/landlord/analytics', { credentials: 'include' })
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totals = data?.totals || {};
  const dailyViews = data?.dailyViews || [];
  const weeklyInquiries = data?.weeklyInquiries || [];
  const perProperty = data?.perProperty || [];

  const stats = [
    {
      label: 'Total Views',
      value: totals.views?.toLocaleString() ?? '0',
      icon: EyeIcon,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Total Inquiries',
      value: totals.inquiries ?? '0',
      icon: ChatBubbleLeftIcon,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
    },
    {
      label: 'Saved Count',
      value: totals.saves ?? '0',
      icon: HeartIcon,
      bg: 'bg-pink-50',
      color: 'text-pink-600',
    },
    {
      label: 'Conversion Rate',
      value: `${totals.conversionRate ?? 0}%`,
      icon: ChartBarIcon,
      bg: 'bg-green-50',
      color: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${stat.bg} rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={dailyViews.length > 0 ? dailyViews : [{ label: 'No data', value: 0 }]}
          title="Daily Views"
          subtitle="Last 7 days"
        />
        <BarChart
          data={weeklyInquiries.length > 0 ? weeklyInquiries : [{ label: 'No data', value: 0 }]}
          title="Weekly Inquiries"
          subtitle="This month"
        />
      </div>

      {/* Per-property breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Per Property Breakdown</h2>
          <p className="text-sm text-slate-500 mt-1">Views, inquiries and saves per listing</p>
        </div>

        {perProperty.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {perProperty.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                  <BuildingOfficeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                </div>
                <div className="flex items-center gap-6 text-sm flex-shrink-0">
                  <div className="text-center">
                    <p className="font-bold text-slate-900">{p.views}</p>
                    <p className="text-xs text-slate-500">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-900">{p.inquiries}</p>
                    <p className="text-xs text-slate-500">Inquiries</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-900">{p.saves}</p>
                    <p className="text-xs text-slate-500">Saves</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <ChartBarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No property data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}