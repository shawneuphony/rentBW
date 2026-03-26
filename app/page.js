// app/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import PropertyCard from '@/app/components/ui/PropertyCard';
import Header from '@/app/components/ui/Header';
import Footer from '@/app/components/ui/Footer';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [trendingProperties, setTrendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalProperties: 0,
    happyTenants: 0,
    verifiedLandlords: 0
  });

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, []);

  const fetchProperties = async () => {
    try {
      // Fetch featured properties (newest)
      const featuredRes = await fetch('/api/properties?sort=newest&limit=6');
      const featuredData = await featuredRes.json();
      setFeaturedProperties(featuredData.properties || []);

      // Fetch trending properties (most viewed/saved)
      const trendingRes = await fetch('/api/properties?sort=trending&limit=6');
      const trendingData = await trendingRes.json();
      setTrendingProperties(trendingData.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats({
        totalProperties: data.totalProperties || 1200,
        happyTenants: data.happyTenants || 500,
        verifiedLandlords: data.verifiedLandlords || 300
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails
      setStats({
        totalProperties: 1200,
        happyTenants: 500,
        verifiedLandlords: 300
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/property/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickFilters = [
    { id: 'apartment', label: 'Apartment', icon: BuildingOfficeIcon },
    { id: 'house', label: 'House', icon: HomeIcon },
    { id: 'studio', label: 'Studio', icon: BuildingOfficeIcon },
    { id: 'commercial', label: 'Commercial', icon: BuildingOfficeIcon },
  ];

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 via-primary/5 to-background-light pt-20 pb-16 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-[1440px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6">
            Find Your Perfect Home in Gaborone
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
            Discover the best rental properties across Gaborone's finest neighborhoods. 
            {!user && " Join thousands of satisfied tenants and landlords."}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, property type, or keyword..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-base shadow-lg"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {quickFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Link
                  key={filter.id}
                  href={`/property/search?type=${filter.id}`}
                  className="group flex items-center gap-2 px-6 py-3 bg-white rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-all shadow-sm border border-slate-200"
                >
                  <Icon className="w-4 h-4 group-hover:text-white transition-colors" />
                  {filter.label}
                </Link>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-16 mt-12">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.totalProperties}+</p>
              <p className="text-sm text-slate-500">Properties</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.happyTenants}+</p>
              <p className="text-sm text-slate-500">Happy Tenants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{stats.verifiedLandlords}+</p>
              <p className="text-sm text-slate-500">Verified Landlords</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-[1440px] mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Properties</h2>
            <p className="text-slate-500 mt-2">Hand-picked properties just for you</p>
          </div>
          <Link 
            href="/property/search" 
            className="text-primary font-bold hover:underline flex items-center gap-1 group"
          >
            View All
            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <BuildingOfficeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No properties yet</h3>
            <p className="text-slate-500">Check back soon for new listings</p>
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16 px-4 border-t border-primary/10">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why Choose RentBW?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <CheckBadgeIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Landlords</h3>
              <p className="text-slate-500">
                All landlords are verified to ensure safe and legitimate transactions.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MagnifyingGlassIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Search</h3>
              <p className="text-slate-500">
                Find exactly what you're looking for with our advanced filtering system.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Market Insights</h3>
              <p className="text-slate-500">
                Get real-time market data and investment insights for investors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      {trendingProperties.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Trending Now</h2>
              <p className="text-slate-500 mt-2">Most viewed properties this week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProperties.slice(0, 3).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-[1440px] mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {user ? 'Ready to find your new home?' : 'Join RentBW Today'}
          </h3>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            {user 
              ? 'Browse thousands of properties and find your perfect match.'
              : 'Create an account to save your favorite properties, contact landlords directly, and get personalized recommendations.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/property/search"
                className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg"
              >
                Browse Properties
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/property/search"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                >
                  Browse Properties
                </Link>
              </>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-white/20">
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5" />
              <span className="text-sm">Verified Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" />
              <span className="text-sm">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              <span className="text-sm">All Gaborone</span>
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhoods Grid */}
      <section className="bg-white py-16 px-4 border-t border-primary/10">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">
            Popular Neighborhoods
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            Explore properties in Gaborone's most sought-after areas
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Phakalane', 'CBD', 'Block 8', 'Broadhurst'].map((neighborhood) => (
              <Link
                key={neighborhood}
                href={`/property/search?neighborhood=${neighborhood}`}
                className="group relative h-48 rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-primary/20 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-white font-bold text-xl">{neighborhood}</h3>
                  <p className="text-white/80 text-sm">View properties →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}