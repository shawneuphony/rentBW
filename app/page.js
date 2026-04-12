// app/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import PropertyCard from '@/app/components/ui/PropertyCard';
import Header from '@/app/components/ui/Header';
import Footer from '@/app/components/ui/Footer';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
  KeyIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [trendingProperties, setTrendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    happyTenants: 0,
    verifiedLandlords: 0,
  });

  const whyRef = useRef(null);
  const featuredRef = useRef(null);
  const servicesRef = useRef(null);
  const neighborhoodsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.visible = 'true';
            const children = entry.target.querySelectorAll('[data-reveal]');
            children.forEach((child, i) => {
              child.style.transitionDelay = `${i * 80}ms`;
              child.dataset.visible = 'true';
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    [whyRef, featuredRef, servicesRef, neighborhoodsRef, ctaRef].forEach((r) => {
      if (r.current) observer.observe(r.current);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, []);

  const fetchProperties = async () => {
    try {
      const [featuredRes, trendingRes] = await Promise.all([
        fetch('/api/properties?sort=newest&limit=6'),
        fetch('/api/properties?sort=trending&limit=6'),
      ]);
      const featuredData = await featuredRes.json();
      const trendingData = await trendingRes.json();
      setFeaturedProperties(featuredData.properties || []);
      setTrendingProperties(trendingData.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats({
        totalProperties: data.totalProperties || 1200,
        happyTenants: data.happyTenants || 500,
        verifiedLandlords: data.verifiedLandlords || 300,
      });
    } catch {
      setStats({ totalProperties: 1200, happyTenants: 500, verifiedLandlords: 300 });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/property/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const serviceCards = [
    {
      title: 'Investment Analysis',
      description: 'Expert guidance to maximise returns on your Gaborone portfolio.',
      icon: DocumentTextIcon,
      link: '/investor/dashboard',
      cta: 'Go to Dashboard',
      num: '01',
    },
    {
      title: 'Property Management',
      description: 'Full-service management so your rental income never sleeps.',
      icon: KeyIcon,
      link: '/landlord/dashboard',
      cta: 'Go to Dashboard',
      num: '02',
    },
    {
      title: 'Tenant Services',
      description: 'Everything you need from application to move-in, handled.',
      icon: WrenchScrewdriverIcon,
      link: '/tenant/dashboard',
      cta: 'Go to Dashboard',
      num: '03',
    },
  ];

  const neighborhoods = [
    { name: 'Phakalane', description: 'Family-friendly suburb', price: 'From BWP 5,500/mo' },
    { name: 'CBD', description: 'Urban living', price: 'From BWP 4,200/mo' },
    { name: 'Block 8', description: 'Modern community', price: 'From BWP 6,000/mo' },
    { name: 'Broadhurst', description: 'Convenient location', price: 'From BWP 4,800/mo' },
  ];

  return (
    <>
      <Header />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="rw-hero">
        {/* sky image layer */}
        <div className="rw-hero__bg">
          <img
            src="/images/sky.png"
            alt=""
            className={`rw-hero__bg-img ${heroLoaded ? 'rw-hero__bg-img--loaded' : ''}`}
          />
          <div className="rw-hero__overlay" />
        </div>

        {/* content */}
        <div className="rw-hero__content">
          <p className={`rw-hero__eyebrow ${heroLoaded ? 'rw-reveal' : ''}`}>
            Botswana's most trusted rental platform
          </p>

          <h1 className={`rw-hero__title ${heroLoaded ? 'rw-reveal rw-reveal--delay1' : ''}`}>
            No Stress,<br />
            <em>Just Address</em>
          </h1>

          <p className={`rw-hero__sub ${heroLoaded ? 'rw-reveal rw-reveal--delay2' : ''}`}>
            Find your next spot in Gaborone with RentBW
          </p>

          {/* search */}
          <form
            onSubmit={handleSearch}
            className={`rw-search ${heroLoaded ? 'rw-reveal rw-reveal--delay3' : ''}`}
          >
            <div className="rw-search__inner">
              <MagnifyingGlassIcon className="rw-search__icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Location, type, or keyword…"
                className="rw-search__input"
              />
              <button type="submit" className="rw-search__btn">
                Find Properties <ArrowRightIcon className="rw-search__btn-icon" />
              </button>
            </div>
          </form>

          {/* quick filters */}
          <div className={`rw-filters ${heroLoaded ? 'rw-reveal rw-reveal--delay4' : ''}`}>
            {['Apartment', 'House', 'Studio', 'Commercial'].map((f) => (
              <Link
                key={f}
                href={`/property/search?type=${f.toLowerCase()}`}
                className="rw-filter-pill"
              >
                {f}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ────────────────────────────────────────── */}
      <div className="rw-stats">
        {[
          { value: stats.totalProperties.toLocaleString() + '+', label: 'Properties Listed' },
          { value: stats.happyTenants.toLocaleString() + '+', label: 'Happy Tenants' },
          { value: stats.verifiedLandlords.toLocaleString() + '+', label: 'Verified Landlords' },
        ].map((s) => (
          <div key={s.label} className="rw-stats__item">
            <span className="rw-stats__value">{s.value}</span>
            <span className="rw-stats__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ─── WHY CHOOSE US ────────────────────────────────────── */}
      <section ref={whyRef} className="rw-section rw-section--light rw-section--why" data-visible="false">
        <div className="rw-container">
          <div className="rw-section__header" data-reveal>
            <span className="rw-label">Why RentBW</span>
            <h2 className="rw-section__title">
              Real estate,<br /><em>rewired.</em>
            </h2>
          </div>

          <div className="rw-why-grid">
            {[
              {
                icon: CheckBadgeIcon,
                title: 'Verified Landlords',
                desc: 'All landlords are verified to ensure safe and legitimate transactions.',
              },
              {
                icon: MagnifyingGlassIcon,
                title: 'Smart Search',
                desc: "Find exactly what you're looking for with our advanced filtering system.",
              },
              {
                icon: ChartBarIcon,
                title: 'Market Insights',
                desc: 'Real-time market data and investment insights for savvy investors.',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="rw-why-card" data-reveal style={{ '--i': i }}>
                  <div className="rw-why-card__num">0{i + 1}</div>
                  <div className="rw-why-card__icon">
                    <Icon />
                  </div>
                  <h3 className="rw-why-card__title">{item.title}</h3>
                  <p className="rw-why-card__desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────── */}
      <section ref={servicesRef} className="rw-section rw-section--dark" data-visible="false">
        <div className="rw-container">
          <div className="rw-section__header rw-section__header--white" data-reveal>
            <span className="rw-label rw-label--white">Services</span>
            <h2 className="rw-section__title rw-section__title--white">
              Support beyond<br /><em>buying & selling.</em>
            </h2>
            <p className="rw-section__sub">
              The market never stands still — and neither do we.
            </p>
          </div>

          <div className="rw-services-grid">
            {serviceCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rw-service-card" data-reveal style={{ '--i': i }}>
                  <div className="rw-service-card__num">{s.num}</div>
                  <div className="rw-service-card__body">
                    <div className="rw-service-card__icon">
                      <Icon />
                    </div>
                    <h3 className="rw-service-card__title">{s.title}</h3>
                    <p className="rw-service-card__desc">{s.description}</p>
                  </div>
                  <Link href={s.link} className="rw-service-card__cta">
                    {s.cta}
                    <ArrowRightIcon className="rw-service-card__arrow" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROPERTIES ──────────────────────────────── */}
      <section ref={featuredRef} className="rw-section rw-section--light" data-visible="false">
        <div className="rw-container">
          <div className="rw-section__row" data-reveal>
            <div>
              <span className="rw-label">New Listings</span>
              <h2 className="rw-section__title">Featured<br /><em>properties.</em></h2>
            </div>
            <Link href="/property/search" className="rw-link-arrow">
              View All
              <ArrowRightIcon className="rw-link-arrow__icon" />
            </Link>
          </div>

          {loading ? (
            <div className="rw-loading">
              <div className="rw-loading__spinner" />
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="rw-prop-grid">
              {featuredProperties.map((property, i) => (
                <div
                  key={property.id}
                  data-reveal
                  style={{ '--i': i }}
                  className="rw-prop-wrap"
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rw-empty">
              <BuildingOfficeIcon className="rw-empty__icon" />
              <p className="rw-empty__title">No properties yet</p>
              <p className="rw-empty__sub">Check back soon for new listings</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── TRENDING ─────────────────────────────────────────── */}
      {trendingProperties.length > 0 && (
        <section className="rw-section rw-section--offwhite">
          <div className="rw-container">
            <div className="rw-section__row">
              <div>
                <span className="rw-label">Trending Now</span>
                <h2 className="rw-section__title">Most viewed<br /><em>this week.</em></h2>
              </div>
            </div>
            <div className="rw-prop-grid">
              {trendingProperties.slice(0, 3).map((property, i) => (
                <div key={property.id} className="rw-prop-wrap" style={{ '--i': i }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── NEIGHBORHOODS ────────────────────────────────────── */}
      <section ref={neighborhoodsRef} className="rw-section rw-section--dark" data-visible="false">
        <div className="rw-container">
          <div className="rw-section__header rw-section__header--white" data-reveal>
            <span className="rw-label rw-label--white">Explore</span>
            <h2 className="rw-section__title rw-section__title--white">
              Popular<br /><em>neighborhoods.</em>
            </h2>
            <p className="rw-section__sub">
              Gaborone's most sought-after areas, all in one place.
            </p>
          </div>

          <div className="rw-hoods-grid">
            {neighborhoods.map((n, i) => (
              <Link
                key={n.name}
                href={`/property/search?neighborhood=${n.name}`}
                className="rw-hood-card"
                data-reveal
                style={{ '--i': i }}
              >
                <div className="rw-hood-card__bg" />
                <div className="rw-hood-card__content">
                  <p className="rw-hood-card__desc">{n.description}</p>
                  <h3 className="rw-hood-card__name">{n.name}</h3>
                  <p className="rw-hood-card__price">{n.price}</p>
                  <div className="rw-hood-card__cta">
                    View properties
                    <ChevronRightIcon className="rw-hood-card__arrow" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section ref={ctaRef} className="rw-section rw-section--cta" data-visible="false">
        <div className="rw-cta-inner" data-reveal>
          <span className="rw-label rw-label--white">Get Started</span>
          <h2 className="rw-cta__title">
            {user ? 'Ready to find your new home?' : 'Find what moves you.'}
          </h2>
          <p className="rw-cta__sub">
            {user
              ? 'Browse thousands of properties and find your perfect match.'
              : "Join thousands of satisfied renters and landlords on Botswana's most trusted platform."}
          </p>
          <div className="rw-cta__actions">
            {user ? (
              <Link href="/property/search" className="rw-btn rw-btn--white">
                Browse Properties <ArrowRightIcon className="rw-btn__icon" />
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="rw-btn rw-btn--white">
                  Get Started <ArrowRightIcon className="rw-btn__icon" />
                </Link>
                <Link href="/property/search" className="rw-btn rw-btn--outline">
                  Browse Properties
                </Link>
              </>
            )}
          </div>

          <div className="rw-cta__badges">
            {[
              { icon: ShieldCheckIcon, label: 'Verified Listings' },
              { icon: HeartIcon, label: '10,000+ Happy Users' },
              { icon: MapPinIcon, label: 'All of Gaborone' },
              { icon: ClockIcon, label: 'Fast Response' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rw-badge">
                <Icon className="rw-badge__icon" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* ─── GLOBAL STYLES ────────────────────────────────────── */}
      <style jsx global>{`
        /* ── Tokens ── */
        :root {
          --ink: #0e0e0e;
          --ink-soft: #2a2a2a;
          --surface: #f5f3ef;
          --offwhite: #faf9f6;
          --white: #ffffff;
          --accent: #c8a96e;      /* warm gold */
          --accent-dark: #a8893e;
          --primary: var(--accent);
          --text-muted: #6b6b6b;
          --ff-display: 'Playfair Display', Georgia, serif;
          --ff-body: 'DM Sans', sans-serif;
          --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
        }

        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: var(--ff-body);
          background: var(--surface);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Reveal system ── */
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.75s var(--ease-out), transform 0.75s var(--ease-out);
        }
        [data-visible="true"] [data-reveal],
        [data-reveal][data-visible="true"] {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Layout ── */
        .rw-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
        }
        @media (max-width: 768px) { .rw-container { padding: 0 20px; } }

        .rw-section {
          padding: 100px 0;
        }
        .rw-section--light { background: var(--offwhite); }
        .rw-section--offwhite { background: var(--surface); }
        .rw-section--dark { background: var(--ink); }
        .rw-section--cta { background: var(--ink-soft); }

        .rw-section__header { margin-bottom: 64px; }
        .rw-section__header--white {}
        .rw-section__row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 56px;
          gap: 20px;
        }

        .rw-label {
          display: inline-block;
          font-family: var(--ff-body);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 14px;
        }
        .rw-label--white { color: var(--accent); }

        .rw-section__title {
          font-family: var(--ff-display);
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 900;
          line-height: 1.05;
          color: var(--ink);
        }
        .rw-section__title em {
          font-style: italic;
          color: var(--accent);
        }
        .rw-section__title--white { color: var(--white); }
        .rw-section__sub {
          margin-top: 16px;
          font-size: 17px;
          color: rgba(255,255,255,0.55);
          max-width: 460px;
          line-height: 1.6;
        }

        /* ── HERO ── */
        .rw-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .rw-hero__bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .rw-hero__bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          transform: scale(1.06);
          transition: transform 8s ease-out;
          filter: brightness(0.75) saturate(0.9);
        }
        .rw-hero__bg-img--loaded { transform: scale(1); }

        .rw-hero__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(14,14,14,0.15) 0%,
            rgba(14,14,14,0.35) 50%,
            rgba(14,14,14,0.75) 100%
          );
        }

        .rw-hero__content {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
          padding-top: 80px;
          width: 100%;
        }

        .rw-hero__eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out);
          margin-bottom: 20px;
          display: block;
        }
        .rw-hero__title {
          font-family: var(--ff-display);
          font-size: clamp(52px, 9vw, 110px);
          font-weight: 900;
          line-height: 1;
          color: var(--white);
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s var(--ease-out) 0.12s, transform 0.8s var(--ease-out) 0.12s;
          margin-bottom: 24px;
          max-width: 800px;
        }
        .rw-hero__title em {
          font-style: italic;
          color: var(--accent);
        }
        .rw-hero__sub {
          font-size: clamp(16px, 2vw, 22px);
          color: rgba(255,255,255,0.8);
          max-width: 480px;
          line-height: 1.55;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s var(--ease-out) 0.24s, transform 0.7s var(--ease-out) 0.24s;
          margin-bottom: 44px;
        }
        .rw-reveal { opacity: 1 !important; transform: translateY(0) !important; }
        .rw-reveal--delay1 { transition-delay: 0.12s !important; }
        .rw-reveal--delay2 { transition-delay: 0.24s !important; }
        .rw-reveal--delay3 { transition-delay: 0.36s !important; }
        .rw-reveal--delay4 { transition-delay: 0.48s !important; }
        .rw-reveal--delay5 { transition-delay: 0.6s !important; }

        /* search */
        .rw-search {
          max-width: 660px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s var(--ease-out) 0.36s, transform 0.7s var(--ease-out) 0.36s;
          margin-bottom: 28px;
        }
        .rw-search__inner {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.96);
          border-radius: 100px;
          padding: 6px 6px 6px 22px;
          gap: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .rw-search__icon {
          width: 20px;
          height: 20px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .rw-search__input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--ff-body);
          font-size: 15px;
          color: var(--ink);
          min-width: 0;
        }
        .rw-search__input::placeholder { color: #aaa; }
        .rw-search__btn {
          background: var(--ink);
          color: var(--white);
          border: none;
          padding: 14px 28px;
          border-radius: 100px;
          font-family: var(--ff-body);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.25s, transform 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .rw-search__btn:hover { background: var(--accent); transform: scale(1.02); }
        .rw-search__btn-icon { width: 16px; height: 16px; }

        /* filters */
        .rw-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.6s var(--ease-out) 0.48s, transform 0.6s var(--ease-out) 0.48s;
        }
        .rw-filter-pill {
          padding: 9px 20px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: var(--white);
          text-decoration: none;
          transition: all 0.22s;
        }
        .rw-filter-pill:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--ink);
        }

        /* scroll indicator */
        .rw-hero__scroll {
          position: absolute;
          bottom: 40px;
          left: 40px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 14px;
          color: rgba(255,255,255,0.5);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0;
          transition: opacity 0.6s 0.6s;
        }
        .rw-hero__scroll-line {
          width: 40px;
          height: 1px;
          background: rgba(255,255,255,0.4);
        }

        /* ── STATS BAR ── */
        .rw-stats {
          display: flex;
          background: var(--ink);
          padding: 28px 40px;
        }
        .rw-stats__item {
          flex: 1;
          text-align: center;
          padding: 12px 16px;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .rw-stats__item:last-child { border-right: none; }
        .rw-stats__value {
          display: block;
          font-family: var(--ff-display);
          font-size: 26px;
          font-weight: 700;
          color: var(--accent);
        }
        .rw-stats__label {
          display: block;
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.08em;
          margin-top: 3px;
        }

        /* ── WHY GRID ── */
        .rw-why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        @media (max-width: 768px) { .rw-why-grid { grid-template-columns: 1fr; } }

        .rw-why-card {
          padding: 48px 40px;
          background: var(--white);
          position: relative;
          transition: background 0.3s;
          transition-delay: calc(var(--i) * 80ms);
        }
        .rw-why-card:hover { background: var(--ink); }
        .rw-why-card:hover .rw-why-card__title,
        .rw-why-card:hover .rw-why-card__num { color: var(--white); }
        .rw-why-card:hover .rw-why-card__desc { color: rgba(255,255,255,0.55); }
        .rw-why-card:hover .rw-why-card__icon svg { stroke: var(--accent); }

        .rw-why-card__num {
          font-family: var(--ff-display);
          font-size: 13px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 28px;
          display: block;
          transition: color 0.3s;
        }
        .rw-why-card__icon {
          width: 48px;
          height: 48px;
          margin-bottom: 24px;
        }
        .rw-why-card__icon svg {
          width: 100%;
          height: 100%;
          stroke: var(--ink);
          stroke-width: 1.5;
          transition: stroke 0.3s;
        }
        .rw-why-card__title {
          font-family: var(--ff-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 12px;
          transition: color 0.3s;
        }
        .rw-why-card__desc {
          font-size: 15px;
          line-height: 1.65;
          color: var(--text-muted);
          transition: color 0.3s;
        }

        /* ── SERVICES GRID ── */
        .rw-services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        @media (max-width: 768px) { .rw-services-grid { grid-template-columns: 1fr; } }

        .rw-service-card {
          padding: 52px 40px;
          border: 1px solid rgba(255,255,255,0.07);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0;
          cursor: default;
          overflow: hidden;
          transition: background 0.35s, border-color 0.35s;
          transition-delay: calc(var(--i) * 80ms);
        }
        .rw-service-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--accent);
          transform: translateY(100%);
          transition: transform 0.45s var(--ease-out);
          z-index: 0;
        }
        .rw-service-card:hover::before { transform: translateY(0); }
        .rw-service-card > * { position: relative; z-index: 1; }

        .rw-service-card__num {
          font-family: var(--ff-display);
          font-size: 13px;
          color: rgba(255,255,255,0.25);
          margin-bottom: 32px;
          font-weight: 700;
          transition: color 0.3s;
        }
        .rw-service-card:hover .rw-service-card__num { color: rgba(14,14,14,0.4); }

        .rw-service-card__body { flex: 1; }
        .rw-service-card__icon {
          width: 40px;
          height: 40px;
          margin-bottom: 20px;
        }
        .rw-service-card__icon svg {
          width: 100%;
          height: 100%;
          stroke: var(--accent);
          stroke-width: 1.5;
          transition: stroke 0.3s;
        }
        .rw-service-card:hover .rw-service-card__icon svg { stroke: var(--ink); }

        .rw-service-card__title {
          font-family: var(--ff-display);
          font-size: 24px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 14px;
          transition: color 0.3s;
        }
        .rw-service-card:hover .rw-service-card__title { color: var(--ink); }

        .rw-service-card__desc {
          font-size: 15px;
          line-height: 1.65;
          color: rgba(255,255,255,0.5);
          margin-bottom: 36px;
          transition: color 0.3s;
        }
        .rw-service-card:hover .rw-service-card__desc { color: rgba(14,14,14,0.7); }

        .rw-service-card__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--accent);
          text-decoration: none;
          text-transform: uppercase;
          border-bottom: 1px solid currentColor;
          padding-bottom: 2px;
          transition: color 0.3s, gap 0.2s;
        }
        .rw-service-card:hover .rw-service-card__cta { color: var(--ink); }
        .rw-service-card__cta:hover { gap: 14px; }
        .rw-service-card__arrow { width: 16px; height: 16px; }

        /* ── LINK ARROW ── */
        .rw-link-arrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: gap 0.2s;
          padding-bottom: 30px;
        }
        .rw-link-arrow:hover { gap: 14px; }
        .rw-link-arrow__icon { width: 18px; height: 18px; }

        /* ── PROPERTY GRID ── */
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

        .rw-loading {
          display: flex;
          justify-content: center;
          padding: 60px 0;
        }
        .rw-loading__spinner {
          width: 40px;
          height: 40px;
          border: 2px solid var(--surface);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .rw-empty {
          text-align: center;
          padding: 60px 24px;
          background: var(--white);
          border-radius: 16px;
        }
        .rw-empty__icon { width: 56px; height: 56px; color: #ccc; margin: 0 auto 16px; }
        .rw-empty__title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .rw-empty__sub { color: var(--text-muted); font-size: 15px; }

        /* ── NEIGHBORHOODS ── */
        .rw-hoods-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }
        @media (max-width: 1024px) { .rw-hoods-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .rw-hoods-grid { grid-template-columns: 1fr; } }

        .rw-hood-card {
          position: relative;
          height: 380px;
          overflow: hidden;
          text-decoration: none;
          display: block;
          transition-delay: calc(var(--i) * 70ms);
        }
        .rw-hood-card__bg {
          position: absolute;
          inset: 0;
          background: var(--ink-soft);
          transition: transform 0.7s var(--ease-out);
        }
        .rw-hood-card:hover .rw-hood-card__bg { transform: scale(1.06); }
        .rw-hood-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(14,14,14,0.85) 0%, transparent 60%);
        }
        .rw-hood-card__content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 32px 28px;
          z-index: 2;
        }
        .rw-hood-card__desc {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 8px;
        }
        .rw-hood-card__name {
          font-family: var(--ff-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 6px;
        }
        .rw-hood-card__price {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          margin-bottom: 16px;
        }
        .rw-hood-card__cta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          transition: color 0.2s, gap 0.2s;
        }
        .rw-hood-card:hover .rw-hood-card__cta { color: var(--accent); gap: 10px; }
        .rw-hood-card__arrow { width: 14px; height: 14px; }

        /* ── CTA SECTION ── */
        .rw-cta-inner {
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
          padding: 0 40px;
        }
        .rw-cta__title {
          font-family: var(--ff-display);
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 900;
          color: var(--white);
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .rw-cta__sub {
          font-size: 18px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
          margin-bottom: 44px;
        }
        .rw-cta__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          justify-content: center;
          margin-bottom: 56px;
        }
        .rw-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 100px;
          font-family: var(--ff-body);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.25s;
          cursor: pointer;
        }
        .rw-btn__icon { width: 18px; height: 18px; }
        .rw-btn--white {
          background: var(--white);
          color: var(--ink);
        }
        .rw-btn--white:hover { background: var(--accent); color: var(--ink); }
        .rw-btn--outline {
          background: transparent;
          color: var(--white);
          border: 1.5px solid rgba(255,255,255,0.3);
        }
        .rw-btn--outline:hover { border-color: var(--accent); color: var(--accent); }

        .rw-cta__badges {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 32px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .rw-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
        }
        .rw-badge__icon { width: 16px; height: 16px; }

        /* ── Responsive tweaks ── */
        @media (max-width: 768px) {
          .rw-hero__content { padding: 0 20px; padding-top: 80px; }
          .rw-hero__scroll { left: 20px; }
          .rw-stats { flex-wrap: wrap; padding: 16px 20px; }
          .rw-stats__item { flex: 0 0 50%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .rw-section { padding: 72px 0; }
          .rw-section__row { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </>
  );
}