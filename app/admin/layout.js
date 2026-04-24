// app/admin/layout.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  HomeIcon,
  ChartBarIcon,
  FlagIcon,
  UsersIcon,
  CubeIcon,
  Cog6ToothIcon,
  BellIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [moderationCount, setModerationCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetch('/api/admin/stats', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => setModerationCount(d.pendingReports || 0))
        .catch(() => {});
    }
  }, [mounted]);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/admin/moderation', label: 'Moderation', icon: FlagIcon, badge: moderationCount || null },
    { path: '/admin/users', label: 'Users', icon: UsersIcon },
    { path: '/admin/data-management', label: 'Data', icon: CubeIcon },
    { path: '/admin/reports', label: 'Reports', icon: ChartBarIcon },
    { path: '/admin/profile', label: 'Profile', icon: UserIcon },
    { path: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => pathname === path;

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', fontFamily: 'var(--ff-body)', display: 'flex' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 149 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`rw-adm-sidebar ${sidebarOpen ? 'rw-adm-sidebar--open' : ''} ${sidebarCollapsed ? 'rw-adm-sidebar--collapsed' : ''}`}>

        {/* Logo */}
        <div className="rw-adm-sidebar__header">
          {!sidebarCollapsed && (
            <Link href="/" className="rw-tl-logo" onClick={() => setSidebarOpen(false)}>
              <div className="rw-tl-logo__mark" style={{ background: 'var(--ink)' }}>
                <HomeIcon style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
              <div>
                <span className="rw-tl-logo__text" style={{ fontSize: 18, display: 'block', lineHeight: 1.2 }}>
                  Rent<span>BW</span>
                </span>
                <span style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>
                  Admin Console
                </span>
              </div>
            </Link>
          )}
          {sidebarCollapsed && (
            <div style={{ width: 34, height: 34, background: 'var(--ink)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <HomeIcon style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rw-inv-collapse-btn rw-inv-desktop-only"
          >
            {sidebarCollapsed
              ? <ChevronDoubleRightIcon style={{ width: 14, height: 14 }} />
              : <ChevronDoubleLeftIcon style={{ width: 14, height: 14 }} />}
          </button>
          <button
            className="rw-inv-collapse-btn rw-inv-mobile-only"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Admin badge */}
        {!sidebarCollapsed && (
          <div style={{ margin: '16px 14px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 12 }}>
              <ShieldCheckIcon style={{ width: 15, height: 15, color: 'var(--accent)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                Admin Access
              </span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ padding: '8px 10px', flex: 1, overflowY: 'auto' }}>
          {!sidebarCollapsed && (
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '10px 10px 6px' }}>
              Management
            </p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`rw-adm-nav-item ${isActive(item.path) ? 'rw-adm-nav-item--active' : ''} ${sidebarCollapsed ? 'rw-adm-nav-item--collapsed' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                {!sidebarCollapsed && (
                  <>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                    {item.badge ? (
                      <span className="rw-tl-badge">{item.badge > 9 ? '9+' : item.badge}</span>
                    ) : null}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        {user && !sidebarCollapsed && (
          <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="rw-tl-avatar" style={{ flexShrink: 0 }}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>{user.name?.charAt(0).toUpperCase()}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' }}>{user.name}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Administrator</p>
              </div>
              <button
                onClick={async () => logout()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: 'var(--text-muted)', borderRadius: 8 }}
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
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
          <div style={{ padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              className="rw-adm-hamburger"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon style={{ width: 22, height: 22 }} />
            </button>

            <p style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }} className="rw-ll-page-title">
              {menuItems.find((m) => isActive(m.path))?.label || 'Admin Dashboard'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
              {/* Status badge */}
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 14px',
                background: 'rgba(14,14,14,0.06)',
                borderRadius: 100,
                fontSize: 11, fontWeight: 700,
                color: 'var(--ink-soft)',
                letterSpacing: '0.06em',
              }} className="rw-ll-username">
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                System OK
              </span>

              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', color: 'var(--ink-soft)', position: 'relative' }}>
                <BellIcon style={{ width: 20, height: 20 }} />
                {moderationCount > 0 && (
                  <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
                )}
              </button>

              {user && (
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="rw-tl-user">
                    <div className="rw-tl-avatar">
                      {user.avatar
                        ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span>{user.name?.charAt(0).toUpperCase()}</span>}
                    </div>
                    <ChevronDownIcon style={{ width: 14, height: 14, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setUserMenuOpen(false)} />
                      <div className="rw-tl-dropdown">
                        <Link href="/admin/profile" className="rw-tl-dropdown__item" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                        <Link href="/admin/settings" className="rw-tl-dropdown__item" onClick={() => setUserMenuOpen(false)}>Settings</Link>
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

        /* ── Admin Sidebar ── */
        .rw-adm-sidebar {
          width: 240px;
          background: #fff;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          transition: width 0.25s var(--ease-out);
        }
        .rw-adm-sidebar--collapsed { width: 68px; }

        @media (max-width: 1024px) {
          .rw-adm-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 150;
            transform: translateX(-100%);
            transition: transform 0.28s var(--ease-out);
            height: 100%;
            width: 240px !important;
          }
          .rw-adm-sidebar--open { transform: translateX(0); }
        }

        .rw-adm-sidebar__header {
          padding: 18px 16px 14px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-height: 64px;
        }

        /* Active nav items for admin use accent fill */
        .rw-adm-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          border-radius: 12px;
          text-decoration: none;
          color: var(--ink-soft);
          transition: all 0.18s;
          margin-bottom: 2px;
          overflow: hidden;
        }
        .rw-adm-nav-item:hover { background: rgba(200,169,110,0.07); color: var(--accent); }
        .rw-adm-nav-item--active {
          background: var(--ink);
          color: #fff;
        }
        .rw-adm-nav-item--active:hover { background: var(--ink-soft); color: #fff; }
        .rw-adm-nav-item--collapsed { justify-content: center; padding: 11px 0; }

        /* Shared tokens */
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
          padding: 6px 10px 6px 6px;
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

        .rw-inv-collapse-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: var(--text-muted);
          border-radius: 8px;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .rw-inv-collapse-btn:hover { background: var(--surface); color: var(--ink); }
        .rw-inv-desktop-only { }
        .rw-inv-mobile-only { display: none; }
        @media (max-width: 1024px) {
          .rw-inv-desktop-only { display: none; }
          .rw-inv-mobile-only { display: flex; }
        }

        .rw-adm-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--ink);
        }
        @media (max-width: 1024px) { .rw-adm-hamburger { display: flex; } }

        .rw-ll-page-title { }
        @media (max-width: 640px) { .rw-ll-page-title { display: none; } }
        .rw-ll-username { }
        @media (max-width: 768px) { .rw-ll-username { display: none; } }

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