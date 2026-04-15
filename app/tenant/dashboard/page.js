// app/tenant/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useTenantData } from '@/app/lib/hooks/useTenantData';
import PropertyCard from '@/app/components/ui/PropertyCard';
import {
  HeartIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function TenantDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    loading,
    error,
    stats,
    savedProperties,
    applications,
    messages,
    refreshAll,
  } = useTenantData();

  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (user && user.role !== 'tenant') {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  useEffect(() => {
    async function loadRecommended() {
      try {
        const res = await fetch('/api/properties?status=active&limit=3');
        const data = await res.json();
        setRecommended(data.properties ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setRecLoading(false);
      }
    }
    loadRecommended();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Failed to load dashboard</h3>
        <p className="text-text-muted mb-4">{error}</p>
        <button onClick={refreshAll} className="btn-primary px-6 py-2">Try again</button>
      </div>
    );
  }

  const statCards = [
    { label: 'Saved Properties', value: stats.savedCount, icon: HeartIcon, link: '/tenant/saved', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { label: 'Active Applications', value: stats.applicationsCount, icon: DocumentTextIcon, link: '/tenant/applications', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: ChatBubbleLeftIcon, link: '/tenant/messages', color: '#c8a96e', bg: 'rgba(200, 169, 110, 0.1)' },
    { label: 'Viewing Requests', value: stats.upcomingViewings.length, icon: CalendarIcon, link: '/tenant/viewings', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-ink to-ink-soft rounded-2xl p-6 md:p-8 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-white/70">Here's what's happening with your rental search</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.link} className="bg-white rounded-xl p-5 border border-border-light hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl" style={{ background: stat.bg }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <ChevronRightIcon className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              <p className="text-2xl font-bold text-ink">{stat.value}</p>
              <p className="text-sm text-text-muted">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Saved Properties */}
          <div className="bg-white rounded-2xl p-6 border border-border-light">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold font-display">Saved Properties</h2>
              </div>
              <Link href="/tenant/saved" className="text-sm text-accent hover:underline flex items-center gap-1">
                View All <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            {savedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedProperties.slice(0, 2).map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-surface rounded-xl">
                <HeartIcon className="w-10 h-10 text-text-muted/50 mx-auto mb-3" />
                <p className="text-text-muted">No saved properties yet</p>
                <Link href="/property/search" className="text-accent text-sm mt-2 inline-block">Browse properties →</Link>
              </div>
            )}
          </div>

          {/* Recommended Properties */}
          <div className="bg-white rounded-2xl p-6 border border-border-light">
            <div className="flex items-center gap-2 mb-5">
              <SparklesIcon className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold font-display">Recommended for You</h2>
            </div>
            {recLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-surface animate-pulse rounded-xl" />)}
              </div>
            ) : recommended.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommended.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-center py-8">No recommendations right now.</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Application Status */}
          <div className="bg-white rounded-2xl p-5 border border-border-light">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
              <DocumentTextIcon className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Application Status</h3>
            </div>
            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 3).map(app => (
                  <div key={app.id} className="flex justify-between items-center p-3 bg-surface rounded-xl">
                    <div>
                      <p className="text-sm font-medium truncate max-w-[160px]">{app.property}</p>
                      <p className="text-xs text-text-muted">{app.location}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      app.status === 'approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.statusText}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-center py-6">No applications yet</p>
            )}
            <Link href="/tenant/applications" className="block text-center text-sm text-accent mt-4 hover:underline">
              View all applications
            </Link>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-2xl p-5 border border-border-light">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-light">
              <div className="flex items-center gap-2">
                <ChatBubbleLeftIcon className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Recent Messages</h3>
              </div>
              {stats.unreadMessages > 0 && (
                <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">{stats.unreadMessages} new</span>
              )}
            </div>
            {messages.length > 0 ? (
              <div className="space-y-3">
                {messages.slice(0, 3).map(msg => (
                  <Link key={msg.id} href="/tenant/messages" className="flex gap-3 p-2 hover:bg-surface rounded-xl transition-colors">
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                      {msg.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{msg.sender}</p>
                      <p className="text-xs text-text-muted truncate">{msg.message}</p>
                    </div>
                    <span className="text-[10px] text-text-muted">{msg.time}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-center py-6">No messages yet</p>
            )}
            <Link href="/tenant/messages" className="block text-center text-sm text-accent mt-4 hover:underline">
              View all messages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}