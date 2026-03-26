// app/property/search/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/ui/Header';
import Footer from '@/app/components/ui/Footer';
import PropertyCard from '@/app/components/ui/PropertyCard';
import FilterSidebar from '@/app/components/ui/FilterSidebar';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// Mock data
const searchResults = [
  {
    id: 1,
    title: 'Modern 3-Bedroom House',
    price: 7500,
    location: 'Phakalane, Phase 2',
    beds: 3,
    baths: 2,
    sqm: 120,
    rating: 4.8,
    verified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAR0SlDarKxX-UDiJZzo8kX0S-QS75Y2m03emaBFlvhpIxD4svPVolLaqqwOfXT_odkrsAV6jhHwbtpaNr9eEsGfhYX0Cu-Wx8lWcvvPnQ-7L0RdHvV_oxp1_0mus0X_ofKtg7uPzlOuh4upe7S5HWFgCtacnP6Kh0I6aiD0dXq32v8J2uVXGGPZ0NpKif1FhU7fLffMcZLlWodUI22TZLtR0VZrqL1rsB2VTNptsS8M7USrgad3VGJJw_-JxURh_uHzMMJumagKsU'
  },
  {
    id: 2,
    title: 'Modern Studio Apartment',
    price: 4200,
    location: 'Gaborone CBD',
    beds: 1,
    baths: 1,
    sqm: 45,
    rating: 4.5,
    verified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnqgrsGJ5XRW0tWFg6hWXtR3uBB9DHXF1MkDbHJXHq5O1P7xG6afVJsfIN2RFx5RIOTXQED2sybnHcPf92Nmv9KQeGX-XLy7Rmav2uIK4OuaKGLuh27MTnQ5aHsZXSwwUYOdoJSGpWJAWrCBgF18x95Ph9YwxHA_3EFhzWw-mJhe0ePFn0-fb8l1KvvwE8s6FRJ2lACtejnTvJD_qk3_agYrTKHBh7PvdUMyaK4Deg-8aV-Hl4UHJ6biq8rbLixHKkp-4MqmsNDFg'
  },
  {
    id: 3,
    title: 'Renovated 2-Bed Cottage',
    price: 5800,
    location: 'Broadhurst, Ext 16',
    beds: 2,
    baths: 1,
    sqm: 85,
    rating: 4.2,
    verified: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-Zw_P6fQqyLWj7WKjOS0tbiIZi2nZ9D0NZZDy1eUTPfpqKd5GEkdTSoY3JL6njX_bZeaOFZfnoAPVzSdRlzi3S3AEmQ09yqUP11nNCbT2uEV6tRXNysCXMw2NrixIkhvm8Fl7-4h0lDuBLvtsapjaNVDeHb0Ah4hp-TZjsdzDUqqaNfJ33BsWtnLTlHnzIiokWasMchefemJA2jBONZbyambd6Y5YmDO6n6yPzwm-DS2W3nfA4MkFZeZByKzz3LYkvKT3PFAw8r0'
  },
  {
    id: 4,
    title: 'Spacious 4-Bed Family Home',
    price: 12000,
    location: 'Block 8, Gaborone',
    beds: 4,
    baths: 3,
    sqm: 210,
    rating: 4.9,
    verified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY67109O1YEvsu8TRCHxVXgVzUozSC6vLAi88WhULVeO2xczsdKuAGYiMVlyJmZ8UWSP2qH7TjlTAlp6O0Oa8MQfHMu1GRiA3aijoIM16j5hER-D_MA3LdFGxJcH_I3B0pFZ6drMQ5qOMrkohHkDgyhFpX1gazysw8XcyMPas1A6wXcEOkmIYnuJ5JTgAsj706MGT7PcZJRI7kdGrt8nQijysUD2e3avuAgLcv_YCcVX3lzuET8oQy8LLdz2HpdFcpduXGBVFCthA'
  },
  {
    id: 5,
    title: 'G-West 1-Bedroom Loft',
    price: 3500,
    location: 'G-West, Phase 1',
    beds: 1,
    baths: 1,
    sqm: 55,
    rating: 3.9,
    verified: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV8mQx8iJrH_XrtypIZs3Kme8pi8Zqt9MLEbBH5tTIDyA3-WIP9gFTSmvAo-zAWT5f8czxv4LVxvrI_CAZivdlrqqU5SNkZScESUev5qZFSwV-aQ3m3XLtT3_p8ES4pScjx8OxH2mcm3z4I5lN4xH-UagTeNf1FiCS3M2I8J2GGAUxG7DLbpMuC8uWGFkyHgAnYk9JIqWNXmNb6-nmGhiVzVzuIHV5qTiQ4oqJx4V_YBUXIBfTMdq2aXmHL07n58UXLFz79LIcf2c'
  },
  {
    id: 6,
    title: 'Modern Garden Flat',
    price: 6100,
    location: 'Phakalane, Phase 3',
    beds: 2,
    baths: 2,
    sqm: 92,
    rating: 4.7,
    verified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9dm3SERm6VqgscXfHPGkVTQ2wLSKgSLGllQxiN6XaIGpTfrN7qHBE2PjGCZdCTZGR6-IZPZmsna-cRtbab8fY-pchhAGPzLWnlmfIdFIrjLhWKgVNkytSsr8tmM0Ta7fjstfPXNqkhDlelTAnXGoUwbkSCZ1DxI-FuyBs28QLhCFYQjL-0rg242N5wF4qROAXlcK9OpnlIv8qMtSd6HHPuDqrluMrygIU3NXKLon9te-BgIU-8FgNvMQ_P9r8PM6DMqX19_0g4U'
  },
  {
    id: 7,
    title: 'Luxury Penthouse',
    price: 15000,
    location: 'CBD, Gaborone',
    beds: 3,
    baths: 2,
    sqm: 180,
    rating: 5.0,
    verified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzBD7gESqJaZ6U7pJBCCu--A4HwX4Ow71eNSwixDFGB6ALbweJxgNe6gzJhiJ7E_rcWEWI1Iy9O5D7P-2WUcGZ_jcQk9kKG2g_O6Zfc46DWih6lwcKU5tldCyCamHeTSQ0O2zuJIIZtpc72vn1pHskkoNcC2B0q0Dnj7DQzJLbbaqtkN5wePhlhGX7MMRxa8bsJJBDh7jfQ0_JjSIm0dWKCYCsLvrs7n2aiE7DwR8RLJARPacBRsigEoADcI-oTJcA0aJTYtb3Cj4'
  },
  {
    id: 8,
    title: 'Garden Apartment',
    price: 5500,
    location: 'Broadhurst, Ext 11',
    beds: 2,
    baths: 1,
    sqm: 78,
    rating: 4.3,
    verified: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF45GBoMPtWwhIKDwNgiC_NiJJ0nSXILwGvaGD3D0Noif6eBcwzOajg9SAiIFZfl0D9idLmf3qKigjvySf7izhnjddIxLjaIo_MK72pMwwqgKTpwrcFlWa0vm_YyT1NvZL43T55Hbs1bavHxydMe-w3pFi7jtdueDmiqhW-gy4nX0AUFthgeO8FxDRhPdrrCx1gYAsJY4cdOPr9pBXrKDGjbFPOO0ilkcECB7yHfCUexVXKRRTQWbGROe_dQAGz0Ryl4Sn3esfRgU'
  }
];

export default function SearchPage() {
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [2000, 25000],
    neighborhoods: [],
    bedrooms: 'any',
    amenities: []
  });

  return (
    <>
      <Header />
      
      {/* Search Bar */}
      <section className="bg-white border-b border-slate-200 py-4 px-4 sticky top-[73px] z-40">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-96 relative">
            <input 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20" 
              placeholder="Search location..." 
              type="text" 
              defaultValue="Gaborone, Botswana"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar w-full">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold whitespace-nowrap">
             All Properties
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold whitespace-nowrap hover:bg-slate-200 transition-colors">
              Apartment
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold whitespace-nowrap hover:bg-slate-200 transition-colors">
              House
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold whitespace-nowrap hover:bg-slate-200 transition-colors">
              Studio
            </button>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <button 
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium"
            >
              <MapPinIcon className="w-5 h-5" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content with Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Filters */}
        <FilterSidebar filters={filters} setFilters={setFilters} />

        {/* Results Area */}
        <section className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background-light">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{searchResults.length} properties found in Gaborone</h2>
              <p className="text-sm text-slate-500">Updated today • 24 new listings</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">Sort by:</span>
              <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-primary focus:border-primary">
                <option>Newest first</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>

          {/* Property Cards Grid */}
          <div className={`grid ${showMap ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'} gap-6`}>
            {searchResults.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <nav className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-sm">1</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-medium text-sm hover:border-primary transition-all">2</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-medium text-sm hover:border-primary transition-all">3</button>
              <span className="px-2 text-slate-400">...</span>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-medium text-sm hover:border-primary transition-all">12</button>
              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </section>

        {/* Map View (Conditional) */}
        {showMap && (
          <aside className="hidden lg:block w-1/3 bg-slate-100 sticky top-[140px] h-[calc(100vh-140px)] p-4">
            <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-slate-200">
                <img 
                  className="w-full h-full object-cover opacity-60 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuzEa6HXvmNyo-4XZhk18L8srWO3v24TAGMDNWCMbw8IzHjpLrFiBTC-hCEmnSRXx2CdkveexoyaNNBGrtp3V-5OfQLz3N87ARIP2qRRjbkbrlP1GaYyy8OpfWX4KenqezpNuMf_5Vy9hcajExtFTkk34PhFd4gpTmyDG6vRu6rGh7k1qc5wj1PKE3HFoKil_2NV9yyBVhrzVuCUsbl4rc_sYfe8SSmI9gHYXYMjX13_sWn2JlZriQOelCvDqIzklpppFbaNS1FBM"
                  alt="Map view of Gaborone"
                />
              </div>
              
              {/* Map Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-white rounded-xl shadow-xl border border-slate-200 p-1">
                <button className="p-2 hover:bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined text-xl">add</span>
                </button>
                <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                <button className="p-2 hover:bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined text-xl">remove</span>
                </button>
                <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined text-sm">my_location</span>
                  Recenter
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      <Footer />
    </>
  );
}