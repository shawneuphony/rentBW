// app/landlord/listings/new/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ListingForm from '@/app/components/forms/ListingForm';

export default function NewListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Map ListingForm field names → API field names
      const payload = {
        title:       formData.title,
        description: formData.description,
        location:    formData.neighborhood,   // form uses 'neighborhood'
        price:       Number(formData.price),
        beds:        Number(formData.bedrooms),  // form uses 'bedrooms'
        baths:       Number(formData.bathrooms), // form uses 'bathrooms'
        sqm:         Number(formData.sqm) || 0,
        type:        formData.type || 'apartment',
        amenities:   formData.amenities || [],
        images:      formData.images || [],
      };

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      router.push('/landlord/listings?created=1');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create New Listing</h1>
        <p className="text-slate-500 mt-2">
          Fill in the details below to list your property. All listings are reviewed before going live.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-slate-700 font-medium">Submitting your listing...</p>
            <p className="text-slate-400 text-sm mt-1">It will be reviewed by our team before going live.</p>
          </div>
        </div>
      )}
    </div>
  );
}