// app/tenant/saved/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import PropertyCard from '@/app/components/ui/PropertyCard';
import {
  HeartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

function formatSavedDate(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now = new Date();
  const diff = now - date;
  if (diff < 86_400_000) return 'Today';
  if (diff < 2 * 86_400_000) return 'Yesterday';
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function normalise(row) {
  return {
    ...row,
    saved_date: formatSavedDate(row.saved_at),
    saved_ts: row.saved_at ?? 0,
  };
}

export default function SavedPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [removing, setRemoving] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tenant/saved');
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const normalised = (data.saved ?? []).map(normalise);
      setProperties(normalised);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchSaved();
  }, [user, fetchSaved]);

  const handleRemove = async (propertyId) => {
    setRemoving((prev) => new Set(prev).add(propertyId));
    try {
      const res = await fetch(`/api/properties/${propertyId}/save`, { method: 'POST' });
      if (!res.ok) throw new Error();
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      showToast('Property removed from saved');
    } catch {
      showToast('Error removing property', 'error');
    } finally {
      setRemoving((prev) => {
        const s = new Set(prev);
        s.delete(propertyId);
        return s;
      });
    }
  };

  const filtered = properties.filter((p) =>
    !searchTerm ||
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return b.saved_ts - a.saved_ts;
    if (sortBy === 'oldest') return a.saved_ts - b.saved_ts;
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    return 0;
  });

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="rw-page-loading">
        <div className="rw-page-loading__spinner" />
        <p className="rw-page-loading__text">Loading your saved properties...</p>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="rw-page-error">
        <ExclamationCircleIcon className="rw-page-error__icon" />
        <h3 className="rw-page-error__title">Failed to load saved properties</h3>
        <p className="rw-page-error__text">{error}</p>
        <button onClick={fetchSaved} className="rw-page-error__btn">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rw-saved-page">
      {/* Toast */}
      {toast && (
        <div className={`rw-toast rw-toast--${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="rw-page-header">
        <div>
          <h1 className="rw-page-header__title">Saved Properties</h1>
          <p className="rw-page-header__subtitle">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
        <button onClick={fetchSaved} className="rw-page-header__refresh" title="Refresh">
          <ArrowPathIcon className="rw-page-header__refresh-icon" />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="rw-search-bar">
        <div className="rw-search-bar__input-wrapper">
          <MagnifyingGlassIcon className="rw-search-bar__icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved properties..."
            className="rw-search-bar__input"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rw-search-bar__select"
        >
          <option value="newest">Newest Saved</option>
          <option value="oldest">Oldest Saved</option>
          <option value="price-high">Price: High to Low</option>
          <option value="price-low">Price: Low to High</option>
        </select>
      </div>

      {/* Results */}
      {sorted.length > 0 ? (
        <div className="rw-saved-grid">
          {sorted.map((property) => (
            <div key={property.id} className="rw-saved-card">
              <PropertyCard property={property} />
              <button
                onClick={() => handleRemove(property.id)}
                disabled={removing.has(property.id)}
                className="rw-saved-card__remove"
              >
                {removing.has(property.id) ? (
                  <ArrowPathIcon className="rw-saved-card__remove-icon animate-spin" />
                ) : (
                  <XMarkIcon className="rw-saved-card__remove-icon" />
                )}
                <span>Remove</span>
              </button>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="rw-empty-hero">
          <HeartIconSolid className="rw-empty-hero__icon" />
          <h2 className="rw-empty-hero__title">No saved properties yet</h2>
          <p className="rw-empty-hero__text">
            Start exploring properties and save the ones you love.
          </p>
          <Link href="/property/search" className="rw-empty-hero__btn">
            Browse Properties
            <ArrowRightIcon className="rw-empty-hero__btn-icon" />
          </Link>
        </div>
      ) : (
        <div className="rw-empty-state">
          <MagnifyingGlassIcon className="rw-empty-state__icon" />
          <p className="rw-empty-state__title">No matching properties</p>
          <p className="rw-empty-state__text">Try adjusting your search term.</p>
          <button onClick={() => setSearchTerm('')} className="rw-empty-state__btn">
            Clear search
          </button>
        </div>
      )}

      <style jsx global>{`
        .rw-saved-page {
          min-height: 100vh;
          background: var(--surface);
          padding: 32px 40px;
        }
        @media (max-width: 768px) {
          .rw-saved-page {
            padding: 20px;
          }
        }

        .rw-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
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
        .rw-page-header__refresh {
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .rw-page-header__refresh:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .rw-page-header__refresh-icon {
          width: 20px;
          height: 20px;
          color: var(--text-muted);
        }

        .rw-search-bar {
          display: flex;
          gap: 16px;
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
          padding: 14px 16px 14px 46px;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          font-size: 14px;
          background: var(--white);
          transition: all 0.2s;
        }
        .rw-search-bar__input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(200, 169, 110, 0.1);
        }
        .rw-search-bar__select {
          padding: 14px 20px;
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          font-size: 14px;
          background: var(--white);
          cursor: pointer;
        }

        .rw-saved-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .rw-saved-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .rw-saved-grid {
            grid-template-columns: 1fr;
          }
        }

        .rw-saved-card {
          position: relative;
        }
        .rw-saved-card__remove {
          position: absolute;
          bottom: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          border: none;
          border-radius: 100px;
          color: white;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }
        .rw-saved-card__remove:hover {
          background: #ef4444;
        }
        .rw-saved-card__remove-icon {
          width: 14px;
          height: 14px;
        }

        .rw-empty-hero {
          text-align: center;
          padding: 80px 20px;
          background: var(--white);
          border-radius: 32px;
        }
        .rw-empty-hero__icon {
          width: 64px;
          height: 64px;
          color: var(--text-muted);
          opacity: 0.5;
          margin-bottom: 24px;
        }
        .rw-empty-hero__title {
          font-family: var(--ff-display);
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .rw-empty-hero__text {
          color: var(--text-muted);
          margin-bottom: 32px;
        }
        .rw-empty-hero__btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: var(--accent);
          color: var(--white);
          border-radius: 100px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }
        .rw-empty-hero__btn:hover {
          background: var(--accent-dark);
          gap: 12px;
        }
        .rw-empty-hero__btn-icon {
          width: 16px;
          height: 16px;
        }

        .rw-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 24px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }
        .rw-toast--success {
          background: #10b981;
          color: white;
        }
        .rw-toast--error {
          background: #ef4444;
          color: white;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .rw-page-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .rw-page-loading__spinner {
          width: 48px;
          height: 48px;
          border: 2px solid var(--surface);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }
        .rw-page-loading__text {
          color: var(--text-muted);
        }

        .rw-page-error {
          text-align: center;
          padding: 60px 20px;
        }
        .rw-page-error__icon {
          width: 48px;
          height: 48px;
          color: #ef4444;
          margin: 0 auto 16px;
        }
        .rw-page-error__title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .rw-page-error__text {
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .rw-page-error__btn {
          padding: 10px 24px;
          background: var(--ink);
          color: var(--white);
          border: none;
          border-radius: 100px;
          cursor: pointer;
        }

        .rw-empty-state {
          text-align: center;
          padding: 60px 20px;
          background: var(--white);
          border-radius: 24px;
        }
        .rw-empty-state__icon {
          width: 48px;
          height: 48px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .rw-empty-state__title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .rw-empty-state__text {
          color: var(--text-muted);
          font-size: 13px;
          margin-bottom: 20px;
        }
        .rw-empty-state__btn {
          padding: 10px 24px;
          background: var(--ink);
          color: var(--white);
          border: none;
          border-radius: 100px;
          cursor: pointer;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}