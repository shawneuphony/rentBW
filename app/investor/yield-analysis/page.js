// app/investor/yield-analysis/page.js
'use client';

import { useState } from 'react';
import {
  CalculatorIcon,
  TrendingUpIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { BarChart, ProgressBar } from '@/app/components/ui/Charts';

export default function YieldAnalysisPage() {
  const [formData, setFormData] = useState({
    purchasePrice: 2500000,
    annualRent: 300000,
    expenses: 50000
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const noi = formData.annualRent - formData.expenses;
  const capRate = ((noi / formData.purchasePrice) * 100).toFixed(1);
  const cashOnCash = (noi / formData.purchasePrice * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Yield Analysis</h1>
        <p className="text-slate-500 mt-1">
          Analyze property returns and compare against Gaborone market benchmarks in BWP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calculator Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5 text-primary" />
                Yield Calculator
              </h3>
              <button className="text-xs text-primary font-bold hover:underline">Reset Form</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Purchase Price (BWP)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">BWP</span>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Annual Rent (BWP)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">BWP</span>
                  <input
                    type="number"
                    name="annualRent"
                    value={formData.annualRent}
                    onChange={handleChange}
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Operating Expenses (BWP/yr)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">BWP</span>
                  <input
                    type="number"
                    name="expenses"
                    value={formData.expenses}
                    onChange={handleChange}
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 gap-4">
              <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary uppercase">Net Operating Income (NOI)</p>
                  <p className="text-2xl font-black text-primary">BWP {noi.toLocaleString()}</p>
                </div>
                <CalculatorIcon className="w-8 h-8 text-primary/40" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Cap Rate</p>
                    <InformationCircleIcon className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{capRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                    <p className="text-[10px] text-green-600 font-bold">+1.5% vs market</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">ROI (Cash-on-Cash)</p>
                    <InformationCircleIcon className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{cashOnCash}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Estimated projection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Gaborone Sector Comparison</h3>
                <p className="text-xs text-slate-400 font-medium">Average Yield Benchmarks (Q1 2024)</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-bold bg-white rounded shadow-sm text-slate-900">
                  Yield %
                </button>
                <button className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700">
                  Occupancy
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <ProgressBar value={75} label="Office (CBD)" color="primary" showValue />
              <ProgressBar value={82} label="Retail (Main Mall)" color="primary" showValue />
              <ProgressBar value={90} label="Industrial (G-West)" color="primary" showValue />
              
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-black text-primary mb-2">
                  <span className="flex items-center gap-1">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    Your Property
                  </span>
                  <span>{capRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-10 rounded-full overflow-hidden border-2 border-primary/20 p-1">
                  <div 
                    className="bg-primary h-full rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                    style={{ width: `${Math.min(100, parseFloat(capRate) * 10)}%` }}
                  >
                    OUTPERFORMING MARKET
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}