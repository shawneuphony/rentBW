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
  HomeIcon,
  CalendarIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function TenantDashboard() {
  const { user } = useAuth();
  const router   = useRouter();

  const {
    loading,
    error,
    stats,
    savedProperties,
    applications,
    messages,
    refreshAll,
  } = useTenantData();

  const [recommended, setRecommended]     = useState([]);
  const [recLoading,  setRecLoading]      = useState(true);

  // Redirect non-tenants
  useEffect(() => {
    if (user && user.role !== 'tenant') {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  // Fetch recommended (latest active) properties from the public API
  useEffect(() => {
    async function loadRecommended() {
      try {
        const res  = await fetch('/api/properties?status=active&limit=3');
        const data = await res.json();
        setRecommended(data.properties ?? []);
      } catch (err) {
        console.error('Recommended fetch failed:', err);
      } finally {
        setRecLoading(false);
      }
    }
    loadRecommended();
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center max-w-sm">
          <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={refreshAll}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Saved Properties',
      value: stats.savedCount,
      icon:  HeartIcon,
      link:  '/tenant/saved',
      color: 'text-red-500',
      bg:    'bg-red-50',
    },
    {
      label: 'Active Applications',
      value: stats.applicationsCount,
      icon:  DocumentTextIcon,
      link:  '/tenant/applications',
      color: 'text-blue-500',
      bg:    'bg-blue-50',
    },
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon:  ChatBubbleLeftIcon,
      link:  '/tenant/messages',
      color: 'text-green-500',
      bg:    'bg-green-50',
    },
    {
      label: 'Viewing Requests',
      value: stats.upcomingViewings.length,
      icon:  CalendarIcon,
      link:  '/tenant/viewings',
      color: 'text-purple-500',
      bg:    'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="bg-white border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-500 mt-2">
            Here's what's happening with your rental search
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                href={stat.link}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bg} rounded-xl ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Saved Properties */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <HeartIcon className="w-5 h-5 text-red-500" />
                  Saved Properties
                </h2>
                <Link
                  href="/tenant/saved"
                  className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                >
                  View All <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </div>

              {savedProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedProperties.slice(0, 2).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <HeartIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">No saved properties yet</p>
                  <Link href="/property/search" className="text-primary font-bold hover:underline">
                    Browse Properties →
                  </Link>
                </div>
              )}
            </div>

            {/* Recommended Properties */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recommended for You</h2>
                <Link href="/property/search" className="text-primary text-sm font-bold hover:underline">
                  View All
                </Link>
              </div>

              {recLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-48 bg-slate-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recommended.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommended.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">
                  No properties available right now.
                </p>
              )}
            </div>
          </div>

          {/* ── Right column ────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Application Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                Application Status
              </h3>

              {applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-sm font-medium truncate">{app.property}</p>
                        <p className="text-xs text-slate-500 truncate">{app.location}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                          app.status === 'approved'  ? 'bg-green-100 text-green-700'  :
                          app.status === 'pending'   ? 'bg-amber-100 text-amber-700'  :
                          app.status === 'rejected'  ? 'bg-red-100   text-red-700'    :
                          app.status === 'reviewing' ? 'bg-blue-100  text-blue-700'   :
                          'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {app.statusText}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No applications yet
                </p>
              )}

              <Link
                href="/tenant/applications"
                className="block text-center mt-4 text-sm text-primary font-bold hover:underline"
              >
                View All Applications
              </Link>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ChatBubbleLeftIcon className="w-5 h-5 text-green-500" />
                Recent Messages
                {stats.unreadMessages > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {stats.unreadMessages} new
                  </span>
                )}
              </h3>

              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.slice(0, 3).map((msg) => (
                    <Link
                      key={msg.id}
                      href="/tenant/messages"
                      className="block p-3 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                          {msg.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-bold truncate">{msg.sender}</p>
                            <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">
                              {msg.time}
                            </span>
                          </div>
                          <p className="text-xs text-primary font-medium mb-0.5 truncate">
                            {msg.property}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{msg.message}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No messages yet</p>
              )}

              <Link
                href="/tenant/messages"
                className="block text-center mt-4 text-sm text-primary font-bold hover:underline"
              >
                View All Messages
              </Link>
            </div>

            {/* Recent Searches */}
            {stats.recentSearches.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-5 h-5 text-primary" />
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {stats.recentSearches.map((search, index) => (
                    <Link
                      key={index}
                      href={`/property/search?q=${encodeURIComponent(search)}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors p-2 hover:bg-slate-50 rounded-lg"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      <span>{search}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Viewings */}
            {stats.upcomingViewings.length > 0 && (
              <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Upcoming Viewings
                </h3>
                <div className="space-y-3">
                  {stats.upcomingViewings.map((viewing, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <HomeIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{viewing.property}</p>
                        <p className="text-xs text-slate-500">{viewing.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}