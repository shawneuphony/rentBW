'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import PropertyCard from '@/app/components/ui/PropertyCard';
import { BuildingOfficeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function InvestorPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/properties?limit=20')
      .then(res => res.json())
      .then(data => {
        setProperties(data.properties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><ArrowPathIcon className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-display">Investment Properties</h1>
      <p className="text-slate-500">Curated properties with high yield potential in Gaborone.</p>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BuildingOfficeIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold">No properties found</h2>
          <p className="text-slate-500">We couldn't find any properties matching your investment criteria.</p>
        </div>
      )}
    </div>
  );
}
