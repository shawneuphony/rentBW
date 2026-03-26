// components/DashboardLayout.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faSearch,
  faHeart,
  faMessage,
  faBell,
  faUser,
  faCog,
  faSignOutAlt,
  faShieldCheck
} from '@fortawesome/free-solid-svg-icons';

export default function DashboardLayout({ children, userType = 'tenant' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tenantNavItems = [
    { href: '/dashboard/tenant', icon: faHome, label: 'Dashboard' },
    { href: '/dashboard/tenant/search', icon: faSearch, label: 'Search Listings' },
    { href: '/dashboard/tenant/favorites', icon: faHeart, label: 'Favorites' },
    { href: '/dashboard/tenant/messages', icon: faMessage, label: 'Messages' },
    { href: '/dashboard/tenant/notifications', icon: faBell, label: 'Notifications' },
    { href: '/dashboard/tenant/profile', icon: faUser, label: 'Profile' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && isMobile && !e.target.closest('aside') && !e.target.closest('button[class*="lg:hidden"]')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen, isMobile]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-card rounded-xl border border-border shadow-sm"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary-hover"></div>
              <span className="text-xl font-bold text-text-primary">
                Rent<span className="text-primary">BW</span>
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-[15px]">John Doe</h3>
                <div className="flex items-center gap-1 mt-1">
                  <FontAwesomeIcon icon={faShieldCheck} className="w-3 h-3 text-trust" />
                  <p className="text-text-secondary text-[13px]">Verified Tenant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {tenantNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-primary-light text-primary border border-primary/20'
                        : 'text-text-secondary hover:bg-border-light'
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                    <span className="text-[14px]">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border space-y-1">
            <Link
              href="/dashboard/settings"
              onClick={() => isMobile && setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-border-light transition-all duration-200"
            >
              <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
              <span className="text-[14px]">Settings</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200">
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
              <span className="text-[14px]">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-0">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-text-primary">Tenant Dashboard</h1>
                <p className="text-text-secondary text-[15px] mt-1">Find your perfect home in Botswana</p>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="p-3 rounded-xl bg-border-light border border-border hover:bg-border transition-all duration-200">
                  <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-text-primary" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-hover"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}