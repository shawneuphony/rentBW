// app/components/ui/PropertyCard.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  HeartIcon as HeartOutline,
  MapPinIcon,
  HomeIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  StarIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

// Inline SVG data URI — no external file needed, never 404s
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cpath d='M160 180V130l40-30 40 30v50h-25v-30h-30v30z' fill='%23cbd5e1'/%3E%3Crect x='168' y='155' width='14' height='25' fill='%23f1f5f9'/%3E%3C/svg%3E";

export default function PropertyCard({ property, onSaveToggle }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => {
    if (property.image) return property.image;
    if (Array.isArray(property.images) && property.images.length > 0) return property.images[0];
    if (typeof property.images === 'string') {
      try { const a = JSON.parse(property.images); return Array.isArray(a) && a.length > 0 ? a[0] : PLACEHOLDER; } catch { return PLACEHOLDER; }
    }
    return PLACEHOLDER;
  });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      checkIfSaved();
    }
  }, [user, property.id]);

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/properties/${property.id}/saved`, {
        credentials: 'include',
      });
      const data = await response.json();
      setIsSaved(data.saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      localStorage.setItem('redirectAfterLogin', `/property/${property.id}`);
      router.push('/auth/login');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/properties/${property.id}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        if (onSaveToggle) {
          onSaveToggle(property.id, !isSaved);
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div className="relative h-56 overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            src={imgSrc}
            alt={property.title}
            loading="lazy"
            onError={() => setImgSrc(PLACEHOLDER)} // ← use state, never loops
          />

          {property.verified && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-primary flex items-center gap-1 shadow-lg border border-primary/20 z-10">
              <CheckBadgeIcon className="w-3 h-3" />
              VERIFIED
            </div>
          )}

          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-all duration-300 z-20 group/heart"
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          >
            {isSaved ? (
              <HeartSolid className="w-4 h-4 text-red-500 transform group-hover/heart:scale-110 transition-transform" />
            ) : (
              <HeartOutline className="w-4 h-4 text-slate-600 group-hover/heart:text-red-500 transition-colors" />
            )}
          </button>

          <div className="absolute bottom-3 left-3 bg-white/95 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg z-10">
            <StarIcon className="w-3 h-3 text-amber-500 fill-current" />
            <span>{property.rating || '4.5'}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-primary">
              BWP {property.price?.toLocaleString()}
              <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
            </h3>
          </div>

          <p className="text-sm font-semibold text-slate-800 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </p>

          <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
            <MapPinIcon className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          <div className="flex items-center gap-4 py-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-600" title="Bedrooms">
              <HomeIcon className="w-4 h-4" />
              <span>{property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600" title="Bathrooms">
              <BeakerIcon className="w-4 h-4" />
              <span>{property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600" title="Square meters">
              <BuildingOfficeIcon className="w-4 h-4" />
              <span>{property.sqm} m²</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}