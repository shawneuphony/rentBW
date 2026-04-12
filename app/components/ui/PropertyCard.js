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
  ArrowsRightLeftIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

// Helper to get image source
const getImageSrc = (property) => {
  if (property.image) return property.image;
  if (Array.isArray(property.images) && property.images.length > 0) return property.images[0];
  if (typeof property.images === 'string') {
    try {
      const parsed = JSON.parse(property.images);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch (e) {}
  }
  return null;
};

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f5f3ef'/%3E%3Cpath d='M160 180V130l40-30 40 30v50h-25v-30h-30v30z' fill='%23c8a96e' opacity='0.3'/%3E%3C/svg%3E";

export default function PropertyCard({ property, onSaveToggle }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => {
    const src = getImageSrc(property);
    return src || PLACEHOLDER;
  });
  const [imageLoaded, setImageLoaded] = useState(false);
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

  // Format price with proper notation
  const formattedPrice = property.price?.toLocaleString();

  // Generate random rating if not provided (for demo)
  const rating = property.rating || (4.0 + Math.random() * 1).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 50) + 5;

  return (
    <div className="rw-property-card">
      <Link href={`/property/${property.id}`} className="rw-property-card__link">
        {/* Image Container */}
        <div className="rw-property-card__media">
          <div className={`rw-property-card__image-wrapper ${imageLoaded ? 'rw-property-card__image-wrapper--loaded' : ''}`}>
            <img
              className="rw-property-card__image"
              src={imgSrc}
              alt={property.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImgSrc(PLACEHOLDER)}
            />
          </div>
          
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="rw-property-card__skeleton">
              <div className="rw-property-card__skeleton-shine" />
            </div>
          )}

          {/* Verified Badge */}
          {property.verified && (
            <div className="rw-property-card__badge rw-property-card__badge--verified">
              <CheckBadgeIcon className="rw-property-card__badge-icon" />
              <span>Verified</span>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`rw-property-card__save ${isSaved ? 'rw-property-card__save--saved' : ''}`}
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          >
            {isSaved ? (
              <HeartSolid className="rw-property-card__save-icon rw-property-card__save-icon--saved" />
            ) : (
              <HeartOutline className="rw-property-card__save-icon" />
            )}
          </button>

          {/* Rating Pill */}
          <div className="rw-property-card__rating">
            <StarIcon className="rw-property-card__rating-icon" />
            <span className="rw-property-card__rating-value">{rating}</span>
            <span className="rw-property-card__rating-count">({reviewCount})</span>
          </div>
        </div>

        {/* Content */}
        <div className="rw-property-card__content">
          {/* Price */}
          <div className="rw-property-card__price-wrapper">
            <span className="rw-property-card__price">
              BWP {formattedPrice}
            </span>
            <span className="rw-property-card__period">/month</span>
          </div>

          {/* Title */}
          <h3 className="rw-property-card__title">
            {property.title}
          </h3>

          {/* Location */}
          <div className="rw-property-card__location">
            <MapPinIcon className="rw-property-card__location-icon" />
            <span>{property.location}</span>
          </div>

          {/* Features */}
          <div className="rw-property-card__features">
            <div className="rw-property-card__feature">
              <HomeIcon className="rw-property-card__feature-icon" />
              <span>{property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="rw-property-card__feature">
              <BeakerIcon className="rw-property-card__feature-icon" />
              <span>{property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}</span>
            </div>
            <div className="rw-property-card__feature">
              <BuildingOfficeIcon className="rw-property-card__feature-icon" />
              <span>{property.sqm || '—'} m²</span>
            </div>
          </div>

          {/* Divider */}
          <div className="rw-property-card__divider" />

          {/* Footer */}
          <div className="rw-property-card__footer">
            <div className="rw-property-card__availability">
              <CalendarIcon className="rw-property-card__availability-icon" />
              <span>Available now</span>
            </div>
            <div className="rw-property-card__view">
              <span>View details</span>
              <ArrowsRightLeftIcon className="rw-property-card__view-icon" />
            </div>
          </div>
        </div>
      </Link>

      <style jsx global>{`
        .rw-property-card {
          position: relative;
          background: var(--white);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .rw-property-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.05);
        }

        .rw-property-card__link {
          text-decoration: none;
          display: block;
        }

        /* Media / Image Section */
        .rw-property-card__media {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: var(--surface);
        }

        .rw-property-card__image-wrapper {
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .rw-property-card__image-wrapper--loaded {
          opacity: 1;
        }

        .rw-property-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }

        .rw-property-card:hover .rw-property-card__image {
          transform: scale(1.05);
        }

        /* Skeleton Loader */
        .rw-property-card__skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            var(--surface) 8%,
            #e8e6e0 18%,
            var(--surface) 33%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
        }

        @keyframes shimmer {
          to {
            background-position: -200% 0;
          }
        }

        /* Verified Badge */
        .rw-property-card__badge {
          position: absolute;
          top: 14px;
          left: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .rw-property-card__badge--verified {
          color: var(--accent);
        }

        .rw-property-card__badge-icon {
          width: 14px;
          height: 14px;
        }

        /* Save Button */
        .rw-property-card__save {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
 backdrop-filter: blur(4px);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .rw-property-card__save:hover {
          transform: scale(1.05);
          background: var(--white);
        }

        .rw-property-card__save-icon {
          width: 18px;
          height: 18px;
          color: var(--ink-soft);
          transition: all 0.2s ease;
        }

        .rw-property-card__save--saved {
          background: rgba(255, 255, 255, 0.95);
        }

        .rw-property-card__save-icon--saved {
          color: #ef4444;
          fill: #ef4444;
        }

        /* Rating Pill */
        .rw-property-card__rating {
          position: absolute;
          bottom: 14px;
          left: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .rw-property-card__rating-icon {
          width: 12px;
          height: 12px;
          color: #f59e0b;
          fill: #f59e0b;
        }

        .rw-property-card__rating-value {
          font-weight: 700;
          color: var(--ink);
        }

        .rw-property-card__rating-count {
          font-size: 10px;
          color: var(--text-muted);
        }

        /* Content Section */
        .rw-property-card__content {
          padding: 20px;
        }

        /* Price */
        .rw-property-card__price-wrapper {
          display: flex;
          align-items: baseline;
          gap: 2px;
          margin-bottom: 12px;
        }

        .rw-property-card__price {
          font-family: var(--ff-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: -0.01em;
        }

        .rw-property-card__period {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* Title */
        .rw-property-card__title {
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 8px;
          line-height: 1.4;
          transition: color 0.2s ease;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rw-property-card:hover .rw-property-card__title {
          color: var(--accent);
        }

        /* Location */
        .rw-property-card__location {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .rw-property-card__location-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        /* Features */
        .rw-property-card__features {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .rw-property-card__feature {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--ink-soft);
        }

        .rw-property-card__feature-icon {
          width: 14px;
          height: 14px;
          color: var(--text-muted);
        }

        /* Divider */
        .rw-property-card__divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--accent) 20%,
            var(--accent) 80%,
            transparent
          );
          opacity: 0.15;
          margin-bottom: 14px;
        }

        /* Footer */
        .rw-property-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rw-property-card__availability {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          color: #10b981;
        }

        .rw-property-card__availability-icon {
          width: 13px;
          height: 13px;
        }

        .rw-property-card__view {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.02em;
          transition: gap 0.2s ease;
        }

        .rw-property-card:hover .rw-property-card__view {
          gap: 10px;
        }

        .rw-property-card__view-icon {
          width: 12px;
          height: 12px;
          transition: transform 0.2s ease;
        }

        .rw-property-card:hover .rw-property-card__view-icon {
          transform: translateX(2px);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .rw-property-card__content {
            padding: 16px;
          }

          .rw-property-card__price {
            font-size: 20px;
          }

          .rw-property-card__title {
            font-size: 15px;
          }

          .rw-property-card__features {
            gap: 12px;
          }

          .rw-property-card__feature {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}