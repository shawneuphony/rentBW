// app/components/ui/FilterSidebar.js
'use client';

import { useState } from 'react';

const neighborhoods = [
  'Phakalane',
  'Broadhurst',
  'Block 8',
  'CBD',
  'G-West',
  'Tlokweng',
  'Kgale View',
  'Phase 2'
];

const amenities = [
  'Parking',
  'Security',
  'Garden',
  'Swimming Pool',
  'Air Conditioning',
  'Furnished',
  'Pet Friendly',
  'Generator'
];

export default function FilterSidebar({ filters, setFilters }) {
  const [showMoreNeighborhoods, setShowMoreNeighborhoods] = useState(false);
  const displayedNeighborhoods = showMoreNeighborhoods ? neighborhoods : neighborhoods.slice(0, 5);

  const handlePriceChange = (type, value) => {
    setFilters({
      ...filters,
      priceRange: type === 'min' 
        ? [value, filters.priceRange[1]]
        : [filters.priceRange[0], value]
    });
  };

  const handleNeighborhoodToggle = (neighborhood) => {
    const updated = filters.neighborhoods.includes(neighborhood)
      ? filters.neighborhoods.filter(n => n !== neighborhood)
      : [...filters.neighborhoods, neighborhood];
    setFilters({ ...filters, neighborhoods: updated });
  };

  const handleAmenityToggle = (amenity) => {
    const updated = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    setFilters({ ...filters, amenities: updated });
  };

  return (
    <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-primary/10 overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-8">
        {/* Price Range */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4">Price Range (BWP)</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>BWP {filters.priceRange[0].toLocaleString()}</span>
              <span>BWP {filters.priceRange[1].toLocaleString()}+</span>
            </div>
            <div className="relative h-1.5 w-full bg-slate-200 rounded-full">
              <div 
                className="absolute h-full bg-primary rounded-full"
                style={{
                  left: `${(filters.priceRange[0] / 25000) * 100}%`,
                  right: `${100 - (filters.priceRange[1] / 25000) * 100}%`
                }}
              ></div>
              <input
                type="range"
                min="2000"
                max="25000"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange('min', parseInt(e.target.value))}
                className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none"
                style={{ zIndex: 10 }}
              />
              <input
                type="range"
                min="2000"
                max="25000"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
                className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none"
                style={{ zIndex: 10 }}
              />
            </div>
          </div>
        </div>

        {/* Neighborhoods */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Neighborhoods</h3>
          <div className="space-y-2.5">
            {displayedNeighborhoods.map((neighborhood) => (
              <label key={neighborhood} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.neighborhoods.includes(neighborhood)}
                  onChange={() => handleNeighborhoodToggle(neighborhood)}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">
                  {neighborhood}
                </span>
              </label>
            ))}
            <button
              onClick={() => setShowMoreNeighborhoods(!showMoreNeighborhoods)}
              className="text-xs font-bold text-primary mt-2 hover:underline"
            >
              {showMoreNeighborhoods ? 'Show less' : 'Show more'}
            </button>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Bedrooms</h3>
          <div className="grid grid-cols-4 gap-2">
            {['Any', '1', '2', '3+'].map((option) => (
              <button
                key={option}
                onClick={() => setFilters({ ...filters, bedrooms: option })}
                className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                  filters.bedrooms === option
                    ? 'border-2 border-primary bg-primary/5 text-primary font-bold'
                    : 'border-slate-200 hover:border-primary'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Amenities</h3>
          <div className="space-y-2.5">
            {amenities.slice(0, 6).map((amenity) => (
              <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">
                  {amenity}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setFilters({
              priceRange: [2000, 25000],
              neighborhoods: [],
              bedrooms: 'any',
              amenities: []
            });
          }}
          className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
        >
          Clear Filters
        </button>

        <button className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          Apply Filters
        </button>
      </div>
    </aside>
  );
}