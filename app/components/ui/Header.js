// app/components/ui/Header.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages/unread');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const isActive = (path) => {
    return pathname?.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10 px-4 md:px-10 py-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <HomeIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">RentBW</h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/property/search" 
              className={`text-sm font-semibold transition-colors ${
                isActive('/property') 
                  ? 'text-primary border-b-2 border-primary pb-1' 
                  : 'text-slate-600 hover:text-primary'
              }`}
            >
              Find Rentals
            </Link>
            
            {user?.role === 'landlord' && (
              <>
                <Link 
                  href="/landlord/dashboard" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/landlord/dashboard') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/landlord/listings" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/landlord/listings') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  My Listings
                </Link>
              </>
            )}
            
            {user?.role === 'tenant' && (
              <>
                <Link 
                  href="/tenant/saved" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/tenant/saved') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Saved
                </Link>
                <Link 
                  href="/tenant/applications" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/tenant/applications') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Applications
                </Link>
              </>
            )}
            
            {user?.role === 'investor' && (
              <>
                <Link 
                  href="/investor/dashboard" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/investor/dashboard') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/investor/yield-analysis" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/investor/yield-analysis') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Yield Analysis
                </Link>
                <Link 
                  href="/investor/geospatial" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/investor/geospatial') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Geospatial
                </Link>
              </>
            )}
            
            {user?.role === 'admin' && (
              <>
                <Link 
                  href="/admin/dashboard" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/admin/dashboard') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/moderation" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/admin/moderation') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Moderation
                </Link>
                <Link 
                  href="/admin/users" 
                  className={`text-sm font-semibold transition-colors ${
                    isActive('/admin/users') 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Users
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search (mobile) */}
          <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>

          {user ? (
            <>
              {/* Messages Icon with Unread Badge */}
              <Link 
                href="/messages" 
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Messages"
              >
                <EnvelopeIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Notifications Icon */}
              <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 hover:bg-slate-100 rounded-lg p-1 transition-colors"
                >
                  <div className="size-10 rounded-full bg-primary/10 border-2 border-primary/20 overflow-hidden flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 hidden sm:block text-slate-400" />
                </button>
                
                {showMenu && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMenu(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      {/* User Info (mobile) */}
                      <div className="sm:hidden px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                      </div>

                      {/* Menu Items */}
                      <Link 
                        href={`/${user.role}/dashboard`} 
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        Dashboard
                      </Link>
                      
                      <Link 
                        href={`/${user.role}/profile`} 
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        Profile
                      </Link>
                      
                      <Link 
                        href={`/${user.role}/settings`} 
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        Settings
                      </Link>

                      {/* Messages link in dropdown (for mobile) */}
                      <Link 
                        href="/messages" 
                        className="sm:hidden block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <div className="flex items-center justify-between">
                          <span>Messages</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </Link>
                      
                      <hr className="my-2 border-slate-100" />
                      
                      <button 
                        onClick={() => {
                          handleLogout();
                          setShowMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* List Property Button - Only for landlords (desktop) */}
              {user?.role === 'landlord' && (
                <Link
                  href="/landlord/listings/new"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors ml-2"
                >
                  <HomeIcon className="w-4 h-4" />
                  List Property
                </Link>
              )}
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/auth/register" 
                className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}