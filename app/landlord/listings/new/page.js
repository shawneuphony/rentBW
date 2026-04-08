// app/landlord/listings/new/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ListingForm from '@/app/components/forms/ListingForm';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function NewListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [idStatus, setIdStatus] = useState(null); // null = loading

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setIdStatus(data?.user?.id_document_status ?? 'none'))
      .catch(() => setIdStatus('none'));
  }, []);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');

    try {
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
        images:      formData.images || [],
        lease_url:   formData.lease_url || '',
      };

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create listing');

      router.push('/landlord/listings?created=1');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (idStatus === null) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  // Fix #4 — ID not approved
  if (idStatus !== 'approved') {
    const messages = {
      none:     { title: 'ID Verification Required', body: 'You must upload and have your identification document approved before you can add listings.' },
      pending:  { title: 'ID Under Review', body: 'Your identification document is currently being reviewed. You will be able to add listings once it is approved.' },
      rejected: { title: 'ID Verification Failed', body: 'Your identification document was rejected. Please upload a new valid ID document to proceed.' },
    };
    const msg = messages[idStatus] || messages.none;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create New Listing</h1>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <ShieldExclamationIcon className="w-14 h-14 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-amber-900 mb-2">{msg.title}</h2>
          <p className="text-amber-800 mb-6 max-w-md mx-auto">{msg.body}</p>
          <Link
            href="/landlord/profile"
            className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition"
          >
            Go to Profile &amp; Upload ID
          </Link>
        </div>
      </div>
    );
  }

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