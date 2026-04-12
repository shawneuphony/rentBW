// app/tenant/applications/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

function normalise(app) {
  return {
    ...app,
    property: app.title ?? 'Unknown Property',
    location: app.location ?? '',
    landlord: app.landlord_name ?? 'Unknown Landlord',
    price: app.price ?? 0,
    appliedDate: app.created_at
      ? new Date(app.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '—',
    image: Array.isArray(app.images) && app.images.length > 0 ? app.images[0] : null,
    statusText: getStatusText(app.status),
  };
}

function getStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Under Review';
    case 'reviewing':
      return 'Documents Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Not Selected';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return status ?? '—';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return 'var(--status-pending)';
    case 'reviewing':
      return 'var(--status-reviewing)';
    case 'approved':
      return 'var(--status-approved)';
    case 'rejected':
      return 'var(--status-rejected)';
    default:
      return 'var(--text-muted)';
  }
}

function getStatusBg(status) {
  switch (status) {
    case 'pending':
      return '#fef3c7';
    case 'reviewing':
      return '#dbeafe';
    case 'approved':
      return '#d1fae5';
    case 'rejected':
      return '#fee2e2';
    default:
      return '#f3f4f6';
  }
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tenant/applications');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const normalised = (data.applications ?? []).map(normalise);
      setApplications(normalised);
    } catch (err) {
      setError(err.message);
      showToast('Error loading applications', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user, fetchApplications]);

  const handleWithdraw = async (appId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawing(appId);
    try {
      const res = await fetch(`/api/tenant/applications/${appId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, status: 'withdrawn', statusText: 'Withdrawn' } : a
        )
      );
      showToast('Application withdrawn successfully');
    } catch (err) {
      showToast(err.message || 'Error withdrawing application', 'error');
    } finally {
      setWithdrawing(null);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      !searchTerm ||
      app.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    reviewing: applications.filter((a) => a.status === 'reviewing').length,
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="rw-page-loading">
        <div className="rw-page-loading__spinner" />
        <p className="rw-page-loading__text">Loading your applications...</p>
      </div>
    );
  }

  if (error && applications.length === 0) {
    return (
      <div className="rw-page-error">
        <ExclamationCircleIcon className="rw-page-error__icon" />
        <h3 className="rw-page-error__title">Failed to load applications</h3>
        <p className="rw-page-error__text">{error}</p>
        <button onClick={fetchApplications} className="rw-page-error__btn">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rw-applications-page">
      {/* Toast */}
      {toast && (
        <div className={`rw-toast rw-toast--${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="rw-page-header">
        <div>
          <h1 className="rw-page-header__title">My Applications</h1>
          <p className="rw-page-header__subtitle">Track the status of your rental applications</p>
        </div>
        <Link href="/property/search" className="rw-page-header__btn">
          Browse More Properties
          <ArrowRightIcon className="rw-page-header__btn-icon" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="rw-stats-grid">
        {[
          { label: 'Total', value: stats.total, color: 'var(--accent)' },
          { label: 'Pending', value: stats.pending, color: '#d97706' },
          { label: 'Reviewing', value: stats.reviewing, color: '#2563eb' },
          { label: 'Approved', value: stats.approved, color: '#059669' },
          { label: 'Rejected', value: stats.rejected, color: '#dc2626' },
        ].map((stat) => (
          <div key={stat.label} className="rw-stat-card--small">
            <p className="rw-stat-card--small__value" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="rw-stat-card--small__label">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="rw-search-bar">
        <div className="rw-search-bar__input-wrapper">
          <MagnifyingGlassIcon className="rw-search-bar__icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by property, location..."
            className="rw-search-bar__input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rw-search-bar__select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <button onClick={fetchApplications} className="rw-search-bar__refresh" title="Refresh">
          <ArrowPathIcon className="rw-search-bar__refresh-icon" />
        </button>
      </div>

      {/* Applications List */}
      {filtered.length > 0 ? (
        <div className="rw-applications-list">
          {filtered.map((app) => (
            <div key={app.id} className="rw-application-card">
              <div className="rw-application-card__header" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                <div className="rw-application-card__image">
                  {app.image ? (
                    <img src={app.image} alt={app.property} />
                  ) : (
                    <DocumentTextIcon className="rw-application-card__image-icon" />
                  )}
                </div>
                <div className="rw-application-card__summary">
                  <div>
                    <h3 className="rw-application-card__title">{app.property}</h3>
                    <p className="rw-application-card__location">
                      <MapPinIcon className="rw-application-card__location-icon" />
                      {app.location}
                    </p>
                  </div>
                  <div className="rw-application-card__meta">
                    <div className="rw-application-card__price">
                      BWP {app.price?.toLocaleString()}/mo
                    </div>
                    <div className="rw-application-card__date">
                      Applied {app.appliedDate}
                    </div>
                    <div
                      className="rw-status-badge"
                      style={{
                        background: getStatusBg(app.status),
                        color: getStatusColor(app.status),
                      }}
                    >
                      {app.statusText}
                    </div>
                  </div>
                </div>
                <div className="rw-application-card__expand">
                  {expandedId === app.id ? (
                    <ChevronUpIcon className="rw-application-card__expand-icon" />
                  ) : (
                    <ChevronDownIcon className="rw-application-card__expand-icon" />
                  )}
                </div>
              </div>

              {expandedId === app.id && (
                <div className="rw-application-card__details">
                  {/* Timeline */}
                  <div className="rw-timeline">
                    {['Submitted', 'Review', 'Decision'].map((step, i) => (
                      <div key={step} className="rw-timeline__step">
                        <div
                          className={`rw-timeline__dot ${
                            i < 2 ? 'rw-timeline__dot--completed' : ''
                          }`}
                        />
                        <p className="rw-timeline__label">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="rw-application-actions">
                    <Link href={`/property/${app.property_id}`} className="rw-application-actions__btn">
                      <EyeIcon className="rw-application-actions__btn-icon" />
                      View Property
                    </Link>
                    {app.landlordId && (
                      <Link href={`/tenant/messages?landlord=${app.landlordId}`} className="rw-application-actions__btn">
                        <ChatBubbleLeftIcon className="rw-application-actions__btn-icon" />
                        Message Landlord
                      </Link>
                    )}
                    {(app.status === 'pending' || app.status === 'reviewing') && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawing === app.id}
                        className="rw-application-actions__btn rw-application-actions__btn--danger"
                      >
                        <XCircleIcon className="rw-application-actions__btn-icon" />
                        {withdrawing === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rw-empty-hero">
          <DocumentTextIcon className="rw-empty-hero__icon" />
          <h2 className="rw-empty-hero__title">No applications yet</h2>
          <p className="rw-empty-hero__text">
            Start applying to properties you love. Your applications will appear here.
          </p>
          <Link href="/property/search" className="rw-empty-hero__btn">
            Browse Properties
            <ArrowRightIcon className="rw-empty-hero__btn-icon" />
          </Link>
        </div>
      ) : (
        <div className="rw-empty-state">
          <MagnifyingGlassIcon className="rw-empty-state__icon" />
          <p className="rw-empty-state__title">No matching applications</p>
          <p className="rw-empty-state__text">Try adjusting your search or filters.</p>
          <button onClick={() => setSearchTerm('')} className="rw-empty-state__btn">
            Clear search
          </button>
        </div>
      )}

      <style jsx global>{`
        .rw-applications-page {
          min-height: 100vh;
          background: var(--surface);
          padding: 32px 40px;
        }
        @media (max-width: 768px) {
          .rw-applications-page {
            padding: 20px;
          }
        }

        .rw-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .rw-page-header__title {
          font-family: var(--ff-display);
          font-size: 32px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .rw-page-header__subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }
        .rw-page-header__btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--accent);
          color: var(--white);
          border-radius: 100px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }
        .rw-page-header__btn:hover {
          background: var(--accent-dark);
          gap: 12px;
        }
        .rw-page-header__btn-icon {
          width: 16px;
          height: 16px;
        }

        .rw-stat-card--small {
          background: var(--white);
          border-radius: 16px;
          padding: 16px;
          text-align: center;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .rw-stat-card--small__value {
          font-family: var(--ff-display);
          font-size: 28px;
          font-weight: 700;
        }
        .rw-stat-card--small__label {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .rw-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        @media (max-width: 768px) {
          .rw-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .rw-search-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .rw-search-bar__input-wrapper {
          flex: 1;
          position: relative;
        }
        .rw-search-bar__icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: var(--text-muted);
        }
        .rw-search-bar__input {
          width: 100%;
          padding: 12px 16px 12px 46px;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          font-size: 14px;
          background: var(--white);
        }
        .rw-search-bar__input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .rw-search-bar__select {
          padding: 12px 20px;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          background: var(--white);
          cursor: pointer;
        }
        .rw-search-bar__refresh {
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          background: var(--white);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rw-search-bar__refresh-icon {
          width: 18px;
          height: 18px;
          color: var(--text-muted);
        }

        .rw-applications-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rw-application-card {
          background: var(--white);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .rw-application-card__header {
          display: flex;
          gap: 20px;
          padding: 20px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .rw-application-card__header:hover {
          background: rgba(0, 0, 0, 0.02);
        }
        .rw-application-card__image {
          width: 100px;
          height: 70px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--surface);
          flex-shrink: 0;
        }
        .rw-application-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .rw-application-card__image-icon {
          width: 100%;
          height: 100%;
          padding: 20px;
          color: var(--text-muted);
        }
        .rw-application-card__summary {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .rw-application-card__title {
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 4px;
        }
        .rw-application-card__location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .rw-application-card__location-icon {
          width: 12px;
          height: 12px;
        }
        .rw-application-card__meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .rw-application-card__price {
          font-weight: 700;
          color: var(--accent);
        }
        .rw-application-card__date {
          font-size: 12px;
          color: var(--text-muted);
        }
        .rw-application-card__expand {
          display: flex;
          align-items: center;
        }
        .rw-application-card__expand-icon {
          width: 20px;
          height: 20px;
          color: var(--text-muted);
        }
        .rw-application-card__details {
          padding: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          background: var(--surface);
        }

        .rw-timeline {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 0 20px;
        }
        .rw-timeline__step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .rw-timeline__dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--text-muted);
        }
        .rw-timeline__dot--completed {
          background: var(--accent);
        }
        .rw-timeline__label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .rw-application-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .rw-application-actions__btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--white);
          border: 1px solid #e0e0e0;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rw-application-actions__btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .rw-application-actions__btn--danger {
          color: #dc2626;
        }
        .rw-application-actions__btn--danger:hover {
          border-color: #dc2626;
          background: #fee2e2;
        }
        .rw-application-actions__btn-icon {
          width: 16px;
          height: 16px;
        }

        .rw-status-badge {
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .rw-application-card__header {
            flex-direction: column;
          }
          .rw-application-card__image {
            width: 100%;
            height: 160px;
          }
          .rw-application-card__summary {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}