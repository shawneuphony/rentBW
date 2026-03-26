// app/components/ui/ApplyModal.js
'use client';

import { useState } from 'react';
import { XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function ApplyModal({ property, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    message: '',
    documents: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-bold">Apply for {property?.title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Message to Landlord
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20"
              placeholder="Introduce yourself and explain why you'd be a great tenant..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Supporting Documents
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer">
              <DocumentArrowUpIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400 mt-1">ID, proof of income, references (PDF, max 10MB)</p>
              <input type="file" multiple className="hidden" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}