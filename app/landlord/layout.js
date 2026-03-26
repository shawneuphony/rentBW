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
  PlusIcon
} from '@heroicons/react/24/outline';

export default function LandlordLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState({
    name: 'James Wilson',
    role: 'landlord',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2YI2k-951gBakMW_u1xqx_fkNThW581_l3eUg2dXAvYKN7rstwcP0b39arQArBsom_xeYqEcuv1bdBmTpvW52oRhbcLL0ytu3GvisJnXQWHZ6bHTsi3mEuHMLJOKpX5Ksojzfv2Kp26GfHlkeiKiyvsdPl4linR2Wn7QuRr7xUVnPDz3clisNP0qeIPOME-SzCkwZBs2kkTGdvHeM3iTL_wng1IhbtvpX6nTk7EhtM4EQeMEz2c2C5D02zyGlA3Lq4Ka0xzr0yu4'
  });

  const menuItems = [
    { path: '/landlord/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/landlord/listings', label: 'My Listings', icon: BuildingOfficeIcon, badge: '3' },
    { path: '/landlord/messages', label: 'Messages', icon: ChatBubbleLeftIcon, badge: '5' },
    { path: '/landlord/analytics', label: 'Analytics', icon: ChartBarIcon },
    { path: '/landlord/profile', label: 'Profile', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => pathname === path;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-primary/10 transition-all duration-300 z-50 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className={`flex items-center gap-2 text-primary ${!isSidebarOpen && 'justify-center'}`}>
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <HomeIcon className="w-5 h-5" />
            </div>
            {isSidebarOpen && <span className="text-xl font-bold">RentBW</span>}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-100 rounded-lg"
          >
            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-primary/5 hover:text-primary'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <Icon className="w-5 h-5" />
                {isSidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        {isSidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary/10">
            <div className="flex items-center gap-3 p-2">
              <div className="size-10 rounded-full bg-primary/10 overflow-hidden">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-primary/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">
                {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h2>
              {pathname === '/landlord/listings' && (
                <Link
                  href="/landlord/listings/new"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Listing
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 border-none w-64"
                />
              </div>
              
              <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}