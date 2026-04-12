// app/components/ui/Footer.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronRightIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  // Prevent hydration mismatch
  if (!mounted) return null;

  const footerLinks = {
    company: [
      { href: '/about', label: 'About Us' },
      { href: '/careers', label: 'Careers' },
      { href: '/blog', label: 'Blog' },
      { href: '/press', label: 'Press' },
    ],
    legal: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/accessibility', label: 'Accessibility' },
    ],
    support: [
      { href: '/help', label: 'Help Center' },
      { href: '/safety', label: 'Safety Tips' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/faq', label: 'FAQ' },
    ],
    forUsers: [
      { href: '/tenant/dashboard', label: 'For Tenants' },
      { href: '/landlord/dashboard', label: 'For Landlords' },
      { href: '/investor/dashboard', label: 'For Investors' },
      { href: '/property/search', label: 'Browse Properties' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      icon: (props) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      href: '#',
      icon: (props) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (props) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (props) => (
        <svg {...props} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <footer className="rw-footer">
        {/* Main Footer Content */}
        <div className="rw-footer__container">
          
          {/* Brand Column */}
          <div className="rw-footer__brand">
            <Link href="/" className="rw-footer__logo">
              <div className="rw-footer__logo-mark">
                <HomeIcon className="rw-footer__logo-icon" />
              </div>
              <span className="rw-footer__logo-text">
                Rent<span>BW</span>
              </span>
            </Link>
            <p className="rw-footer__description">
              Botswana's most trusted property marketplace. Connecting verified landlords with quality tenants across Gaborone and beyond.
            </p>
            
            {/* Social Links */}
            <div className="rw-footer__social">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="rw-footer__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <social.icon className="rw-footer__social-icon" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="rw-footer__links">
            <div className="rw-footer__links-column">
              <h4 className="rw-footer__links-title">Company</h4>
              <ul className="rw-footer__links-list">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="rw-footer__link">
                      {link.label}
                      <ChevronRightIcon className="rw-footer__link-icon" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rw-footer__links-column">
              <h4 className="rw-footer__links-title">Legal</h4>
              <ul className="rw-footer__links-list">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="rw-footer__link">
                      {link.label}
                      <ChevronRightIcon className="rw-footer__link-icon" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rw-footer__links-column">
              <h4 className="rw-footer__links-title">Support</h4>
              <ul className="rw-footer__links-list">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="rw-footer__link">
                      {link.label}
                      <ChevronRightIcon className="rw-footer__link-icon" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rw-footer__links-column">
              <h4 className="rw-footer__links-title">For You</h4>
              <ul className="rw-footer__links-list">
                {footerLinks.forUsers.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="rw-footer__link">
                      {link.label}
                      <ChevronRightIcon className="rw-footer__link-icon" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Bar */}
        <div className="rw-footer__contact">
          <div className="rw-footer__contact-inner">
            <div className="rw-footer__contact-item">
              <PhoneIcon className="rw-footer__contact-icon" />
              <div>
                <p className="rw-footer__contact-label">Call us</p>
                <a href="tel:+2671234567" className="rw-footer__contact-value">+267 123 4567</a>
              </div>
            </div>
            <div className="rw-footer__contact-item">
              <EnvelopeIcon className="rw-footer__contact-icon" />
              <div>
                <p className="rw-footer__contact-label">Email us</p>
                <a href="mailto:support@rentbw.com" className="rw-footer__contact-value">support@rentbw.com</a>
              </div>
            </div>
            <div className="rw-footer__contact-item">
              <MapPinIcon className="rw-footer__contact-icon" />
              <div>
                <p className="rw-footer__contact-label">Visit us</p>
                <span className="rw-footer__contact-value">Gaborone, Botswana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="rw-footer__bottom">
          <div className="rw-footer__bottom-inner">
            <p className="rw-footer__copyright">
              © {currentYear} RentBW. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`rw-scroll-top ${showScrollTop ? 'rw-scroll-top--visible' : ''}`}
        aria-label="Scroll to top"
      >
        <ArrowUpIcon className="rw-scroll-top__icon" />
      </button>

      {/* Styles - using dangerouslySetInnerHTML to avoid hydration mismatch */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .rw-footer {
            background: #0e0e0e;
            color: #ffffff;
            margin-top: 0;
            border: none;
          }

          .rw-footer__container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 64px 40px 48px;
            display: grid;
            grid-template-columns: 1.2fr 2fr;
            gap: 48px;
          }

          @media (max-width: 1024px) {
            .rw-footer__container {
              grid-template-columns: 1fr;
              padding: 48px 32px 40px;
              gap: 40px;
            }
          }

          @media (max-width: 640px) {
            .rw-footer__container {
              padding: 40px 20px 32px;
            }
          }

          .rw-footer__brand {
            max-width: 360px;
          }

          .rw-footer__logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            margin-bottom: 20px;
          }

          .rw-footer__logo-mark {
            width: 40px;
            height: 40px;
            background: #c8a96e;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .rw-footer__logo-icon {
            width: 22px;
            height: 22px;
            color: #ffffff;
          }

          .rw-footer__logo-text {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #ffffff;
          }

          .rw-footer__logo-text span {
            color: #c8a96e;
          }

          .rw-footer__description {
            font-size: 14px;
            line-height: 1.65;
            color: rgba(255, 255, 255, 0.55);
            margin-bottom: 24px;
          }

          .rw-footer__social {
            display: flex;
            gap: 12px;
          }

          .rw-footer__social-link {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.25s ease;
            color: rgba(255, 255, 255, 0.5);
          }

          .rw-footer__social-link:hover {
            background: #c8a96e;
            color: #ffffff;
            transform: translateY(-3px);
          }

          .rw-footer__social-icon {
            width: 18px;
            height: 18px;
          }

          .rw-footer__links {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 32px;
          }

          @media (max-width: 768px) {
            .rw-footer__links {
              grid-template-columns: repeat(2, 1fr);
              gap: 28px;
            }
          }

          .rw-footer__links-title {
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #c8a96e;
            margin-bottom: 20px;
          }

          .rw-footer__links-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .rw-footer__links-list li {
            margin-bottom: 12px;
          }

          .rw-footer__link {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.55);
            text-decoration: none;
            transition: all 0.2s ease;
          }

          .rw-footer__link:hover {
            color: #c8a96e;
            gap: 8px;
          }

          .rw-footer__link-icon {
            width: 12px;
            height: 12px;
            opacity: 0;
            transition: opacity 0.2s, transform 0.2s;
          }

          .rw-footer__link:hover .rw-footer__link-icon {
            opacity: 1;
            transform: translateX(2px);
          }

          .rw-footer__contact {
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .rw-footer__contact-inner {
            max-width: 1280px;
            margin: 0 auto;
            padding: 28px 40px;
            display: flex;
            justify-content: space-between;
            gap: 32px;
            flex-wrap: wrap;
          }

          @media (max-width: 768px) {
            .rw-footer__contact-inner {
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: 24px 20px;
            }
          }

          .rw-footer__contact-item {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          @media (max-width: 768px) {
            .rw-footer__contact-item {
              flex-direction: column;
              gap: 8px;
            }
          }

          .rw-footer__contact-icon {
            width: 24px;
            height: 24px;
            color: #c8a96e;
          }

          .rw-footer__contact-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: rgba(255, 255, 255, 0.4);
            margin-bottom: 2px;
          }

          .rw-footer__contact-value {
            font-size: 14px;
            color: #ffffff;
            text-decoration: none;
            transition: color 0.2s;
          }

          .rw-footer__contact-value:hover {
            color: #c8a96e;
          }

          .rw-footer__bottom {
            background: rgba(0, 0, 0, 0.2);
          }

          .rw-footer__bottom-inner {
            max-width: 1280px;
            margin: 0 auto;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
          }

          @media (max-width: 640px) {
            .rw-footer__bottom-inner {
              flex-direction: column;
              text-align: center;
              padding: 16px 20px;
            }
          }

          .rw-footer__copyright {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.35);
          }

          .rw-footer__credit {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.25);
            letter-spacing: 0.05em;
          }

          .rw-scroll-top {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #c8a96e;
            color: #ffffff;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 100;
          }

          .rw-scroll-top--visible {
            opacity: 1;
            transform: translateY(0);
          }

          .rw-scroll-top:hover {
            background: #a8893e;
            transform: translateY(-3px);
          }

          .rw-scroll-top__icon {
            width: 22px;
            height: 22px;
          }

          @media (max-width: 640px) {
            .rw-scroll-top {
              bottom: 16px;
              right: 16px;
              width: 42px;
              height: 42px;
            }
            .rw-scroll-top__icon {
              width: 18px;
              height: 18px;
            }
          }
        `
      }} />
    </>
  );
}