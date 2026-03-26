// app/components/ui/Footer.js
import Link from 'next/link';
import { 
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-primary/5 border-t border-primary/10 py-12 px-4 md:px-20 mt-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-primary mb-4">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <HomeIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold">RentBW</h1>
          </Link>
          <p className="text-sm text-gray-500 max-w-sm">
            The most trusted property marketplace in Botswana. Connecting verified landlords with quality tenants.
          </p>
          
          <div className="mt-6 flex gap-4">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h5 className="font-bold mb-4">Company</h5>
          <ul className="text-sm text-gray-500 space-y-2">
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h5 className="font-bold mb-4">Support</h5>
          <ul className="text-sm text-gray-500 space-y-2">
            <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
            <li><Link href="/safety" className="hover:text-primary transition-colors">Safety Tips</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
          </ul>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <PhoneIcon className="w-4 h-4" />
              <span>+267 123 4567</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <EnvelopeIcon className="w-4 h-4" />
              <span>support@rentbw.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[1440px] mx-auto border-t border-primary/10 mt-12 pt-8 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} RentBW. All rights reserved. Gaborone, Botswana.</p>
      </div>
    </footer>
  );
}