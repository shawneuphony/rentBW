// app/components/ui/FilterBar.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function FilterBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/property/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location, property type, or keyword..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-base"
          />
        </div>
        
        <button
          type="submit"
          className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium hover:border-primary transition-colors">
          Apartment
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium hover:border-primary transition-colors">
          House
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium hover:border-primary transition-colors">
          Studio
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium hover:border-primary transition-colors">
          Townhouse
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium hover:border-primary transition-colors">
          Commercial
        </button>
      </div>
    </div>
  );
}