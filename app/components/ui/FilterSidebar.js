// app/components/ui/FilterSidebar.js - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';

const neighborhoods = [
  'Phakalane',
  'Broadhurst',
  'Block 8',
  'CBD',
  'G-West',
  'Tlokweng',
  'Kgale View',
  'Phase 2',
];

const amenities = [
  'Parking',
  'Security',
  'Garden',
  'Swimming Pool',
  'Air Conditioning',
  'Furnished',
  'Pet Friendly',
  'Generator',
];

export default function FilterSidebar({ filters, setFilters }) {
  const [showMoreNeighborhoods, setShowMoreNeighborhoods] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange || [2000, 25000]);
  
  const displayedNeighborhoods = showMoreNeighborhoods ? neighborhoods : neighborhoods.slice(0, 5);
  
  useEffect(() => {
    if (filters.priceRange) {
      setLocalPriceRange(filters.priceRange);
    }
  }, [filters.priceRange]);

  const handlePriceMinChange = (e) => {
    const value = parseInt(e.target.value);
    const newRange = [value, localPriceRange[1]];
    setLocalPriceRange(newRange);
    setFilters({ ...filters, priceRange: newRange });
  };

  const handlePriceMaxChange = (e) => {
    const value = parseInt(e.target.value);
    const newRange = [localPriceRange[0], value];
    setLocalPriceRange(newRange);
    setFilters({ ...filters, priceRange: newRange });
  };

  const handleBedroomSelect = (value) => {
    setFilters({ ...filters, bedrooms: value });
  };

  const handlePropertyTypeSelect = (type) => {
    setFilters({ ...filters, propertyType: type });
  };

  return (
    <div className="space-y-8">
      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-4">Price Range (BWP / month)</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span>BWP {localPriceRange[0].toLocaleString()}</span>
            <span>BWP {localPriceRange[1].toLocaleString()}+</span>
          </div>
          <div className="relative h-1.5 w-full bg-slate-200 rounded-full">
            <div 
              className="absolute h-full bg-primary rounded-full"
              style={{
                left: `${(localPriceRange[0] / 25000) * 100}%`,
                right: `${100 - (localPriceRange[1] / 25000) * 100}%`
              }}
            ></div>
            <input
              type="range"
              min="2000"
              max="25000"
              step="500"
              value={localPriceRange[0]}
              onChange={handlePriceMinChange}
              className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-auto"
              style={{ zIndex: 10 }}
            />
            <input
              type="range"
              min="2000"
              max="25000"
              step="500"
              value={localPriceRange[1]}
              onChange={handlePriceMaxChange}
              className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-auto"
              style={{ zIndex: 10 }}
            />
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Property Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'all', label: 'All Types' },
            { value: 'apartment', label: 'Apartment' },
            { value: 'house', label: 'House' },
            { value: 'studio', label: 'Studio' },
            { value: 'townhouse', label: 'Townhouse' },
            { value: 'commercial', label: 'Commercial' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => handlePropertyTypeSelect(type.value)}
              className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                filters.propertyType === type.value
                  ? 'border-2 border-primary bg-primary/5 text-primary font-bold'
                  : 'border-slate-200 hover:border-primary'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Bedrooms</h3>
        <div className="grid grid-cols-4 gap-2">
          {['any', '1', '2', '3+'].map((option) => (
            <button
              key={option}
              onClick={() => handleBedroomSelect(option)}
              className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                filters.bedrooms === option
                  ? 'border-2 border-primary bg-primary/5 text-primary font-bold'
                  : 'border-slate-200 hover:border-primary'
              }`}
            >
              {option === 'any' ? 'Any' : option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}