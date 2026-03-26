// app/auth/AuthLayout.js
import Link from 'next/link';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,114,198,0.05),transparent_50%)]"></div>
      
      <div className="relative w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">
          
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary"></div>
              <span className="text-2xl font-bold text-neutral-900">
                Rent<span className="text-primary">BW</span>
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{title}</h1>
            <p className="text-neutral-600">{subtitle}</p>
          </div>

          {children}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-neutral-500 text-sm">
              © 2024 RentBW. Proudly serving Botswana 🇧🇼
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}