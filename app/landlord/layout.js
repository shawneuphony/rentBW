// app/landlord/layout.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function LandlordLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { path: '/landlord/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/landlord/listings', label: 'My Listings', icon: BuildingOfficeIcon, badge: '3' },
    { path: '/landlord/messages', label: 'Messages', icon: ChatBubbleLeftIcon, badge: '5' },
    { path: '/landlord/analytics', label: 'Analytics', icon: ChartBarIcon },
    { path: '/landlord/profile', label: 'Profile', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => pathname === path;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-border-light z-50 transform transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-border-light">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display">Rent<span className="text-accent">BW</span></span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-accent/10 text-accent'
                    : 'text-ink-soft hover:bg-surface hover:text-accent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
              JW
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">James Wilson</p>
              <p className="text-xs text-text-muted truncate">Landlord</p>
            </div>
            <button className="p-1.5 hover:bg-surface rounded-full transition">
              <ChevronDownIcon className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className={`sticky top-0 z-30 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-ink-soft hover:bg-surface rounded-full"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-surface rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent w-64"
                />
              </div>
              <button className="relative p-2 text-ink-soft hover:bg-surface rounded-full">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                JW
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .bg-surface { background: var(--surface); }
        .bg-accent { background: var(--accent); }
        .text-accent { color: var(--accent); }
        .text-ink { color: var(--ink); }
        .text-ink-soft { color: var(--ink-soft); }
        .text-text-muted { color: var(--text-muted); }
        .border-border-light { border-color: var(--border-light); }
        .font-display { font-family: var(--ff-display); }
      `}</style>
    </div>
  );
}