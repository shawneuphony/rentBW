// app/property/search/page.js
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/ui/Header';
import Footer from '@/app/components/ui/Footer';
import PropertyCard from '@/app/components/ui/PropertyCard';
import {
  MapPinIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Refs for scroll animations
  const resultsRef = useRef(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  
  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    minPrice: 2000,
    maxPrice: 25000,
    location: '',
    type: 'all',
    beds: 'any',
  });
  
  const [sortBy, setSortBy] = useState('newest');
  const [searchLocation, setSearchLocation] = useState('');
  
  // Animation on load
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Get URL params on mount
  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    const neighborhood = searchParams.get('neighborhood');
    
    if (q) {
      setSearchLocation(q);
      setFilters(prev => ({ ...prev, location: q }));
    }
    if (type && type !== 'all') {
      setFilters(prev => ({ ...prev, type: type }));
    }
    if (neighborhood) {
      setSearchLocation(neighborhood);
      setFilters(prev => ({ ...prev, location: neighborhood }));
    }
  }, [searchParams]);
  
  // Fetch properties with filters
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.location) params.set('location', filters.location);
      if (filters.minPrice > 2000) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice < 25000) params.set('maxPrice', filters.maxPrice);
      if (filters.beds !== 'any') {
        const bedsValue = filters.beds === '3+' ? '3' : filters.beds;
        params.set('beds', bedsValue);
      }
      if (filters.type !== 'all') params.set('type', filters.type);
      
      if (sortBy === 'price-asc') params.set('sort', 'price_asc');
      else if (sortBy === 'price-desc') params.set('sort', 'price_desc');
      else if (sortBy === 'trending') params.set('sort', 'trending');
      else params.set('sort', 'newest');
      
      params.set('limit', '50');
      
      const response = await fetch(`/api/properties?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch properties');
      }
      
      const data = await response.json();
      const propertiesList = data.properties || [];
      setProperties(propertiesList);
      setTotalCount(propertiesList.length);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);
  
  // Fetch on filter/sort change
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);
  
  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, location: searchLocation }));
  };
  
  const handleClearFilters = () => {
    setFilters({
      minPrice: 2000,
      maxPrice: 25000,
      location: '',
      type: 'all',
      beds: 'any',
    });
    setSearchLocation('');
    setSortBy('newest');
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.minPrice > 2000 || filters.maxPrice < 25000) count++;
    if (filters.location) count++;
    if (filters.beds !== 'any') count++;
    if (filters.type !== 'all') count++;
    return count;
  };
  
  const getTypeLabel = (type) => {
    const types = {
      apartment: 'Apartment',
      house: 'House',
      studio: 'Studio',
      townhouse: 'Townhouse',
      commercial: 'Commercial',
    };
    return types[type] || type;
  };

  // Filter options component for reuse
  const FilterOptions = () => (
    <div className="rw-filter-options">
      {/* Price Range */}
      <div className="rw-filter-group">
        <h4 className="rw-filter-group__title">Price (BWP/mo)</h4>
        <div className="rw-price-range">
          <div className="rw-price-range__values">
            <span>BWP {filters.minPrice.toLocaleString()}</span>
            <span>—</span>
            <span>BWP {filters.maxPrice.toLocaleString()}+</span>
          </div>
          <div className="rw-price-range__slider">
            <input
              type="range"
              min="2000"
              max="25000"
              step="500"
              value={filters.minPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) }))}
              className="rw-price-range__input rw-price-range__input--min"
            />
            <input
              type="range"
              min="2000"
              max="25000"
              step="500"
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
              className="rw-price-range__input rw-price-range__input--max"
            />
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div className="rw-filter-group">
        <h4 className="rw-filter-group__title">Property Type</h4>
        <div className="rw-filter-chips">
          {['all', 'apartment', 'house', 'studio', 'townhouse', 'commercial'].map((type) => (
            <button
              key={type}
              onClick={() => setFilters(prev => ({ ...prev, type }))}
              className={`rw-filter-chip ${filters.type === type ? 'rw-filter-chip--active' : ''}`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div className="rw-filter-group">
        <h4 className="rw-filter-group__title">Bedrooms</h4>
        <div className="rw-filter-chips">
          {['any', '1', '2', '3+'].map((option) => (
            <button
              key={option}
              onClick={() => setFilters(prev => ({ ...prev, beds: option }))}
              className={`rw-filter-chip ${filters.beds === option ? 'rw-filter-chip--active' : ''}`}
            >
              {option === 'any' ? 'Any' : option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />

      {/* Hero Section - Search Header */}
      <section className="rw-search-hero">
        <div className="rw-search-hero__bg">
          <img src="/images/sky.png" alt="" className="rw-search-hero__bg-img" />
          <div className="rw-search-hero__overlay" />
        </div>
        
        <div className="rw-search-hero__content">
          <p className={`rw-search-hero__eyebrow ${pageLoaded ? 'rw-reveal' : ''}`}>
            Find your next home
          </p>
          <h1 className={`rw-search-hero__title ${pageLoaded ? 'rw-reveal rw-reveal--delay1' : ''}`}>
            Browse <em>properties.</em>
          </h1>
          
          {/* Search Bar */}
          <div className={`rw-search-hero__bar ${pageLoaded ? 'rw-reveal rw-reveal--delay2' : ''}`}>
            <div className="rw-search-hero__inner">
              <MagnifyingGlassIcon className="rw-search-hero__icon" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Search by location, neighborhood…"
                className="rw-search-hero__input"
              />
              <button onClick={handleSearchSubmit} className="rw-search-hero__btn">
                Search
              </button>
            </div>
          </div>
          
          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div className={`rw-active-filters ${pageLoaded ? 'rw-reveal rw-reveal--delay3' : ''}`}>
              <span className="rw-active-filters__label">Active filters:</span>
              <div className="rw-active-filters__list">
                {filters.type !== 'all' && (
                  <span className="rw-active-filter">
                    {getTypeLabel(filters.type)}
                    <button onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.location && (
                  <span className="rw-active-filter">
                    {filters.location}
                    <button onClick={() => {
                      setFilters(prev => ({ ...prev, location: '' }));
                      setSearchLocation('');
                    }}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.beds !== 'any' && (
                  <span className="rw-active-filter">
                    {filters.beds} {filters.beds === '1' ? 'bed' : 'beds'}
                    <button onClick={() => setFilters(prev => ({ ...prev, beds: 'any' }))}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(filters.minPrice > 2000 || filters.maxPrice < 25000) && (
                  <span className="rw-active-filter">
                    BWP {filters.minPrice.toLocaleString()}–{filters.maxPrice.toLocaleString()}
                    <button onClick={() => setFilters(prev => ({ ...prev, minPrice: 2000, maxPrice: 25000 }))}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button onClick={handleClearFilters} className="rw-active-filters__clear">
                  <ArrowPathIcon className="w-3 h-3" />
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="rw-search-main" ref={resultsRef}>
        <div className="rw-container">
          <div className="rw-search-layout">
            
            {/* Sidebar Filters - Desktop */}
            <aside className="rw-search-sidebar">
              <div className="rw-search-sidebar__header">
                <h3 className="rw-search-sidebar__title">Filters</h3>
                <button onClick={handleClearFilters} className="rw-search-sidebar__clear">
                  <ArrowPathIcon className="w-4 h-4" />
                  Reset
                </button>
              </div>
              <FilterOptions />
              <button onClick={fetchProperties} className="rw-search-sidebar__apply">
                Apply Filters
              </button>
            </aside>
            
            {/* Results Area */}
            <div className="rw-search-results">
              {/* Results Header */}
              <div className="rw-search-results__header">
                <div>
                  <span className="rw-search-results__count">{totalCount}</span>
                  <span className="rw-search-results__label">
                    {totalCount === 1 ? 'property found' : 'properties found'}
                  </span>
                </div>
                
                <div className="rw-search-results__sort">
                  <span className="rw-search-results__sort-label">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rw-search-results__select"
                  >
                    <option value="newest">Newest first</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="trending">Most Popular</option>
                  </select>
                </div>
                
                {/* Mobile filter button */}
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="rw-mobile-filter"
                >
                  <FunnelIcon className="w-5 h-5" />
                  <span>Filters</span>
                  {getActiveFilterCount() > 0 && (
                    <span className="rw-mobile-filter__badge">{getActiveFilterCount()}</span>
                  )}
                </button>
              </div>
              
              {/* Error State */}
              {error && (
                <div className="rw-error">
                  <div className="rw-error__icon">!</div>
                  <h3 className="rw-error__title">Something went wrong</h3>
                  <p className="rw-error__desc">{error}</p>
                  <button onClick={fetchProperties} className="rw-error__btn">
                    Try Again
                  </button>
                </div>
              )}
              
              {/* Loading State */}
              {loading && properties.length === 0 ? (
                <div className="rw-loading">
                  <div className="rw-loading__spinner" />
                  <p className="rw-loading__text">Finding properties for you...</p>
                </div>
              ) : properties.length > 0 ? (
                <div className="rw-prop-grid">
                  {properties.map((property, i) => (
                    <div key={property.id} className="rw-prop-wrap" style={{ '--i': i }}>
                      <PropertyCard property={property} />
                    </div>
                  ))}
                </div>
              ) : !error && !loading ? (
                <div className="rw-empty">
                  <div className="rw-empty__icon">🏠</div>
                  <h3 className="rw-empty__title">No properties found</h3>
                  <p className="rw-empty__sub">
                    We couldn't find any properties matching your criteria.
                  </p>
                  <button onClick={handleClearFilters} className="rw-empty__btn">
                    Clear all filters
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="rw-mobile-modal">
          <div className="rw-mobile-modal__overlay" onClick={() => setShowMobileFilters(false)} />
          <div className="rw-mobile-modal__drawer">
            <div className="rw-mobile-modal__header">
              <h3 className="rw-mobile-modal__title">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="rw-mobile-modal__close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="rw-mobile-modal__body">
              <FilterOptions />
            </div>
            <div className="rw-mobile-modal__footer">
              <button onClick={handleClearFilters} className="rw-mobile-modal__clear">
                Clear all
              </button>
              <button 
                onClick={() => {
                  fetchProperties();
                  setShowMobileFilters(false);
                }} 
                className="rw-mobile-modal__apply"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Styles */}
      <style jsx global>{`
        /* ── Tokens ── */
        :root {
          --ink: #0e0e0e;
          --ink-soft: #2a2a2a;
          --surface: #f5f3ef;
          --offwhite: #faf9f6;
          --white: #ffffff;
          --accent: #c8a96e;
          --accent-dark: #a8893e;
          --text-muted: #6b6b6b;
          --ff-display: 'Playfair Display', Georgia, serif;
          --ff-body: 'DM Sans', sans-serif;
          --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ── Search Hero ── */
        .rw-search-hero {
          position: relative;
          min-height: 45vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .rw-search-hero__bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .rw-search-hero__bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          filter: brightness(0.7) saturate(0.85);
        }
        .rw-search-hero__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(14,14,14,0.4) 0%, rgba(14,14,14,0.7) 100%);
        }
        .rw-search-hero__content {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 80px 40px 60px;
          width: 100%;
        }
        .rw-search-hero__eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 16px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out);
        }
        .rw-search-hero__title {
          font-family: var(--ff-display);
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 900;
          line-height: 1.05;
          color: var(--white);
          margin-bottom: 32px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s var(--ease-out) 0.12s, transform 0.8s var(--ease-out) 0.12s;
        }
        .rw-search-hero__title em {
          font-style: italic;
          color: var(--accent);
        }
        .rw-search-hero__bar {
          max-width: 560px;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s var(--ease-out) 0.24s, transform 0.7s var(--ease-out) 0.24s;
        }
        .rw-search-hero__inner {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.96);
          border-radius: 100px;
          padding: 4px 4px 4px 20px;
          gap: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }
        .rw-search-hero__icon {
          width: 20px;
          height: 20px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .rw-search-hero__input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 15px;
          min-width: 0;
        }
        .rw-search-hero__btn {
          background: var(--ink);
          color: var(--white);
          border: none;
          padding: 12px 28px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s;
        }
        .rw-search-hero__btn:hover { background: var(--accent); }

        /* Active filters */
        .rw-active-filters {
          margin-top: 24px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s var(--ease-out) 0.36s, transform 0.6s var(--ease-out) 0.36s;
        }
        .rw-active-filters__label {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
        }
        .rw-active-filters__list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rw-active-filter {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(4px);
          border-radius: 100px;
          font-size: 12px;
          color: var(--white);
        }
        .rw-active-filter button {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.6);
          display: flex;
          align-items: center;
          padding: 0;
        }
        .rw-active-filters__clear {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 12px;
          color: var(--accent);
          cursor: pointer;
          padding: 6px 12px;
        }

        /* Main layout */
        .rw-search-main {
          background: var(--surface);
          padding: 60px 0 80px;
        }
        .rw-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }
        @media (max-width: 768px) { .rw-container { padding: 0 20px; } }

        .rw-search-layout {
          display: flex;
          gap: 48px;
        }
        @media (max-width: 1024px) { .rw-search-layout { flex-direction: column; } }

        /* Sidebar */
        .rw-search-sidebar {
          width: 300px;
          flex-shrink: 0;
          background: var(--white);
          border-radius: 24px;
          padding: 28px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        @media (max-width: 1024px) { .rw-search-sidebar { display: none; } }
        .rw-search-sidebar__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }
        .rw-search-sidebar__title {
          font-family: var(--ff-display);
          font-size: 20px;
          font-weight: 700;
        }
        .rw-search-sidebar__clear {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-size: 12px;
          color: var(--text-muted);
          cursor: pointer;
        }
        .rw-search-sidebar__apply {
          width: 100%;
          margin-top: 28px;
          padding: 14px;
          background: var(--ink);
          color: var(--white);
          border: none;
          border-radius: 100px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.25s;
        }
        .rw-search-sidebar__apply:hover { background: var(--accent); }

        /* Filter groups */
        .rw-filter-group {
          margin-bottom: 32px;
        }
        .rw-filter-group__title {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .rw-filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rw-filter-chip {
          padding: 8px 16px;
          background: var(--surface);
          border: 1px solid #e0e0e0;
          border-radius: 100px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rw-filter-chip--active {
          background: var(--ink);
          border-color: var(--ink);
          color: var(--white);
        }
        .rw-filter-chip:hover:not(.rw-filter-chip--active) {
          border-color: var(--accent);
        }

        /* Price range */
        .rw-price-range__values {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 16px;
          color: var(--text-muted);
        }
        .rw-price-range__slider {
          position: relative;
          height: 4px;
          background: #e0e0e0;
          border-radius: 4px;
        }
        .rw-price-range__input {
          position: absolute;
          top: 0;
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          background: transparent;
          pointer-events: none;
        }
        .rw-price-range__input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
          border: 2px solid var(--white);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .rw-price-range__input--min { z-index: 2; }
        .rw-price-range__input--max { z-index: 1; }

        /* Results */
        .rw-search-results {
          flex: 1;
          min-width: 0;
        }
        .rw-search-results__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .rw-search-results__count {
          font-family: var(--ff-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--accent);
        }
        .rw-search-results__label {
          font-size: 15px;
          color: var(--text-muted);
          margin-left: 6px;
        }
        .rw-search-results__sort {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rw-search-results__sort-label {
          font-size: 13px;
          color: var(--text-muted);
        }
        .rw-search-results__select {
          padding: 10px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 100px;
          background: var(--white);
          font-size: 13px;
          cursor: pointer;
        }

        /* Mobile filter button */
        .rw-mobile-filter {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--white);
          border: 1px solid #e0e0e0;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
        }
        @media (max-width: 1024px) { .rw-mobile-filter { display: flex; } }
        .rw-mobile-filter__badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: var(--accent);
          color: var(--white);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 100px;
        }

        /* Property grid */
        .rw-prop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) { .rw-prop-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .rw-prop-grid { grid-template-columns: 1fr; } }

        .rw-prop-wrap {
          transition-delay: calc(var(--i) * 60ms);
        }

        /* Mobile modal */
        .rw-mobile-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
        }
        .rw-mobile-modal__overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
        }
        .rw-mobile-modal__drawer {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 85%;
          max-width: 320px;
          background: var(--white);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s var(--ease-out);
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .rw-mobile-modal__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        .rw-mobile-modal__title {
          font-family: var(--ff-display);
          font-size: 20px;
          font-weight: 700;
        }
        .rw-mobile-modal__close {
          background: none;
          border: none;
          cursor: pointer;
        }
        .rw-mobile-modal__body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .rw-mobile-modal__footer {
          display: flex;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #eee;
        }
        .rw-mobile-modal__clear {
          flex: 1;
          padding: 14px;
          background: var(--surface);
          border: none;
          border-radius: 100px;
          font-weight: 600;
          cursor: pointer;
        }
        .rw-mobile-modal__apply {
          flex: 1;
          padding: 14px;
          background: var(--ink);
          color: var(--white);
          border: none;
          border-radius: 100px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Loading & empty states */
        .rw-loading {
          text-align: center;
          padding: 80px 0;
        }
        .rw-loading__spinner {
          width: 48px;
          height: 48px;
          border: 2px solid var(--surface);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 20px;
        }
        .rw-loading__text {
          color: var(--text-muted);
        }
        .rw-empty {
          text-align: center;
          padding: 80px 24px;
          background: var(--white);
          border-radius: 24px;
        }
        .rw-empty__icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .rw-empty__title {
          font-family: var(--ff-display);
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .rw-empty__sub {
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .rw-empty__btn {
          padding: 12px 28px;
          background: var(--ink);
          color: var(--white);
          border: none;
          border-radius: 100px;
          font-weight: 600;
          cursor: pointer;
        }
        .rw-error {
          text-align: center;
          padding: 60px 24px;
          background: var(--white);
          border-radius: 24px;
        }
        .rw-error__icon {
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
        .rw-error__title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .rw-error__desc {
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        .rw-error__btn {
          padding: 10px 24px;
          background: var(--ink);
          color: var(--white);
          border: none;
          border-radius: 100px;
          cursor: pointer;
        }

        /* Reveal animations */
        .rw-reveal { opacity: 1 !important; transform: translateY(0) !important; }
        .rw-reveal--delay1 { transition-delay: 0.12s !important; }
        .rw-reveal--delay2 { transition-delay: 0.24s !important; }
        .rw-reveal--delay3 { transition-delay: 0.36s !important; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}