// app/tenant/layout.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  HomeIcon,
  HeartIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function TenantLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetch('/api/messages/unread')
        .then((r) => r.json())
        .then((d) => setUnreadCount(d.count || 0))
        .catch(() => {});
    }
  }, [user]);

  const menuItems = [
    { path: '/tenant/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/tenant/saved', label: 'Saved', icon: HeartIcon },
    { path: '/tenant/applications', label: 'Applications', icon: DocumentTextIcon },
    { path: '/tenant/messages', label: 'Messages', icon: ChatBubbleLeftIcon, badge: unreadCount },
    { path: '/tenant/profile', label: 'Profile', icon: UserIcon },
    { path: '/tenant/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => pathname === path;

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', fontFamily: 'var(--ff-body)' }}>
      {/* ── Top Navigation ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.97)' : '#ffffff',
          borderBottom: '1px solid rgba(14,14,14,0.06)',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="rw-tl-container">
          {/* Logo */}
          <Link href="/" className="rw-tl-logo">
            <div className="rw-tl-logo__mark">
              <HomeIcon style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <span className="rw-tl-logo__text">
              Rent<span>BW</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="rw-tl-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`rw-tl-nav__link ${isActive(item.path) ? 'rw-tl-nav__link--active' : ''}`}
                >
                  <Icon style={{ width: 15, height: 15 }} />
                  {item.label}
                  {item.badge > 0 && (
                    <span className="rw-tl-badge">{item.badge > 9 ? '9+' : item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="rw-tl-actions">
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
                  <div className="rw-tl-user__info">
                    <p className="rw-tl-user__name">{user.name?.split(' ')[0]}</p>
                    <p className="rw-tl-user__role">Tenant</p>
                  </div>
                  <ChevronDownIcon
                    style={{
                      width: 14, height: 14,
                      transition: 'transform 0.2s',
                      transform: userMenuOpen ? 'rotate(180deg)' : 'none',
                      color: 'var(--ink)',
                    }}
                  />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="rw-tl-dropdown">
                      <Link href="/tenant/profile" className="rw-tl-dropdown__item" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                      <Link href="/tenant/settings" className="rw-tl-dropdown__item" onClick={() => setUserMenuOpen(false)}>Settings</Link>
                      <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #eee' }} />
                      <button
                        onClick={async () => { await logout(); setUserMenuOpen(false); }}
                        className="rw-tl-dropdown__item rw-tl-dropdown__item--danger"
                      >
                        <ArrowRightOnRectangleIcon style={{ width: 14, height: 14 }} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button className="rw-tl-mobile-btn" onClick={() => setMobileMenuOpen(true)}>
              <Bars3Icon style={{ width: 22, height: 22 }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="rw-tl-drawer">
            <div className="rw-tl-drawer__header">
              <Link href="/" className="rw-tl-logo" onClick={() => setMobileMenuOpen(false)}>
                <div className="rw-tl-logo__mark">
                  <HomeIcon style={{ width: 18, height: 18, color: '#fff' }} />
                </div>
                <span className="rw-tl-logo__text">Rent<span>BW</span></span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
              >
                <XMarkIcon style={{ width: 22, height: 22 }} />
              </button>
            </div>

            {user && (
              <div className="rw-tl-drawer__user">
                <div className="rw-tl-avatar rw-tl-avatar--lg">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span>{user.name?.charAt(0).toUpperCase()}</span>}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>Tenant</p>
                </div>
              </div>
            )}

            <nav style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rw-tl-drawer__link ${isActive(item.path) ? 'rw-tl-drawer__link--active' : ''}`}
                  >
                    <Icon style={{ width: 18, height: 18 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="rw-tl-badge">{item.badge > 9 ? '9+' : item.badge}</span>
                    )}
                  </Link>
                );
              })}
              {user && (
                <>
                  <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #eee' }} />
                  <button
                    onClick={async () => { await logout(); setMobileMenuOpen(false); }}
                    className="rw-tl-drawer__link"
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
                    Sign out
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* ── Page Content ── */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 40px' }}>
        {children}
      </main>

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
          --border: rgba(14,14,14,0.08);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: var(--ff-body);
          background: var(--surface);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Layout ── */
        .rw-tl-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }
        @media (max-width: 768px) { .rw-tl-container { padding: 0 20px; } }

        /* ── Logo ── */
        .rw-tl-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .rw-tl-logo__mark {
          width: 34px;
          height: 34px;
          background: var(--ink);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rw-tl-logo__text {
          font-family: var(--ff-body);
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ink);
          text-decoration: none;
        }
        .rw-tl-logo__text span { color: var(--accent); }

        /* ── Desktop Nav ── */
        .rw-tl-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }
        @media (max-width: 1024px) { .rw-tl-nav { display: none; } }

        .rw-tl-nav__link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          color: var(--ink-soft);
          transition: all 0.2s;
          position: relative;
          white-space: nowrap;
        }
        .rw-tl-nav__link:hover {
          background: rgba(200,169,110,0.08);
          color: var(--accent);
        }
        .rw-tl-nav__link--active {
          background: rgba(200,169,110,0.12);
          color: var(--accent);
          font-weight: 600;
        }

        /* ── Badge ── */
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

        /* ── User Menu ── */
        .rw-tl-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
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
        .rw-tl-avatar--lg {
          width: 48px;
          height: 48px;
          font-size: 20px;
        }

        .rw-tl-user__info { text-align: left; }
        .rw-tl-user__name {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          line-height: 1.2;
        }
        .rw-tl-user__role {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: capitalize;
        }
        @media (max-width: 768px) { .rw-tl-user__info { display: none; } }

        /* ── Dropdown ── */
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

        /* ── Mobile button ── */
        .rw-tl-mobile-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--ink);
        }
        @media (max-width: 1024px) { .rw-tl-mobile-btn { display: flex; } }

        /* ── Mobile Drawer ── */
        .rw-tl-drawer {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 85%;
          max-width: 320px;
          background: #fff;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          animation: rwSlideIn 0.28s var(--ease-out);
        }
        @keyframes rwSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .rw-tl-drawer__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }
        .rw-tl-drawer__user {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 20px 12px;
          margin: 0 16px 4px;
          background: var(--surface);
          border-radius: 16px;
          margin-top: 16px;
        }
        .rw-tl-drawer__link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          color: var(--ink-soft);
          transition: background 0.18s;
        }
        .rw-tl-drawer__link:hover { background: var(--surface); color: var(--ink); }
        .rw-tl-drawer__link--active {
          background: rgba(200,169,110,0.12);
          color: var(--accent);
          font-weight: 600;
        }

        /* ── Page-level spinner ── */
        .rw-spinner {
          width: 36px;
          height: 36px;
          border: 2px solid var(--surface);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: rwSpin 0.7s linear infinite;
        }
        @keyframes rwSpin { to { transform: rotate(360deg); } }

        /* ── Responsive main padding ── */
        @media (max-width: 768px) {
          main { padding: 24px 20px !important; }
        }
      `}</style>
    </div>
  );
}