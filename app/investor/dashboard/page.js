// app/investor/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useInvestorData } from '@/app/lib/hooks/useInvestorData';
import { BarChart, LineChart, DoughnutChart, ProgressBar } from '@/app/components/ui/InvestmentChart';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  BanknotesIcon,
  HomeModernIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

export default function InvestorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { 
    loading, 
    marketStats, 
    districts, 
    propertyTypes, 
    monthlyTrends,
    topProperties,
    refresh 
  } = useInvestorData();

  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [showYieldCalculator, setShowYieldCalculator] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState({
    purchasePrice: 2500000,
    annualRent: 300000,
    expenses: 50000,
    loanAmount: 1500000,
    interestRate: 8.5,
    loanTerm: 20
  });
  const [calculationResult, setCalculationResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Redirect if not investor
  useEffect(() => {
    if (user && user.role !== 'investor' && user.role !== 'admin') {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const response = await fetch('/api/investor/yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculatorInput)
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalculationResult(data);
      }
    } catch (error) {
      console.error('Error calculating yield:', error);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Properties',
      value: marketStats.totalProperties.toLocaleString(),
      icon: BuildingOfficeIcon,
      change: '+12%',
      trend: 'up',
      color: 'blue'
    },
    {
      label: 'Average Price',
      value: `BWP ${marketStats.avgPrice.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: '+5.2%',
      trend: 'up',
      color: 'green'
    },
    {
      label: 'Market Value',
      value: `BWP ${(marketStats.totalValue / 1000000).toFixed(1)}M`,
      icon: BanknotesIcon,
      change: '+8.3%',
      trend: 'up',
      color: 'purple'
    },
    {
      label: 'Average Yield',
      value: `${marketStats.avgYield}%`,
      icon: ArrowTrendingUpIcon,
      change: '+0.8%',
      trend: 'up',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="bg-white border-b border-primary/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <ChartBarIcon className="w-8 h-8 text-primary" />
                Investor Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Real-time market intelligence for Gaborone real estate
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refresh}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Refresh data"
              >
                <ArrowPathIcon className="w-5 h-5 text-slate-600" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                <DocumentArrowDownIcon className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${kpi.color}-50 rounded-xl text-${kpi.color}-600`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Overview Chart */}
          <div className="lg:col-span-2">
            <BarChart
              data={districts.map(d => ({ label: d.name, value: d.avgPrice }))}
              title="Average Price by District"
              subtitle="BWP per month"
              color="primary"
            />
          </div>

          {/* Property Type Distribution */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold mb-6">Property Mix</h3>
            <div className="space-y-4">
              {propertyTypes.map(type => (
                <ProgressBar
                  key={type.type}
                  value={type.count}
                  max={marketStats.totalProperties}
                  label={type.type || 'Other'}
                  showValue
                />
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <DoughnutChart 
                percentage={marketStats.avgYield} 
                label="Avg Yield" 
                size="small"
              />
            </div>
          </div>
        </div>

        {/* Market Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart
            data={monthlyTrends.map(t => ({ label: t.month.slice(5), value: t.listings }))}
            title="New Listings Trend"
            subtitle="Last 6 months"
          />
          <LineChart
            data={monthlyTrends.map(t => ({ label: t.month.slice(5), value: t.avg_price }))}
            title="Price Trend"
            subtitle="Average monthly rent (BWP)"
          />
        </div>

        {/* Yield Calculator */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-primary" />
              Yield Calculator
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Purchase Price (BWP)</label>
                    <input
                      type="number"
                      value={calculatorInput.purchasePrice}
                      onChange={(e) => setCalculatorInput({ ...calculatorInput, purchasePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Annual Rent (BWP)</label>
                    <input
                      type="number"
                      value={calculatorInput.annualRent}
                      onChange={(e) => setCalculatorInput({ ...calculatorInput, annualRent: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Annual Expenses</label>
                    <input
                      type="number"
                      value={calculatorInput.expenses}
                      onChange={(e) => setCalculatorInput({ ...calculatorInput, expenses: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Loan Amount</label>
                    <input
                      type="number"
                      value={calculatorInput.loanAmount}
                      onChange={(e) => setCalculatorInput({ ...calculatorInput, loanAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={calculatorInput.interestRate}
                      onChange={(e) => setCalculatorInput({ ...calculatorInput, interestRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Loan Term (years)</label>
                    <input
                      type="number"
                      value={calculatorInput.loanTerm}
                      onChange={(e) => setCalculatorInput({ ...calculatorInput, loanTerm: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={calculating}
                  className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {calculating ? 'Calculating...' : 'Calculate Returns'}
                </button>
              </div>

              {/* Results */}
              {calculationResult && (
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                  <h4 className="font-bold text-lg mb-4">Investment Analysis</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-slate-500">Net Operating Income</p>
                      <p className="text-xl font-bold text-primary">BWP {calculationResult.noi.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Cap Rate</p>
                      <p className="text-xl font-bold text-primary">{calculationResult.capRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Cash-on-Cash ROI</p>
                      <p className="text-xl font-bold text-green-600">{calculationResult.cashOnCash}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Monthly Payment</p>
                      <p className="text-xl font-bold text-slate-900">BWP {calculationResult.monthlyPayment.toLocaleString()}</p>
                    </div>
                  </div>

                  {calculationResult.isViable ? (
                    <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      ✓ This property shows good investment potential
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                      ⚠ Review your numbers - returns are below market average
                    </div>
                  )}

                  {/* 5-Year Projection */}
                  <div className="mt-6">
                    <p className="text-sm font-bold mb-3">5-Year Projection</p>
                    <div className="space-y-2">
                      {calculationResult.projections.map((proj, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-500">Year {proj.year}</span>
                          <span className="font-medium">BWP {proj.netWorth.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Performing Properties */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Top Performing Properties</h3>
              <p className="text-xs text-slate-500 mt-1">Highest engagement and interest</p>
            </div>
            <Link href="/investor/properties" className="text-primary text-sm font-bold hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Location</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Price</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Views</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Saves</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Inquiries</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Est. Yield</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg overflow-hidden">
                          {prop.image ? (
                            <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                              <BuildingOfficeIcon className="w-5 h-5 text-primary/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{prop.title}</p>
                          <p className="text-xs text-slate-500">by {prop.landlord}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{prop.location}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary text-right">
                      BWP {prop.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <EyeIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{prop.views}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <HeartIcon className="w-4 h-4 text-red-400" />
                        <span className="text-sm">{prop.saves}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <ChatBubbleLeftIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{prop.inquiries}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          {prop.yield}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/property/${prop.id}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
            <div className="text-blue-600 mb-3">
              <BuildingLibraryIcon className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg mb-2">CBD Opportunity</h4>
            <p className="text-sm text-slate-600">
              Commercial properties in CBD showing 12% increase in inquiries this quarter.
            </p>
            <Link href="/investor/geospatial?location=cbd" className="inline-block mt-4 text-blue-600 text-sm font-bold hover:underline">
              Explore CBD →
            </Link>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
            <div className="text-green-600 mb-3">
              <HomeModernIcon className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg mb-2">Phakalane Growth</h4>
            <p className="text-sm text-slate-600">
              Residential values up 8.5% year-over-year. New developments in Phase 3.
            </p>
            <Link href="/investor/geospatial?location=phakalane" className="inline-block mt-4 text-green-600 text-sm font-bold hover:underline">
              View Properties →
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
            <div className="text-purple-600 mb-3">
              <ArrowTrendingUpIcon className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg mb-2">Yield Trends</h4>
            <p className="text-sm text-slate-600">
              Industrial yields now at 9.1%, highest in 2 years. Investment opportunity.
            </p>
            <Link href="/investor/yield-analysis" className="inline-block mt-4 text-purple-600 text-sm font-bold hover:underline">
              Analyze Yields →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}