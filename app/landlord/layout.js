// app/landlord/layout.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function LandlordLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetch('/api/landlord/applications?status=pending', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => setPendingCount(d.applications?.length || 0))
        .catch(() => {});
    }
  }, [mounted]);

  const menuItems = [
    { path: '/landlord/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/landlord/listings', label: 'My Listings', icon: BuildingOfficeIcon },
    { path: '/landlord/applications', label: 'Applications', icon: DocumentTextIcon, badge: pendingCount || null },
    { path: '/landlord/messages', label: 'Messages', icon: ChatBubbleLeftIcon },
    { path: '/landlord/analytics', label: 'Analytics', icon: ChartBarIcon },
    { path: '/landlord/profile', label: 'Profile', icon: UserIcon },
    { path: '/landlord/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => pathname === path;

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', fontFamily: 'var(--ff-body)', display: 'flex' }}>

      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 149 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`rw-ll-sidebar ${sidebarOpen ? 'rw-ll-sidebar--open' : ''}`}
      >
        {/* Logo */}
        <div className="rw-ll-sidebar__logo">
          <Link href="/" className="rw-tl-logo">
            <div className="rw-tl-logo__mark">
              <HomeIcon style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <div>
              <span className="rw-tl-logo__text" style={{ fontSize: 18, display: 'block', lineHeight: 1.2 }}>
                Rent<span>BW</span>
              </span>
              <span style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Landlord
              </span>
            </div>
          </Link>
          <button
            className="rw-ll-sidebar__close lg-hide"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 12px', flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '12px 12px 8px' }}>
            Navigation
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`rw-ll-nav-item ${isActive(item.path) ? 'rw-ll-nav-item--active' : ''}`}
              >
                <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge ? (
                  <span className="rw-tl-badge">{item.badge > 9 ? '9+' : item.badge}</span>
                ) : null}
              </Link>
            );
          })}

          <div style={{ marginTop: 24, padding: '0 12px' }}>
            <Link
              href="/landlord/listings/new"
              className="rw-ll-cta-btn"
              onClick={() => setSidebarOpen(false)}
            >
              <PlusIcon style={{ width: 16, height: 16 }} />
              List a Property
            </Link>
          </div>
        </nav>

        {/* User bottom */}
        {user && (
          <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="rw-tl-avatar" style={{ flexShrink: 0 }}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>{user.name?.charAt(0).toUpperCase()}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Landlord</p>
              </div>
              <button
                onClick={async () => logout()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--text-muted)' }}
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
            borderBottom: '1px solid rgba(14,14,14,0.06)',
            boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.05)' : 'none',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            transition: 'all 0.3s var(--ease-out)',
          }}
        >
          <div style={{ padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            {/* Hamburger (mobile) */}
            <button
              className="rw-ll-hamburger"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon style={{ width: 22, height: 22 }} />
            </button>

            {/* Page title */}
            <p style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }} className="rw-ll-page-title">
              {menuItems.find((m) => isActive(m.path))?.label || 'Landlord'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 8, borderRadius: '50%', color: 'var(--ink-soft)' }}>
                <BellIcon style={{ width: 20, height: 20 }} />
              </button>

              {user && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="rw-tl-user"
                  >
                    <div className="rw-tl-avatar">
                      {user.avatar
                        ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span>{user.name?.charAt(0).toUpperCase()}</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }} className="rw-ll-username">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDownIcon style={{ width: 14, height: 14, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setUserMenuOpen(false)} />
                      <div className="rw-tl-dropdown">
                        <Link href="/landlord/profile" className="rw-tl-dropdown__item" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                        <Link href="/landlord/settings" className="rw-tl-dropdown__item" onClick={() => setUserMenuOpen(false)}>Settings</Link>
                        <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #eee' }} />
                        <button onClick={async () => { await logout(); setUserMenuOpen(false); }} className="rw-tl-dropdown__item rw-tl-dropdown__item--danger">
                          <ArrowRightOnRectangleIcon style={{ width: 14, height: 14 }} />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '36px 32px' }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');

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
          --border: rgba(14,14,14,0.07);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: var(--ff-body);
          background: var(--surface);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Sidebar ── */
        .rw-ll-sidebar {
          width: 240px;
          background: #ffffff;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
        }
        @media (max-width: 1024px) {
          .rw-ll-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 150;
            transform: translateX(-100%);
            transition: transform 0.28s var(--ease-out);
            height: 100%;
          }
          .rw-ll-sidebar--open {
            transform: translateX(0);
          }
        }

        .rw-ll-sidebar__logo {
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rw-ll-sidebar__close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: var(--text-muted);
          border-radius: 8px;
        }
        .lg-hide { display: none; }
        @media (max-width: 1024px) { .lg-hide { display: flex; } }

        /* ── Sidebar Nav Items ── */
        .rw-ll-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          color: var(--ink-soft);
          transition: all 0.18s;
          margin-bottom: 2px;
        }
        .rw-ll-nav-item:hover {
          background: rgba(200,169,110,0.07);
          color: var(--accent);
        }
        .rw-ll-nav-item--active {
          background: rgba(200,169,110,0.13);
          color: var(--accent);
          font-weight: 600;
        }

        /* ── CTA button in sidebar ── */
        .rw-ll-cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 20px;
          background: var(--ink);
          color: #fff;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
        }
        .rw-ll-cta-btn:hover {
          background: var(--accent);
          transform: translateY(-1px);
        }

        /* ── Shared pieces (also used by tenant/investor/admin) ── */
        .rw-tl-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .rw-tl-logo__mark {
          width: 34px;
          height: 34px;
          background: var(--ink);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rw-tl-logo__text {
          font-family: var(--ff-body);
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ink);
        }
        .rw-tl-logo__text span { color: var(--accent); }

        .rw-tl-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #fff;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid rgba(200,169,110,0.3);
        }

        .rw-tl-badge {
          background: var(--accent);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .rw-tl-user {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 12px 6px 6px;
          border-radius: 100px;
          transition: background 0.2s;
        }
        .rw-tl-user:hover { background: var(--surface); }

        .rw-tl-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 200px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
          z-index: 999;
          animation: rwFadeDown 0.18s var(--ease-out);
        }
        @keyframes rwFadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rw-tl-dropdown__item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          color: var(--ink);
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.15s;
        }
        .rw-tl-dropdown__item:hover { background: var(--surface); }
        .rw-tl-dropdown__item--danger { color: #ef4444; }

        /* ── Hamburger (mobile) ── */
        .rw-ll-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--ink);
        }
        @media (max-width: 1024px) { .rw-ll-hamburger { display: flex; } }

        .rw-ll-page-title { }
        @media (max-width: 640px) { .rw-ll-page-title { display: none; } }

        .rw-ll-username { }
        @media (max-width: 768px) { .rw-ll-username { display: none; } }

        /* ── Spinner ── */
        .rw-spinner {
          width: 36px;
          height: 36px;
          border: 2px solid var(--surface);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: rwSpin 0.7s linear infinite;
        }
        @keyframes rwSpin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          main { padding: 24px 20px !important; }
        }
      `}</style>
    </div>
  );
}