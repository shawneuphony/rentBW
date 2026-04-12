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
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect for transparent navbar
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

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
    setShowMenu(false);
    setShowMobileMenu(false);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) return null;

  // Check if we're on the homepage (hero section)
  const isHomePage = pathname === '/';
  const headerClass = `rw-header ${isHomePage && !scrolled ? 'rw-header--transparent' : 'rw-header--scrolled'}`;

  // Navigation links based on role
  const getNavLinks = () => {
    const links = [
      { href: '/property/search', label: 'Find Rentals' },
    ];
    
    if (user?.role === 'landlord') {
      links.push(
        { href: '/landlord/dashboard', label: 'Dashboard' },
        { href: '/landlord/listings', label: 'My Listings' }
      );
    }
    
    if (user?.role === 'tenant') {
      links.push(
        { href: '/tenant/saved', label: 'Saved' },
        { href: '/tenant/applications', label: 'Applications' }
      );
    }
    
    if (user?.role === 'investor') {
      links.push(
        { href: '/investor/dashboard', label: 'Dashboard' },
        { href: '/investor/yield-analysis', label: 'Yield Analysis' },
        { href: '/investor/geospatial', label: 'Geospatial' }
      );
    }
    
    if (user?.role === 'admin') {
      links.push(
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/moderation', label: 'Moderation' },
        { href: '/admin/users', label: 'Users' }
      );
    }
    
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className={headerClass}>
        <div className="rw-header__container">
          {/* Logo */}
          <Link href="/" className="rw-logo">
            <div className="rw-logo__mark">
              <HomeIcon className="rw-logo__icon" />
            </div>
            <span className="rw-logo__text">
              Rent<span>BW</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="rw-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rw-nav__link ${isActive(link.href) ? 'rw-nav__link--active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="rw-actions">
            {user ? (
              <>
                {/* Messages Icon */}
                <Link 
                  href="/messages" 
                  className="rw-actions__icon"
                  title="Messages"
                >
                  <EnvelopeIcon className="rw-actions__icon-svg" />
                  {unreadCount > 0 && (
                    <span className="rw-actions__badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Icon */}
                <button className="rw-actions__icon">
                  <BellIcon className="rw-actions__icon-svg" />
                  {notificationCount > 0 && (
                    <span className="rw-actions__dot" />
                  )}
                </button>
                
                {/* User Menu */}
                <div className="rw-user-menu">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="rw-user-menu__trigger"
                  >
                    <div className="rw-user-menu__avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{user.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="rw-user-menu__info">
                      <p className="rw-user-menu__name">{user.name?.split(' ')[0]}</p>
                      <p className="rw-user-menu__role">{user.role}</p>
                    </div>
                    <ChevronDownIcon className={`rw-user-menu__chevron ${showMenu ? 'rw-user-menu__chevron--open' : ''}`} />
                  </button>
                  
                  {showMenu && (
                    <>
                      <div className="rw-user-menu__backdrop" onClick={() => setShowMenu(false)} />
                      <div className="rw-user-menu__dropdown">
                        <Link 
                          href={`/${user.role}/dashboard`} 
                          className="rw-user-menu__item"
                          onClick={() => setShowMenu(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          href={`/${user.role}/profile`} 
                          className="rw-user-menu__item"
                          onClick={() => setShowMenu(false)}
                        >
                          Profile
                        </Link>
                        <Link 
                          href={`/${user.role}/settings`} 
                          className="rw-user-menu__item"
                          onClick={() => setShowMenu(false)}
                        >
                          Settings
                        </Link>
                        <hr className="rw-user-menu__divider" />
                        <button 
                          onClick={handleLogout}
                          className="rw-user-menu__item rw-user-menu__item--logout"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* List Property Button - Landlords */}
                {user?.role === 'landlord' && (
                  <Link
                    href="/landlord/listings/new"
                    className="rw-actions__btn"
                  >
                    <HomeIcon className="rw-actions__btn-icon" />
                    List Property
                  </Link>
                )}
              </>
            ) : (
              <div className="rw-auth">
                <Link href="/auth/login" className="rw-auth__link">
                  Sign In
                </Link>
                <Link href="/auth/register" className="rw-auth__btn">
                  Get Started
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(true)}
              className="rw-mobile-btn"
            >
              <Bars3Icon className="rw-mobile-btn__icon" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="rw-mobile-drawer">
          <div className="rw-mobile-drawer__overlay" onClick={() => setShowMobileMenu(false)} />
          <div className="rw-mobile-drawer__panel">
            <div className="rw-mobile-drawer__header">
              <Link href="/" className="rw-logo" onClick={() => setShowMobileMenu(false)}>
                <div className="rw-logo__mark">
                  <HomeIcon className="rw-logo__icon" />
                </div>
                <span className="rw-logo__text">
                  Rent<span>BW</span>
                </span>
              </Link>
              <button onClick={() => setShowMobileMenu(false)} className="rw-mobile-drawer__close">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="rw-mobile-drawer__body">
              {user && (
                <div className="rw-mobile-user">
                  <div className="rw-mobile-user__avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="rw-mobile-user__info">
                    <p className="rw-mobile-user__name">{user.name}</p>
                    <p className="rw-mobile-user__role">{user.role}</p>
                  </div>
                </div>
              )}
              
              <nav className="rw-mobile-nav">
                <Link href="/" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                  Home
                </Link>
                <Link href="/property/search" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                  Find Rentals
                </Link>
                
                {user?.role === 'landlord' && (
                  <>
                    <Link href="/landlord/dashboard" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Dashboard
                    </Link>
                    <Link href="/landlord/listings" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      My Listings
                    </Link>
                    <Link href="/landlord/listings/new" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      List Property
                    </Link>
                  </>
                )}
                
                {user?.role === 'tenant' && (
                  <>
                    <Link href="/tenant/dashboard" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Dashboard
                    </Link>
                    <Link href="/tenant/saved" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Saved
                    </Link>
                    <Link href="/tenant/applications" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Applications
                    </Link>
                  </>
                )}
                
                {user?.role === 'investor' && (
                  <>
                    <Link href="/investor/dashboard" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Dashboard
                    </Link>
                    <Link href="/investor/yield-analysis" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Yield Analysis
                    </Link>
                    <Link href="/investor/geospatial" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Geospatial
                    </Link>
                  </>
                )}
                
                {user?.role === 'admin' && (
                  <>
                    <Link href="/admin/dashboard" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Dashboard
                    </Link>
                    <Link href="/admin/moderation" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Moderation
                    </Link>
                    <Link href="/admin/users" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Users
                    </Link>
                  </>
                )}
                
                {user && (
                  <>
                    <hr className="rw-mobile-nav__divider" />
                    <Link href={`/${user.role}/profile`} className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Profile
                    </Link>
                    <Link href={`/${user.role}/settings`} className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Settings
                    </Link>
                    <button onClick={handleLogout} className="rw-mobile-nav__link rw-mobile-nav__link--logout">
                      Logout
                    </button>
                  </>
                )}
                
                {!user && (
                  <>
                    <hr className="rw-mobile-nav__divider" />
                    <Link href="/auth/login" className="rw-mobile-nav__link" onClick={() => setShowMobileMenu(false)}>
                      Sign In
                    </Link>
                    <Link href="/auth/register" className="rw-mobile-nav__link rw-mobile-nav__link--primary" onClick={() => setShowMobileMenu(false)}>
                      Get Started
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Global styles - moved to separate style tag without jsx */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .rw-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            backdrop-filter: blur(0px);
          }
          
          .rw-header--transparent {
            background: transparent;
            box-shadow: none;
          }
          
          .rw-header--transparent .rw-logo__text,
          .rw-header--transparent .rw-nav__link,
          .rw-header--transparent .rw-actions__icon-svg,
          .rw-header--transparent .rw-user-menu__name,
          .rw-header--transparent .rw-user-menu__role,
          .rw-header--transparent .rw-auth__link {
            color: #ffffff;
          }
          
          .rw-header--transparent .rw-logo__mark {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
          }
          
          .rw-header--transparent .rw-user-menu__avatar {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
            color: #ffffff;
          }
          
          .rw-header--transparent .rw-auth__btn {
            background: #ffffff;
            color: #0e0e0e;
          }
          
          .rw-header--transparent .rw-auth__btn:hover {
            background: #c8a96e;
            color: #ffffff;
          }
          
          .rw-header--scrolled {
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            backdrop-filter: blur(0px);
          }
          
          .rw-header--scrolled .rw-logo__mark {
            background: #0e0e0e;
          }
          
          .rw-header--scrolled .rw-logo__text {
            color: #0e0e0e;
          }
          
          .rw-header__container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 16px 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 40px;
          }
          
          @media (max-width: 768px) {
            .rw-header__container {
              padding: 14px 20px;
            }
          }
          
          .rw-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            flex-shrink: 0;
          }
          
          .rw-logo__mark {
            width: 36px;
            height: 36px;
            background: #0e0e0e;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
          }
          
          .rw-logo__icon {
            width: 20px;
            height: 20px;
            color: #ffffff;
          }
          
          .rw-logo__text {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.02em;
            transition: color 0.3s;
          }
          
          .rw-logo__text span {
            color: #c8a96e;
          }
          
          .rw-nav {
            display: flex;
            align-items: center;
            gap: 32px;
            flex: 1;
          }
          
          @media (max-width: 1024px) {
            .rw-nav {
              display: none;
            }
          }
          
          .rw-nav__link {
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            color: #2a2a2a;
            transition: color 0.2s;
            position: relative;
          }
          
          .rw-nav__link:hover {
            color: #c8a96e;
          }
          
          .rw-nav__link--active {
            color: #c8a96e;
          }
          
          .rw-nav__link--active::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            right: 0;
            height: 2px;
            background: #c8a96e;
          }
          
          .rw-actions {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-shrink: 0;
          }
          
          .rw-actions__icon {
            position: relative;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .rw-header--scrolled .rw-actions__icon:hover {
            background: #f5f3ef;
          }
          
          .rw-header--transparent .rw-actions__icon:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          
          .rw-actions__icon-svg {
            width: 20px;
            height: 20px;
            transition: color 0.3s;
          }
          
          .rw-actions__badge {
            position: absolute;
            top: -2px;
            right: -2px;
            background: #c8a96e;
            color: #ffffff;
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
          
          .rw-actions__dot {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 8px;
            height: 8px;
            background: #ef4444;
            border-radius: 50%;
          }
          
          .rw-actions__btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: #c8a96e;
            color: #ffffff;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
          }
          
          .rw-actions__btn:hover {
            background: #a8893e;
            transform: translateY(-1px);
          }
          
          .rw-actions__btn-icon {
            width: 16px;
            height: 16px;
          }
          
          @media (max-width: 1024px) {
            .rw-actions__btn {
              display: none;
            }
          }
          
          .rw-user-menu {
            position: relative;
          }
          
          .rw-user-menu__trigger {
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
          
          .rw-header--scrolled .rw-user-menu__trigger:hover {
            background: #f5f3ef;
          }
          
          .rw-header--transparent .rw-user-menu__trigger:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          
          .rw-user-menu__avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #c8a96e;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 16px;
            color: #ffffff;
            overflow: hidden;
            border: 1.5px solid #c8a96e;
          }
          
          .rw-user-menu__avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .rw-user-menu__info {
            text-align: left;
          }
          
          .rw-user-menu__name {
            font-size: 13px;
            font-weight: 600;
            transition: color 0.3s;
          }
          
          .rw-user-menu__role {
            font-size: 10px;
            opacity: 0.6;
            text-transform: capitalize;
            transition: color 0.3s;
          }
          
          .rw-user-menu__chevron {
            width: 14px;
            height: 14px;
            transition: transform 0.2s;
          }
          
          .rw-user-menu__chevron--open {
            transform: rotate(180deg);
          }
          
          @media (max-width: 768px) {
            .rw-user-menu__info {
              display: none;
            }
          }
          
          .rw-user-menu__backdrop {
            position: fixed;
            inset: 0;
            z-index: 999;
          }
          
          .rw-user-menu__dropdown {
            position: absolute;
            top: calc(100% + 12px);
            right: 0;
            width: 220px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            z-index: 1000;
            animation: fadeInDown 0.2s ease;
          }
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .rw-user-menu__item {
            display: block;
            padding: 12px 20px;
            font-size: 14px;
            text-decoration: none;
            color: #0e0e0e;
            transition: background 0.2s;
            width: 100%;
            text-align: left;
            background: none;
            border: none;
            cursor: pointer;
          }
          
          .rw-user-menu__item:hover {
            background: #f5f3ef;
          }
          
          .rw-user-menu__item--logout {
            color: #ef4444;
          }
          
          .rw-user-menu__divider {
            margin: 8px 0;
            border: none;
            border-top: 1px solid #eee;
          }
          
          .rw-auth {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .rw-auth__link {
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: color 0.2s;
          }
          
          .rw-auth__link:hover {
            color: #c8a96e;
          }
          
          .rw-auth__btn {
            padding: 10px 22px;
            background: #0e0e0e;
            color: #ffffff;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
          }
          
          .rw-auth__btn:hover {
            background: #c8a96e;
            transform: translateY(-1px);
          }
          
          .rw-mobile-btn {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: background 0.2s;
          }
          
          @media (max-width: 1024px) {
            .rw-mobile-btn {
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
          
          .rw-mobile-btn__icon {
            width: 24px;
            height: 24px;
          }
          
          .rw-mobile-drawer {
            position: fixed;
            inset: 0;
            z-index: 1100;
          }
          
          .rw-mobile-drawer__overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.2s ease;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .rw-mobile-drawer__panel {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 85%;
            max-width: 320px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          
          .rw-mobile-drawer__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
          }
          
          .rw-mobile-drawer__close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
          }
          
          .rw-mobile-drawer__body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          }
          
          .rw-mobile-user {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: #f5f3ef;
            border-radius: 16px;
            margin-bottom: 24px;
          }
          
          .rw-mobile-user__avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #c8a96e;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 600;
            color: #ffffff;
            overflow: hidden;
          }
          
          .rw-mobile-user__avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .rw-mobile-user__name {
            font-weight: 700;
            margin-bottom: 2px;
          }
          
          .rw-mobile-user__role {
            font-size: 12px;
            color: #6b6b6b;
            text-transform: capitalize;
          }
          
          .rw-mobile-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .rw-mobile-nav__link {
            padding: 14px 16px;
            font-size: 15px;
            font-weight: 500;
            text-decoration: none;
            color: #0e0e0e;
            border-radius: 12px;
            transition: background 0.2s;
          }
          
          .rw-mobile-nav__link:hover {
            background: #f5f3ef;
          }
          
          .rw-mobile-nav__link--logout {
            color: #ef4444;
          }
          
          .rw-mobile-nav__link--primary {
            background: #0e0e0e;
            color: #ffffff;
            text-align: center;
          }
          
          .rw-mobile-nav__link--primary:hover {
            background: #c8a96e;
          }
          
          .rw-mobile-nav__divider {
            margin: 16px 0;
            border: none;
            border-top: 1px solid #eee;
          }
        `
      }} />
    </>
  );
}