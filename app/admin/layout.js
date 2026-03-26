// app/admin/layout.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChartBarIcon,
  FlagIcon,
  UsersIcon,
  CubeIcon, // Replace DatabaseIcon with CubeIcon
  Cog6ToothIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user] = useState({
    name: 'Admin User',
    role: 'Moderator Level 2',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgh07_7nLJtnnU3BKeIcrN-vSlCW9iXeYhNikFUjlsS92bok1F-A_289o77anixQcVYtWjX6wFTs16dz7UXyqBy-m-kDxpZFFal4v4DEPK606qX4WWZPcqRg06QIj7Ewxye7aAUpap_xk0sLdyA125iAQAr3J7NOrEwTH62y3fICcLI-2pif9R6pjQlzyyCRWEKzWHLDB3Ydsi8NYauR23GQ_TLaZTCr56rZ0R7GdRdt0WCZgcWxO7XbXtlHYJ_yCWWO2AI3SrcZs'
  });

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/admin/moderation', label: 'Moderation', icon: FlagIcon, badge: '12' },
    { path: '/admin/users', label: 'User Management', icon: UsersIcon },
    { path: '/admin/data-management', label: 'Data Management', icon: CubeIcon }, // Changed from DatabaseIcon to CubeIcon
    { path: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const isActive = (path) => pathname === path;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-primary text-white transition-all duration-300 z-50 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className={`flex items-center gap-2 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="size-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
              <HomeIcon className="w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <div>
                <span className="text-xl font-bold block leading-tight">RentBW</span>
                <span className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Admin Console</span>
              </div>
            )}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white"
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
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
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
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-2">
              <div className="size-10 rounded-full bg-white/20 overflow-hidden">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-white/70 truncate">{user.role}</p>
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
            <h2 className="text-xl font-bold">
              {menuItems.find(item => isActive(item.path))?.label || 'Admin Dashboard'}
            </h2>

            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users, listings..."
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