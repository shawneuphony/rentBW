// app/tenant/layout.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  HeartIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function TenantLayout({ children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { path: '/tenant/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/tenant/saved', label: 'Saved', icon: HeartIcon, badge: '4' },
    { path: '/tenant/applications', label: 'Applications', icon: DocumentTextIcon, badge: '2' },
    { path: '/tenant/messages', label: 'Messages', icon: ChatBubbleLeftIcon, badge: '3' },
    { path: '/tenant/profile', label: 'Profile', icon: UserIcon },
    { path: '/tenant/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => pathname === path;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Navigation */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-ink font-display">
                Rent<span className="text-accent">BW</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-accent/10 text-accent'
                        : 'text-ink-soft hover:bg-accent/5 hover:text-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 bg-accent text-white text-[10px] font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="pl-10 pr-4 py-2 bg-surface rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent w-64"
                />
              </div>
              <button className="relative p-2 text-ink-soft hover:bg-surface rounded-full transition-colors">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-ink-soft hover:bg-surface rounded-full"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-slide-in">
            <div className="flex justify-between items-center p-5 border-b border-border-light">
              <span className="text-xl font-bold font-display">Rent<span className="text-accent">BW</span></span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-surface rounded-full">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(item.path)
                        ? 'bg-accent/10 text-accent'
                        : 'text-ink-soft hover:bg-surface'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 bg-accent text-white text-xs font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <style jsx global>{`
        .bg-surface { background: var(--surface); }
        .bg-accent { background: var(--accent); }
        .text-accent { color: var(--accent); }
        .text-ink { color: var(--ink); }
        .text-ink-soft { color: var(--ink-soft); }
        .text-text-muted { color: var(--text-muted); }
        .border-border-light { border-color: var(--border-light); }
        .font-display { font-family: var(--ff-display); }
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s var(--ease-out);
        }
      `}</style>
    </div>
  );
}