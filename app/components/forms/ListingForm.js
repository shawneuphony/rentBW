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

export default function ListingForm({ initialData, onSubmit }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    neighborhood: '',
    price: '',
    deposit: '',
    bedrooms: 2,
    bathrooms: 1,
    amenities: [],
    images: []
  });

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) await onSubmit(formData);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Progress Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Create New Listing</h2>
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
        <p className="mt-3 text-sm text-slate-500">
          {step === 1 && 'Tell us about your property'}
          {step === 2 && 'Location and pricing details'}
          {step === 3 && 'Property features and amenities'}
          {step === 4 && 'Upload photos and submit'}
        </p>
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
            </div>
          </div>
        )}

        {/* Step 3: Features */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {[['bedrooms', 'Bedrooms'], ['bathrooms', 'Bathrooms']].map(([field, label]) => (
                <div key={field} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">{label}</label>
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700 mb-2">Amenities</label>
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
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Fixed: label wraps the input, no absolute positioning */}
            <label className="block border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-primary/5 transition-colors cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 group-hover:scale-110 transition-transform text-3xl">
                ↑
              </div>
              <p className="font-semibold text-slate-700">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">High-quality PNG or JPG (max. 10MB)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={img}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
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
            )}
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
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/20"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/20"
            >
              Submit Listing
            </button>
          )}
        </div>
      </form>
    </div>
  );
}