// app/property/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/ui/Header';
import Footer from '@/app/components/ui/Footer';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  MapPinIcon,
  HomeIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

function safeJson(val, fallback) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const STATUS_BANNER = {
  pending:  { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: '⏳ This listing is pending admin approval and is not yet visible to the public.' },
  rejected: { bg: 'bg-red-50 border-red-200',    text: 'text-red-800',    label: '✕ This listing has been rejected and is not visible to the public.' },
  rented:   { bg: 'bg-blue-50 border-blue-200',  text: 'text-blue-800',   label: '✓ This property is currently rented.' },
};

export default function PropertyPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [property,  setProperty]  = useState(null);
  const [landlord,  setLandlord]  = useState(null);
  const [similar,   setSimilar]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [saved,     setSaved]     = useState(false);
  const [message,   setMessage]   = useState('');
  const [sending,   setSending]   = useState(false);
  const [msgSent,   setMsgSent]   = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/properties/${id}`, { credentials: 'include' })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Not found');
        return r.json();
      })
      .then(async ({ property: p }) => {
        const images    = safeJson(p.images, []);
        const amenities = safeJson(p.amenities, []);
        setProperty({ ...p, images, amenities });

        // Record view if active
        if (p.status === 'active') {
          fetch(`/api/properties/${id}/view`, { method: 'POST', credentials: 'include' }).catch(() => {});
        }

        // Fetch landlord info
        if (p.landlord_id) {
          fetch(`/api/users/${p.landlord_id}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.user) setLandlord(data.user); })
            .catch(() => {});
        }

        // Fetch similar (same location, active only)
        fetch(`/api/properties?location=${encodeURIComponent(p.location)}&limit=3`, { credentials: 'include' })
          .then(r => r.ok ? r.json() : { properties: [] })
          .then(({ properties }) => setSimilar(properties.filter(x => x.id !== p.id).slice(0, 3)))
          .catch(() => {});
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!user) return;
    await fetch(`/api/properties/${id}/save`, { method: 'POST', credentials: 'include' });
    setSaved(s => !s);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    setSending(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          receiverId:  property.landlord_id,
          propertyId:  property.id,
          content:     message,
        }),
      });
      setMsgSent(true);
      setMessage('');
    } catch { /* ignore */ }
    setSending(false);
  };

  // ── States ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-slate-500">Loading property...</p>
      </main>
      <Footer />
    </>
  );

  if (error || !property) return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-20 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-slate-700 font-medium mb-4">{error || 'Property not found'}</p>
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeftIcon className="w-4 h-4" /> Back to listings
        </Link>
      </main>
      <Footer />
    </>
  );

  const banner = STATUS_BANNER[property.status];
  const canView = property.status === 'active' || user?.role === 'admin' || user?.id === property.landlord_id;

  if (!canView) return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-20 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <p className="text-slate-700 font-medium mb-4">This listing is not publicly available.</p>
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeftIcon className="w-4 h-4" /> Back to listings
        </Link>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* Back */}
        <Link href={user?.role === 'admin' ? '/admin/moderation' : '/'} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          {user?.role === 'admin' ? 'Back to Moderation' : 'Back to Listings'}
        </Link>

        {/* Status banner for admin/landlord */}
        {banner && (user?.role === 'admin' || user?.id === property.landlord_id) && (
          <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${banner.bg} ${banner.text}`}>
            {banner.label}
          </div>
        )}

        {/* Admin quick-action bar */}
        {user?.role === 'admin' && property.status === 'pending' && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 mr-auto">Admin actions:</span>
            <button
              onClick={async () => {
                await fetch('/api/admin/properties', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ propertyId: property.id, action: 'approve' }),
                });
                setProperty(p => ({ ...p, status: 'active' }));
              }}
              className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition"
            >
              ✓ Approve
            </button>
            <button
              onClick={async () => {
                await fetch('/api/admin/properties', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ propertyId: property.id, action: 'reject' }),
                });
                setProperty(p => ({ ...p, status: 'rejected' }));
              }}
              className="px-4 py-2 bg-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-200 transition"
            >
              ✕ Reject
            </button>
          </div>
        )}

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 rounded-2xl overflow-hidden">
          {property.images.length > 0 ? (
            <>
              <img src={property.images[0]} alt={property.title} className="w-full h-72 object-cover" />
              <div className="grid grid-cols-2 gap-3">
                {property.images.slice(1, 5).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-full h-[138px] object-cover" />
                ))}
              </div>
            </>
          ) : (
            <div className="col-span-2 h-72 bg-slate-100 flex items-center justify-center rounded-2xl">
              <HomeIcon className="w-16 h-16 text-slate-300" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title + Price */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">{property.title}</h1>
                <div className="flex items-center gap-1 text-primary font-medium">
                  <MapPinIcon className="w-4 h-4" />
                  {property.location}
                </div>
              </div>
              <div className="bg-primary/10 text-primary px-6 py-3 rounded-xl border border-primary/20 text-right flex-shrink-0">
                <span className="text-2xl font-black">BWP {property.price?.toLocaleString()}</span>
                <span className="text-sm font-medium">/month</span>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: `${property.beds} Bedrooms` },
                { label: `${property.baths} Bathrooms` },
                { label: `${property.sqm || '—'} sqm` },
              ].map(s => (
                <div key={s.label} className="p-4 bg-white border border-primary/10 rounded-xl text-center shadow-sm">
                  <p className="font-bold text-slate-900">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.description && (
              <section>
                <h3 className="text-xl font-bold mb-3">Description</h3>
                <p className="text-slate-600 leading-relaxed">{property.description}</p>
              </section>
            )}

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <section>
                <h3 className="text-xl font-bold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-primary/10">
                      <CheckCircleIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{typeof a === 'string' ? a : a.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Landlord card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold mb-4">Listed by</h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {getInitials(landlord?.name || 'L')}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{landlord?.name || 'Landlord'}</p>
                  {landlord?.verified && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" /> Verified
                    </p>
                  )}
                </div>
              </div>

              {/* Contact / message form */}
              {user && user.role === 'tenant' && property.status === 'active' && (
                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                  {msgSent ? (
                    <p className="text-sm text-green-600 font-medium text-center py-2">✓ Message sent!</p>
                  ) : (
                    <>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Hi, I'm interested in this property..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !message.trim()}
                        className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition text-sm"
                      >
                        {sending ? 'Sending...' : 'Send Message'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {user && property.status === 'active' && (
                <button
                  onClick={handleSave}
                  className={`w-full mt-3 py-2 border rounded-lg text-sm font-medium transition ${
                    saved ? 'bg-primary/10 text-primary border-primary/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {saved ? '✓ Saved' : '♡ Save property'}
                </button>
              )}

              {!user && property.status === 'active' && (
                <Link href="/auth/login" className="block w-full mt-4 py-2.5 bg-primary text-white font-bold rounded-lg text-center text-sm hover:bg-primary/90 transition">
                  Login to Contact
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h3 className="text-xl font-bold mb-4">Similar Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similar.map(p => {
                const imgs = safeJson(p.images, []);
                return (
                  <Link key={p.id} href={`/property/${p.id}`} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-slate-100">
                      {imgs[0]
                        ? <img src={imgs[0]} alt={p.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><HomeIcon className="w-8 h-8 text-slate-300" /></div>
                      }
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-sm truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">{p.location}</p>
                      <p className="text-primary font-bold text-sm mt-1">BWP {p.price?.toLocaleString()}/mo</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}