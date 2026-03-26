// app/ClientLayout.js
'use client';

import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const showHeader = !isDashboard;
  const showFooter = !isDashboard;

  return (
    <>
      {/* Navigation Bar - Only show if NOT dashboard */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-primary-hover"></div>
                <span className="text-xl font-bold text-text-primary tracking-tight">
                  Rent<span className="text-primary">BW</span>
                </span>
              </a>
              
              <nav className="hidden md:flex items-center gap-8">
                <a href="/listings" className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium text-[15px]">
                  Browse Listings
                </a>
                <a href="/how-it-works" className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium text-[15px]">
                  How It Works
                </a>
                <a href="/pricing" className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium text-[15px]">
                  Pricing
                </a>
                <a href="/blog" className="text-text-secondary hover:text-primary transition-colors duration-200 font-medium text-[15px]">
                  Blog
                </a>
              </nav>
              
              <div className="flex items-center gap-4">
                <a 
                  href="/auth/login" 
                  className="px-4 py-2 text-text-secondary hover:text-primary transition-colors duration-200 font-medium text-[15px]"
                >
                  Sign In
                </a>
                <a 
                  href="/auth/register" 
                  className="px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors duration-200 shadow-sm text-[15px] h-12 min-h-[48px] flex items-center"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-background">
        {children}
      </main>

      {/* Footer - Only show if NOT dashboard */}
      {showFooter && (
        <footer className="bg-text-primary text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary-hover"></div>
                  <span className="text-2xl font-bold text-white tracking-tight">
                    Rent<span className="text-primary-light">BW</span>
                  </span>
                </div>
                <p className="text-gray-300 mb-6 text-[15px]">
                  Botswana's trusted rental platform connecting verified landlords with reliable tenants.
                </p>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-all duration-200">
                    <span className="sr-only">Facebook</span>
                    f
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-all duration-200">
                    <span className="sr-only">Twitter</span>
                    𝕏
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-all duration-200">
                    <span className="sr-only">Instagram</span>
                    📷
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4 text-[16px]">For Tenants</h3>
                <ul className="space-y-3">
                  <li><a href="/listings" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">Browse Listings</a></li>
                  <li><a href="/how-it-works" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">How It Works</a></li>
                  <li><a href="/safety" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">Safety Tips</a></li>
                  <li><a href="/faq" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4 text-[16px]">For Landlords</h3>
                <ul className="space-y-3">
                  <li><a href="/list-property" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">List Your Property</a></li>
                  <li><a href="/verification" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">Verification Process</a></li>
                  <li><a href="/landlord-guide" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">Landlord Guide</a></li>
                  <li><a href="/pricing" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">Pricing</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4 text-[16px]">Company</h3>
                <ul className="space-y-3">
                  <li><a href="/about" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">About Us</a></li>
                  <li><a href="/contact" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">Contact</a></li>
                  <li><a href="/privacy" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-gray-300 hover:text-primary-light transition-colors text-[14px]">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} RentBW. All rights reserved. Proudly serving Botswana 🇧🇼</p>
              <p className="mt-2 text-[13px]">Starting in Gaborone • Expanding nationwide</p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}