// app/tenant/layout.js
'use client';

import { useState } from 'react';
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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function TenantLayout({ children }) {
  const pathname = usePathname();
  const [user] = useState({
    name: 'Thabo Molefe',
    role: 'tenant',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8bexZuKdGTMNfyy-dTOlQEd-yRH8YHQWoArhNORAaGNQ1L1wtWjDdbEx_xybr9rv3XKooz79IHAhApA3GxmBYj5S9UipJHH65lxCsEgJtJ_84dOLL-pE0j4vPLU9MmpZTbfdd0S3on6k02E_xsW3Hmh7Rl0Nou6hZW7riGQm5EvaqJ_Aa3hOuU9RhywuaSmYLcyOALLywZqkh6_sLN1EX2B0b1AYSzigYE73aWU4ES8JlmJ6ux1BrGaIR4IxJJyrb5ClpmWmHjmQ'
  });

  const menuItems = [
    { path: '/tenant/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/tenant/saved', label: 'Saved', icon: HeartIcon, badge: '4' },
    { path: '/tenant/applications', label: 'Applications', icon: DocumentTextIcon, badge: '2' },
    { path: '/tenant/messages', label: 'Messages', icon: ChatBubbleLeftIcon, badge: '3' },
    { path: '/tenant/profile', label: 'Profile', icon: UserIcon },
    { path: '/tenant/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => pathname === path;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-primary/10 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <HomeIcon className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">RentBW</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search properties..."
                className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 border-none w-64"
              />
            </div>
            
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <Link href="/tenant/profile" className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 overflow-hidden">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.name}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
}