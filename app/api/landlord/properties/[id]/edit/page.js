// app/landlord/listings/[id]/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ListingForm from '@/app/components/forms/ListingForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function safeJson(val, fallback) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

export default function EditListingPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [initialData,  setInitialData]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState('');

  // Fetch existing property data and map API fields → form fields
  useEffect(() => {
    if (!id) return;
    fetch(`/api/landlord/properties/${id}`, { credentials: 'include' })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed to load listing');
        return r.json();
      })
      .then(({ property: p }) => {
        setInitialData({
          title:        p.title        || '',
          description:  p.description  || '',
          neighborhood: p.location     || '',   // API uses 'location', form uses 'neighborhood'
          price:        p.price        || '',
          deposit:      '',                      // not stored separately
          bedrooms:     p.beds         || 0,    // API uses 'beds', form uses 'bedrooms'
          bathrooms:    p.baths        || 0,    // API uses 'baths', form uses 'bathrooms'
          amenities:    safeJson(p.amenities, []),
          images:       safeJson(p.images,    []),
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Map form fields → API fields
      const payload = {
        title:       formData.title,
        description: formData.description,
        location:    formData.neighborhood,
        price:       Number(formData.price),
        beds:        Number(formData.bedrooms),
        baths:       Number(formData.bathrooms),
        sqm:         Number(formData.sqm) || 0,
        type:        formData.type || 'apartment',
        amenities:   formData.amenities || [],
        images:      formData.images    || [],
      };

      const res = await fetch(`/api/landlord/properties/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update listing');

      router.push('/landlord/listings?updated=1');
    } catch (err) {
      setError(err.message || 'Failed to update listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-slate-600">Loading listing...</p>
      </div>
    </div>
  );

  if (error && !initialData) return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      <Link href="/landlord/listings" className="text-primary hover:underline">
        ← Back to listings
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/landlord/listings"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to listings
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Listing</h1>
        <p className="text-slate-500 mt-2">
          Update your property details. Changes will reset the listing to pending review.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {initialData && (
        <ListingForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-slate-700 font-medium">Saving changes...</p>
          </div>
        </div>
      )}
    </div>
  );
}