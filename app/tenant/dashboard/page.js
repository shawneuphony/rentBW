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

  useEffect(() => {
    setMounted(true);
  }, []);

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
        const res = await fetch('/api/properties?status=active&limit=3');
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

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="rw-dashboard-loading">
        <div className="rw-dashboard-loading__spinner" />
        <p className="rw-dashboard-loading__text">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rw-dashboard-error">
        <div className="rw-dashboard-error__icon">!</div>
        <h3 className="rw-dashboard-error__title">Failed to load dashboard</h3>
        <p className="rw-dashboard-error__text">{error}</p>
        <button onClick={refreshAll} className="rw-dashboard-error__btn">
          Try again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Saved Properties',
      value: stats.savedCount,
      icon: HeartIcon,
      link: '/tenant/saved',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
    {
      label: 'Active Applications',
      value: stats.applicationsCount,
      icon: DocumentTextIcon,
      link: '/tenant/applications',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: ChatBubbleLeftIcon,
      link: '/tenant/messages',
      color: '#c8a96e',
      bg: 'rgba(200, 169, 110, 0.1)',
    },
    {
      label: 'Viewing Requests',
      value: stats.upcomingViewings.length,
      icon: CalendarIcon,
      link: '/tenant/viewings',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  return (
    <div className="rw-tenant-dashboard">
      {/* Welcome Header */}
      <div className="rw-dashboard-header">
        <div className="rw-dashboard-header__content">
          <h1 className="rw-dashboard-header__title">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="rw-dashboard-header__subtitle">
            Here's what's happening with your rental search
          </p>
        </div>
        <Link href="/property/search" className="rw-dashboard-header__btn">
          <MagnifyingGlassIcon className="rw-dashboard-header__btn-icon" />
          Find Properties
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="rw-stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.link} className="rw-stat-card">
              <div className="rw-stat-card__icon" style={{ background: stat.bg, color: stat.color }}>
                <Icon className="rw-stat-card__icon-svg" />
              </div>
              <div className="rw-stat-card__info">
                <p className="rw-stat-card__value">{stat.value}</p>
                <p className="rw-stat-card__label">{stat.label}</p>
              </div>
              <ChevronRightIcon className="rw-stat-card__arrow" />
            </Link>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="rw-dashboard-grid">
        
        {/* Left Column */}
        <div className="rw-dashboard-main">
          
          {/* Saved Properties */}
          <div className="rw-section-card">
            <div className="rw-section-card__header">
              <div className="rw-section-card__title-wrapper">
                <HeartIcon className="rw-section-card__title-icon" />
                <h2 className="rw-section-card__title">Saved Properties</h2>
              </div>
              <Link href="/tenant/saved" className="rw-section-card__link">
                View All
                <ArrowRightIcon className="rw-section-card__link-icon" />
              </Link>
            </div>

            {savedProperties.length > 0 ? (
              <div className="rw-prop-grid rw-prop-grid--small">
                {savedProperties.slice(0, 2).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="rw-empty-state">
                <HeartIcon className="rw-empty-state__icon" />
                <p className="rw-empty-state__title">No saved properties yet</p>
                <p className="rw-empty-state__text">Save properties you love to see them here</p>
                <Link href="/property/search" className="rw-empty-state__btn">
                  Browse Properties
                </Link>
              </div>
            )}
          </div>

          {/* Recommended Properties */}
          <div className="rw-section-card">
            <div className="rw-section-card__header">
              <div className="rw-section-card__title-wrapper">
                <SparklesIcon className="rw-section-card__title-icon" />
                <h2 className="rw-section-card__title">Recommended for You</h2>
              </div>
              <Link href="/property/search" className="rw-section-card__link">
                View All
                <ArrowRightIcon className="rw-section-card__link-icon" />
              </Link>
            </div>

            {recLoading ? (
              <div className="rw-skeleton-grid">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rw-skeleton-card" />
                ))}
              </div>
            ) : recommended.length > 0 ? (
              <div className="rw-prop-grid">
                {recommended.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <p className="rw-text-muted">No properties available right now.</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="rw-dashboard-sidebar">
          
          {/* Application Status */}
          <div className="rw-sidebar-card">
            <div className="rw-sidebar-card__header">
              <DocumentTextIcon className="rw-sidebar-card__header-icon" />
              <h3 className="rw-sidebar-card__title">Application Status</h3>
            </div>

            {applications.length > 0 ? (
              <div className="rw-application-list">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="rw-application-item">
                    <div className="rw-application-item__info">
                      <p className="rw-application-item__property">{app.property}</p>
                      <p className="rw-application-item__location">{app.location}</p>
                    </div>
                    <span className={`rw-status-badge rw-status-badge--${app.status}`}>
                      {app.statusText}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rw-text-muted rw-text-center">No applications yet</p>
            )}

            <Link href="/tenant/applications" className="rw-sidebar-card__link">
              View All Applications
              <ArrowRightIcon className="rw-sidebar-card__link-icon" />
            </Link>
          </div>

          {/* Recent Messages */}
          <div className="rw-sidebar-card">
            <div className="rw-sidebar-card__header">
              <ChatBubbleLeftIcon className="rw-sidebar-card__header-icon" />
              <h3 className="rw-sidebar-card__title">Recent Messages</h3>
              {stats.unreadMessages > 0 && (
                <span className="rw-badge-new">{stats.unreadMessages} new</span>
              )}
            </div>

            {messages.length > 0 ? (
              <div className="rw-message-list">
                {messages.slice(0, 3).map((msg) => (
                  <Link key={msg.id} href="/tenant/messages" className="rw-message-item">
                    <div className="rw-message-item__avatar">
                      {msg.avatar}
                    </div>
                    <div className="rw-message-item__content">
                      <div className="rw-message-item__header">
                        <p className="rw-message-item__sender">{msg.sender}</p>
                        <span className="rw-message-item__time">{msg.time}</span>
                      </div>
                      <p className="rw-message-item__property">{msg.property}</p>
                      <p className="rw-message-item__preview">{msg.message}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rw-text-muted rw-text-center">No messages yet</p>
            )}

            <Link href="/tenant/messages" className="rw-sidebar-card__link">
              View All Messages
              <ArrowRightIcon className="rw-sidebar-card__link-icon" />
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Tenant Dashboard Styles */
        .rw-tenant-dashboard {
          min-height: 100vh;
          background: var(--surface);
        }

        /* Dashboard Header */
        .rw-dashboard-header {
          background: linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%);
          border-radius: 24px;
          padding: 32px 40px;
          margin-bottom: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .rw-dashboard-header {
            padding: 24px;
            flex-direction: column;
            text-align: center;
          }
        }
        .rw-dashboard-header__title {
          font-family: var(--ff-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
        }
        .rw-dashboard-header__subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }
        .rw-dashboard-header__btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--accent);
          color: var(--white);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .rw-dashboard-header__btn:hover {
          background: var(--accent-dark);
          transform: translateY(-1px);
        }
        .rw-dashboard-header__btn-icon {
          width: 18px;
          height: 18px;
        }

        /* Stats Grid */
        .rw-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        @media (max-width: 1024px) {
          .rw-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .rw-stats-grid {
            grid-template-columns: 1fr;
          }
        }
        .rw-stat-card {
          background: var(--white);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          transition: all 0.3s;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .rw-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }
        .rw-stat-card__icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rw-stat-card__icon-svg {
          width: 26px;
          height: 26px;
        }
        .rw-stat-card__info {
          flex: 1;
        }
        .rw-stat-card__value {
          font-family: var(--ff-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.2;
        }
        .rw-stat-card__label {
          font-size: 13px;
          color: var(--text-muted);
        }
        .rw-stat-card__arrow {
          width: 18px;
          height: 18px;
          color: var(--text-muted);
          opacity: 0;
          transition: all 0.2s;
        }
        .rw-stat-card:hover .rw-stat-card__arrow {
          opacity: 1;
          transform: translateX(4px);
          color: var(--accent);
        }

        /* Dashboard Grid */
        .rw-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .rw-dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Section Card */
        .rw-section-card {
          background: var(--white);
          border-radius: 24px;
          padding: 28px;
          margin-bottom: 32px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .rw-section-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .rw-section-card__title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rw-section-card__title-icon {
          width: 22px;
          height: 22px;
          color: var(--accent);
        }
        .rw-section-card__title {
          font-family: var(--ff-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
        }
        .rw-section-card__link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--accent);
          text-decoration: none;
          transition: gap 0.2s;
        }
        .rw-section-card__link:hover {
          gap: 10px;
        }
        .rw-section-card__link-icon {
          width: 14px;
          height: 14px;
        }

        /* Property Grids */
        .rw-prop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .rw-prop-grid--small {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 768px) {
          .rw-prop-grid {
            grid-template-columns: 1fr;
          }
          .rw-prop-grid--small {
            grid-template-columns: 1fr;
          }
        }

        /* Sidebar Card */
        .rw-sidebar-card {
          background: var(--white);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .rw-sidebar-card__header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        .rw-sidebar-card__header-icon {
          width: 20px;
          height: 20px;
          color: var(--accent);
        }
        .rw-sidebar-card__title {
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          flex: 1;
        }
        .rw-sidebar-card__link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 13px;
          font-weight: 500;
          color: var(--accent);
          text-decoration: none;
          transition: gap 0.2s;
        }
        .rw-sidebar-card__link:hover {
          gap: 10px;
        }
        .rw-sidebar-card__link-icon {
          width: 14px;
          height: 14px;
        }

        /* Badges */
        .rw-badge-new {
          background: var(--accent);
          color: var(--white);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .rw-status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .rw-status-badge--pending {
          background: #fef3c7;
          color: #d97706;
        }
        .rw-status-badge--approved {
          background: #d1fae5;
          color: #059669;
        }
        .rw-status-badge--rejected {
          background: #fee2e2;
          color: #dc2626;
        }
        .rw-status-badge--reviewing {
          background: #dbeafe;
          color: #2563eb;
        }

        /* Application List */
        .rw-application-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rw-application-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--surface);
          border-radius: 12px;
        }
        .rw-application-item__property {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }
        .rw-application-item__location {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Message List */
        .rw-message-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rw-message-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--surface);
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .rw-message-item:hover {
          background: rgba(200, 169, 110, 0.08);
        }
        .rw-message-item__avatar {
          width: 40px;
          height: 40px;
          background: rgba(200, 169, 110, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          color: var(--accent);
          flex-shrink: 0;
        }
        .rw-message-item__content {
          flex: 1;
          min-width: 0;
        }
        .rw-message-item__header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }
        .rw-message-item__sender {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }
        .rw-message-item__time {
          font-size: 10px;
          color: var(--text-muted);
        }
        .rw-message-item__property {
          font-size: 11px;
          color: var(--accent);
          margin-bottom: 4px;
        }
        .rw-message-item__preview {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Empty State */
        .rw-empty-state {
          text-align: center;
          padding: 40px 20px;
        }
        .rw-empty-state__icon {
          width: 48px;
          height: 48px;
          color: var(--text-muted);
          opacity: 0.5;
          margin-bottom: 16px;
        }
        .rw-empty-state__title {
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .rw-empty-state__text {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        .rw-empty-state__btn {
          display: inline-block;
          padding: 10px 24px;
          background: var(--accent);
          color: var(--white);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
        }
        .rw-empty-state__btn:hover {
          background: var(--accent-dark);
        }

        /* Loading & Error States */
        .rw-dashboard-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .rw-dashboard-loading__spinner {
          width: 48px;
          height: 48px;
          border: 2px solid var(--surface);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }
        .rw-dashboard-loading__text {
          color: var(--text-muted);
        }
        .rw-dashboard-error {
          text-align: center;
          padding: 60px 20px;
        }
        .rw-dashboard-error__icon {
          width: 48px;
          height: 48px;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          margin: 0 auto 16px;
        }
        .rw-dashboard-error__title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .rw-dashboard-error__text {
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .rw-dashboard-error__btn {
          padding: 10px 24px;
          background: var(--ink);
          color: var(--white);
          border: none;
          border-radius: 100px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        /* Skeleton */
        .rw-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 768px) {
          .rw-skeleton-grid {
            grid-template-columns: 1fr;
          }
        }
        .rw-skeleton-card {
          height: 280px;
          background: linear-gradient(110deg, #f0f0f0 8%, #e8e8e8 18%, #f0f0f0 33%);
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
          border-radius: 16px;
        }

        .rw-text-muted {
          color: var(--text-muted);
          font-size: 13px;
        }
        .rw-text-center {
          text-align: center;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          to { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}