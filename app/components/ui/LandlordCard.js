// app/components/ui/LandlordCard.js
'use client';

import { useState } from 'react';
import ContactForm from '../forms/ContactForm';

export default function LandlordCard({ landlord, property }) {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-primary/10 shadow-sm">
        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Landlord</h4>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="size-14 rounded-full overflow-hidden bg-primary/5">
            {landlord.image ? (
              <img
                className="w-full h-full object-cover"
                src={landlord.image}
                alt={landlord.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">
                {landlord.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h5 className="font-bold text-lg">{landlord.name}</h5>
            {landlord.verified && (
              <div className="flex items-center gap-1 text-blue-600">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span className="text-xs font-bold">Verified Landlord</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Member since</span>
            <span className="font-semibold">{landlord.memberSince || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Response Rate</span>
            <span className="font-semibold text-primary">{landlord.responseRate || 0}%</span>
          </div>
        </div>

        <button
          onClick={() => setShowContactForm(true)}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mb-3"
        >
          <span className="material-symbols-outlined">chat</span>
          Message Landlord
        </button>

        <button className="w-full bg-white text-primary border-2 border-primary font-bold py-3 rounded-xl hover:bg-primary/5 transition-all">
          Request Viewing
        </button>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative max-w-md w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowContactForm(false)}
              className="absolute top-4 right-4 p-1 bg-white rounded-full shadow-lg z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <ContactForm landlord={landlord} property={property} />
          </div>
        </div>
      )}
    </>
  );
}