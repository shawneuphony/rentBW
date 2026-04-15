// app/landlord/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useLandlordData } from '@/app/lib/hooks/useLandlordData';
import {
  BuildingOfficeIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function LandlordDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    loading,
    stats,
    listings,
    inquiries,
    unreadCount,
    updatePropertyStatus,
    deleteProperty,
    markInquiryAsRead,
    refreshAll,
  } = useLandlordData();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    if (user && user.role !== 'landlord' && user.role !== 'admin') {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Listings', value: stats.totalListings, icon: BuildingOfficeIcon, change: `+${stats.pendingListings} pending`, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
    { label: 'Active Listings', value: stats.activeListings, icon: CheckCircleIcon, change: `${((stats.activeListings / stats.totalListings) * 100 || 0).toFixed(0)}% of total`, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: EyeIcon, change: 'Last 30 days', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { label: 'Inquiries', value: stats.totalInquiries, icon: ChatBubbleLeftIcon, change: `${unreadCount} unread`, color: '#c8a96e', bg: 'rgba(200, 169, 110, 0.1)' },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>;
      case 'pending': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Rejected</span>;
      case 'rented': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Rented</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold capitalize">{status}</span>;
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteProperty(id);
    if (result.success) setShowDeleteConfirm(null);
    else alert('Failed to delete property: ' + result.error);
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-ink to-ink-soft rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-white/70">
              You have <span className="text-accent font-semibold">{stats.totalInquiries} new inquiries</span> across your portfolio.
            </p>
          </div>
          <Link
            href="/landlord/listings/new"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Create New Listing
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-5 border border-border-light hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl" style={{ background: stat.bg }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <span className="text-xs text-text-muted">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-ink">{stat.value}</p>
              <p className="text-sm text-text-muted mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Listings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
            <div className="p-5 border-b border-border-light flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display">Your Listings</h2>
                <p className="text-sm text-text-muted">Manage and track your properties</p>
              </div>
              <Link href="/landlord/listings" className="text-accent text-sm font-medium flex items-center gap-1 hover:underline">
                View All <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-border-light">
              {listings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="p-4 hover:bg-surface/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-surface bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${listing.images?.[0] || '/images/placeholder.jpg'})` }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-ink truncate">{listing.title}</h3>
                        {getStatusBadge(listing.status)}
                      </div>
                      <p className="text-sm text-text-muted mb-2">
                        BWP {listing.price.toLocaleString()}/mo • {listing.beds} bed • {listing.baths} bath
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3" /> {listing.views} views</span>
                        <span className="flex items-center gap-1"><ChatBubbleLeftIcon className="w-3 h-3" /> {listing.inquiries} inquiries</span>
                        <span className="flex items-center gap-1"><BuildingOfficeIcon className="w-3 h-3" /> {listing.saves} saves</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/landlord/listings/${listing.id}/edit`} className="p-2 text-text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition">
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button onClick={() => setShowDeleteConfirm(listing.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {showDeleteConfirm === listing.id && (
                    <div className="mt-3 p-3 bg-red-50 rounded-xl flex items-center justify-between">
                      <p className="text-sm text-red-700">Delete this listing?</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(listing.id)} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg">Yes</button>
                        <button onClick={() => setShowDeleteConfirm(null)} className="px-3 py-1 bg-white text-slate-600 text-xs font-bold rounded-lg border">No</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {listings.length === 0 && (
                <div className="p-12 text-center">
                  <BuildingOfficeIcon className="w-12 h-12 text-text-muted/50 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">No listings yet</h3>
                  <p className="text-text-muted mb-4">Create your first property listing to get started</p>
                  <Link href="/landlord/listings/new" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
                    <PlusIcon className="w-4 h-4" /> Create Listing
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-2xl p-5 border border-border-light">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold font-display">Views Overview</h3>
              <div className="flex gap-2">
                {['week', 'month'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition ${
                      selectedPeriod === p ? 'bg-accent text-white' : 'bg-surface text-text-muted hover:bg-accent/10'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-48 flex items-end justify-between gap-2">
              {stats.viewTrends.length > 0 ? (
                stats.viewTrends.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-accent/10 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-full">
                      <div className="bg-accent w-full rounded-t-lg transition-all group-hover:bg-accent/80" style={{ height: `${(day.views / Math.max(...stats.viewTrends.map(d => d.views)) * 100) || 5}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                ))
              ) : (
                <div className="w-full text-center text-text-muted">No view data available yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Inquiries & Tips */}
        <div className="space-y-6">
          {/* Response Rate */}
          <div className="bg-white rounded-2xl p-5 border border-border-light">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Response Rate</h3>
              <span className="text-2xl font-bold text-accent">{stats.responseRate}%</span>
            </div>
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${stats.responseRate}%` }} />
            </div>
            <p className="text-xs text-text-muted mt-2">
              {stats.responseRate >= 90 ? 'Excellent! You respond quickly.' :
               stats.responseRate >= 70 ? 'Good, but try to respond faster.' :
               'Try to respond within 24 hours for better results.'}
            </p>
          </div>

          {/* Recent Inquiries */}
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
            <div className="p-4 border-b border-border-light flex justify-between items-center">
              <h3 className="font-semibold">Recent Inquiries</h3>
              {unreadCount > 0 && <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">{unreadCount} new</span>}
            </div>
            <div className="divide-y divide-border-light">
              {inquiries.slice(0, 5).map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/landlord/messages?inquiry=${inquiry.id}`}
                  className={`block p-4 hover:bg-surface transition-colors ${!inquiry.read ? 'bg-accent/5' : ''}`}
                  onClick={() => !inquiry.read && markInquiryAsRead(inquiry.id)}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                      {inquiry.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold truncate">{inquiry.tenantName}</p>
                        <span className="text-[10px] text-text-muted">{new Date(inquiry.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-accent truncate mb-1">{inquiry.propertyTitle}</p>
                      <p className="text-xs text-text-muted line-clamp-2">{inquiry.message}</p>
                    </div>
                    {!inquiry.read && <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />}
                  </div>
                </Link>
              ))}
              {inquiries.length === 0 && (
                <div className="p-8 text-center">
                  <ChatBubbleLeftIcon className="w-8 h-8 text-text-muted/50 mx-auto mb-2" />
                  <p className="text-sm text-text-muted">No inquiries yet</p>
                </div>
              )}
            </div>
            <Link href="/landlord/messages" className="block w-full py-3 text-center text-sm font-medium border-t border-border-light text-text-muted hover:bg-surface transition-colors">
              View All Messages
            </Link>
          </div>

          {/* Market Insight */}
          <div className="bg-accent/5 rounded-2xl p-4 border border-accent/10">
            <div className="flex gap-3">
              <ArrowTrendingUpIcon className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-accent mb-1">Market Insight</p>
                <p className="text-xs text-ink-soft">
                  Properties in {listings[0]?.location?.split(',')[0] || 'your area'} are getting
                  <span className="font-bold text-accent"> 20% more views</span> this week.
                  Consider featuring your top listings.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-border-light">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/landlord/listings/new" className="flex items-center gap-3 p-3 hover:bg-surface rounded-xl transition">
                <div className="p-2 bg-accent/10 rounded-lg text-accent"><PlusIcon className="w-4 h-4" /></div>
                <span className="text-sm font-medium">Create New Listing</span>
              </Link>
              <Link href="/landlord/analytics" className="flex items-center gap-3 p-3 hover:bg-surface rounded-xl transition">
                <div className="p-2 bg-accent/10 rounded-lg text-accent"><EyeIcon className="w-4 h-4" /></div>
                <span className="text-sm font-medium">View Analytics</span>
              </Link>
              <Link href="/landlord/profile" className="flex items-center gap-3 p-3 hover:bg-surface rounded-xl transition">
                <div className="p-2 bg-accent/10 rounded-lg text-accent"><BuildingOfficeIcon className="w-4 h-4" /></div>
                <span className="text-sm font-medium">Update Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}