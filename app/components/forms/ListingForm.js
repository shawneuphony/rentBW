// app/components/forms/ListingForm.js
'use client';

import { useState } from 'react';

const neighborhoods = [
  'Phakalane',
  'Gaborone Central',
  'Block 6',
  'Block 8',
  'Tlokweng',
  'Kgale View',
  'Broadhurst',
  'Phase 2'
];

const AMENITIES = [
  'Parking', 'Security', 'Garden', 'Swimming Pool',
  'Air Conditioning', 'Furnished', 'Pet Friendly', 'Generator'
];

export default function ListingForm({ initialData, onSubmit, isSubmitting }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    neighborhood: '',
    price: '',
    deposit: '',
    sqm: '',
    bedrooms: 2,
    bathrooms: 1,
    amenities: [],
    images: [],
    lease_url: '',
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadingLease, setUploadingLease] = useState(false);
  const [leaseUploadError, setLeaseUploadError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name, increment) => {
    setFormData(prev => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) + increment)
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImages(true);
    setUploadError('');

    try {
      const fd = new FormData();
      files.forEach(file => fd.append('images', file));

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setFormData(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
    } catch (err) {
      setUploadError(err.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLeaseUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLease(true);
    setLeaseUploadError('');
    try {
      const fd = new FormData();
      fd.append('images', file); // re-use the upload endpoint; it accepts any file
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFormData(prev => ({ ...prev, lease_url: data.urls[0] }));
    } catch (err) {
      setLeaseUploadError(err.message || 'Lease upload failed. Please try again.');
    } finally {
      setUploadingLease(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) await onSubmit(formData);
  };

  const nextStep = () => {
    // Fix #5: require lease upload before leaving step 3
    if (step === 3 && !formData.lease_url) {
      setLeaseUploadError('Please upload the lease agreement before continuing.');
      return;
    }
    setStep(s => Math.min(s + 1, 4));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const stepLabels = [
    'Property details',
    'Location & pricing',
    'Photos & amenities',
    'Review & submit',
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Progress Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {initialData ? 'Edit Listing' : 'Create New Listing'}
          </h2>
          <span className="text-sm font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full">
            Step {step} of 4
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-500">{stepLabels[step - 1]}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Property Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Modern 2-Bedroom Apartment in Phakalane"
                className="w-full rounded-lg border border-slate-200 focus:border-primary focus:ring-primary h-12 px-4"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property, nearby amenities, and unique features..."
                rows={6}
                className="w-full rounded-lg border border-slate-200 focus:border-primary focus:ring-primary p-4"
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Location & Pricing */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Area / Neighborhood</label>
                <select
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 focus:border-primary focus:ring-primary h-12 px-4"
                  required
                >
                  <option value="">Select Gaborone Area</option>
                  {neighborhoods.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Monthly Rent (BWP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">BWP</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="5,500"
                    className="w-full rounded-lg border border-slate-200 focus:border-primary focus:ring-primary h-12 pl-16 pr-4"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Security Deposit (BWP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">BWP</span>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    placeholder="5,500"
                    className="w-full rounded-lg border border-slate-200 focus:border-primary focus:ring-primary h-12 pl-16 pr-4"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Size (sqm)</label>
                <input
                  type="number"
                  name="sqm"
                  value={formData.sqm || ''}
                  onChange={handleChange}
                  placeholder="e.g. 85"
                  className="w-full rounded-lg border border-slate-200 focus:border-primary focus:ring-primary h-12 px-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photos & Features */}
        {step === 3 && (
          <div className="space-y-8">
            {/* Photos */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Property Photos</label>
                <p className="text-xs text-slate-400">Upload multiple high-quality photos to attract more tenants. The first photo will be used as the cover image.</p>
              </div>

              <label className={`block border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group ${uploadingImages ? 'border-primary/40 bg-primary/5 cursor-wait' : 'border-slate-200 bg-slate-50 hover:bg-primary/5'}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 group-hover:scale-110 transition-transform text-3xl">
                  {uploadingImages ? (
                    <span className="block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : '↑'}
                </div>
                <p className="font-semibold text-slate-700">
                  {uploadingImages ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG or WebP (max. 10MB each) — multiple files allowed</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </label>

              {uploadError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {uploadError}
                </p>
              )}

              {formData.images.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-3">{formData.images.length} photo{formData.images.length !== 1 ? 's' : ''} uploaded — hover to remove</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={img}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-slate-200"
                        />
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Bedrooms & Bathrooms */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700 block">Rooms</label>
              <div className="grid grid-cols-2 gap-6">
                {[['bedrooms', 'Bedrooms'], ['bathrooms', 'Bathrooms']].map(([field, label]) => (
                  <div key={field} className="flex flex-col gap-2">
                    <label className="text-sm text-slate-600">{label}</label>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-12 bg-white">
                      <button
                        type="button"
                        onClick={() => handleNumberChange(field, -1)}
                        className="px-4 hover:bg-slate-100 transition-colors h-full text-xl font-bold text-slate-600"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full text-center border-none focus:ring-0 bg-transparent"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => handleNumberChange(field, 1)}
                        className="px-4 hover:bg-slate-100 transition-colors h-full text-xl font-bold text-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 block">Amenities</label>
              <div className="grid grid-cols-2 gap-3">
                {AMENITIES.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fix #5 — Lease Document (required) */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Lease Agreement <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-400">Upload the lease agreement for this property. This is required before submitting a listing.</p>
              </div>

              {formData.lease_url ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-lg flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-green-800">Lease uploaded</p>
                    <a href={formData.lease_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline truncate block">
                      View uploaded lease
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, lease_url: '' }))}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className={`block border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer group ${uploadingLease ? 'border-primary/40 bg-primary/5 cursor-wait' : 'border-red-200 bg-red-50 hover:bg-primary/5 hover:border-primary/40'}`}>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-400 mx-auto mb-3 text-2xl">
                    {uploadingLease ? (
                      <span className="block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : '📄'}
                  </div>
                  <p className="font-semibold text-slate-700 text-sm">
                    {uploadingLease ? 'Uploading lease...' : 'Click to upload lease agreement'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG or PNG — max 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleLeaseUpload}
                    disabled={uploadingLease}
                    className="hidden"
                  />
                </label>
              )}

              {leaseUploadError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {leaseUploadError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Review your listing</h3>

            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-sm">
              <div className="flex justify-between px-5 py-3 bg-slate-50">
                <span className="text-slate-500 font-medium">Title</span>
                <span className="text-slate-800 font-semibold text-right max-w-[60%]">{formData.title || '—'}</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="text-slate-800">{formData.neighborhood || '—'}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-slate-50">
                <span className="text-slate-500 font-medium">Rent</span>
                <span className="text-slate-800">BWP {formData.price ? Number(formData.price).toLocaleString() : '—'}/mo</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-slate-500 font-medium">Deposit</span>
                <span className="text-slate-800">{formData.deposit ? `BWP ${Number(formData.deposit).toLocaleString()}` : '—'}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-slate-50">
                <span className="text-slate-500 font-medium">Rooms</span>
                <span className="text-slate-800">{formData.bedrooms} bed · {formData.bathrooms} bath</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-slate-500 font-medium">Amenities</span>
                <span className="text-slate-800 text-right max-w-[60%]">
                  {formData.amenities.length ? formData.amenities.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-slate-50">
                <span className="text-slate-500 font-medium">Photos</span>
                <span className="text-slate-800">{formData.images.length} uploaded</span>
              </div>
              <div className="flex justify-between px-5 py-3">
                <span className="text-slate-500 font-medium">Lease Agreement</span>
                {formData.lease_url
                  ? <a href={formData.lease_url} target="_blank" rel="noreferrer" className="text-primary font-semibold underline text-xs">View document ↗</a>
                  : <span className="text-red-500 font-semibold text-xs">Not uploaded</span>
                }
              </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {formData.images.slice(0, 8).map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {formData.images.length > 8 && (
                  <div className="aspect-square rounded-lg border border-slate-200 flex items-center justify-center text-sm text-slate-500 bg-slate-50">
                    +{formData.images.length - 8} more
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-slate-400">
              Your listing will be reviewed by our team before going live. You will be notified once it is approved.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="pt-8 flex gap-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Previous
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={uploadingImages}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImages ? 'Uploading images…' : 'Next Step'}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Listing'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
