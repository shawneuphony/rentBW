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
  DocumentTextIcon,
  XMarkIcon,
  HeartIcon as HeartOutline,
  ShareIcon,
  CalendarIcon,
  WifiIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

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
  const [activeImage, setActiveImage] = useState(0);

  // Apply states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage,   setApplyMessage]   = useState('');
  const [applying,       setApplying]       = useState(false);
  const [appliedAlready, setAppliedAlready] = useState(false);
  const [applyError,     setApplyError]     = useState('');

  useEffect(() => {
    if (!id) return;
    async function loadProperty() {
      try {
        const r = await fetch(`/api/properties/${id}`, { credentials: 'include' });
        if (!r.ok) {
          const body = await r.json();
          throw new Error(body.error || 'Not found');
        }
        const { property: p } = await r.json();
        const images    = safeJson(p.images, []);
        const amenities = safeJson(p.amenities, []);
        setProperty({ ...p, images, amenities });

        if (p.status === 'active') {
          fetch(`/api/properties/${id}/view`, { method: 'POST', credentials: 'include' }).catch(() => {});
        }

        if (p.landlord_id) {
          fetch(`/api/users/${p.landlord_id}`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.user) setLandlord(data.user); })
            .catch(() => {});
        }

        fetch(`/api/properties?location=${encodeURIComponent(p.location)}&limit=3`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : { properties: [] })
          .then(({ properties }) => setSimilar(properties.filter(x => x.id !== p.id).slice(0, 3)))
          .catch(() => {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  // Check if tenant already applied
  useEffect(() => {
    if (!user || user.role !== 'tenant' || !id) return;
    fetch('/api/tenant/applications', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { applications: [] })
      .then(({ applications }) => {
        if (applications.some(a => a.property_id === id)) setAppliedAlready(true);
      })
      .catch(() => {});
  }, [user, id]);

  const handleSave = async () => {
    if (!user) return;
    const res = await fetch(`/api/properties/${id}/save`, { method: 'POST', credentials: 'include' });
    if (res.ok) setSaved(s => !s);
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

  const handleApply = async () => {
    if (!applyMessage.trim()) return;
    setApplying(true);
    setApplyError('');
    try {
      const res = await fetch('/api/tenant/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ property_id: property.id, notes: applyMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setAppliedAlready(true);
          setShowApplyModal(false);
        } else {
          throw new Error(data.error || 'Failed to submit application');
        }
      } else {
        setAppliedAlready(true);
        setShowApplyModal(false);
        setApplyMessage('');
      }
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <>
      <Header />
      <div className="rw-loading">
        <div className="rw-loading__spinner" />
        <p className="rw-loading__text">Loading property details...</p>
      </div>
      <Footer />
    </>
  );

  if (error || !property) return (
    <>
      <Header />
      <div className="rw-error-page">
        <div className="rw-error-page__icon">!</div>
        <h1 className="rw-error-page__title">Property not found</h1>
        <p className="rw-error-page__desc">{error || 'The property you\'re looking for doesn\'t exist or has been removed.'}</p>
        <Link href="/" className="rw-error-page__btn">
          <ArrowLeftIcon className="rw-error-page__btn-icon" />
          Back to Home
        </Link>
      </div>
      <Footer />
    </>
  );

  const banner = STATUS_BANNER[property.status];
  const canView = property.status === 'active' || user?.role === 'admin' || user?.id === property.landlord_id;

  if (!canView) return (
    <>
      <Header />
      <div className="rw-error-page">
        <div className="rw-error-page__icon rw-error-page__icon--warning">🔒</div>
        <h1 className="rw-error-page__title">Listing Not Available</h1>
        <p className="rw-error-page__desc">This listing is not publicly available at this time.</p>
        <Link href="/" className="rw-error-page__btn">
          <ArrowLeftIcon className="rw-error-page__btn-icon" />
          Browse Properties
        </Link>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      
      <main className="rw-property-page">
        <div className="rw-container">
          
          {/* Breadcrumb */}
          <div className="rw-breadcrumb">
            <Link href="/" className="rw-breadcrumb__link">Home</Link>
            <span className="rw-breadcrumb__sep">/</span>
            <Link href="/property/search" className="rw-breadcrumb__link">Properties</Link>
            <span className="rw-breadcrumb__sep">/</span>
            <span className="rw-breadcrumb__current">{property.title?.slice(0, 40)}...</span>
          </div>

          {/* Back to Listings Button */}
          <div className="rw-back-link">
            <Link 
              href={user?.role === 'admin' ? '/admin/moderation' : '/property/search'} 
              className="rw-back-link__btn"
            >
              <ArrowLeftIcon className="rw-back-link__icon" />
              {user?.role === 'admin' ? 'Back to Moderation' : 'Back to Listings'}
            </Link>
          </div>

          {/* Status banner for admin/landlord */}
          {banner && (user?.role === 'admin' || user?.id === property.landlord_id) && (
            <div className={`rw-status-banner ${banner.bg}`}>
              <span className={banner.text}>{banner.label}</span>
            </div>
          )}

          {/* Admin quick-action bar */}
          {user?.role === 'admin' && property.status === 'pending' && (
            <div className="rw-admin-bar">
              <span className="rw-admin-bar__label">Admin actions:</span>
              <div className="rw-admin-bar__actions">
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
                  className="rw-admin-bar__btn rw-admin-bar__btn--approve"
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
                  className="rw-admin-bar__btn rw-admin-bar__btn--reject"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          )}

          {/* Gallery Section */}
          <div className="rw-gallery">
            <div className="rw-gallery__main">
              {property.images.length > 0 ? (
                <img 
                  src={property.images[activeImage]} 
                  alt={property.title} 
                  className="rw-gallery__main-img"
                />
              ) : (
                <div className="rw-gallery__placeholder">
                  <HomeIcon className="rw-gallery__placeholder-icon" />
                </div>
              )}
              {property.verified && (
                <div className="rw-gallery__badge">
                  <ShieldCheckIcon className="rw-gallery__badge-icon" />
                  <span>Verified Property</span>
                </div>
              )}
              <button onClick={handleSave} className="rw-gallery__save">
                {saved ? (
                  <HeartSolid className="rw-gallery__save-icon rw-gallery__save-icon--saved" />
                ) : (
                  <HeartOutline className="rw-gallery__save-icon" />
                )}
              </button>
            </div>
            
            {property.images.length > 1 && (
              <div className="rw-gallery__thumbs">
                {property.images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`rw-gallery__thumb ${activeImage === i ? 'rw-gallery__thumb--active' : ''}`}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
                {property.images.length > 4 && (
                  <div className="rw-gallery__more">
                    +{property.images.length - 4} more
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="rw-property-grid">
            
            {/* Left Column - Main Content */}
            <div className="rw-property-main">
              
              {/* Title & Price */}
              <div className="rw-property-header">
                <div>
                  <h1 className="rw-property-header__title">{property.title}</h1>
                  <div className="rw-property-header__location">
                    <MapPinIcon className="rw-property-header__location-icon" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="rw-property-header__price">
                  <span className="rw-property-header__price-value">
                    BWP {property.price?.toLocaleString()}
                  </span>
                  <span className="rw-property-header__price-period">/month</span>
                </div>
              </div>

              {/* Key Specs */}
              <div className="rw-specs">
                {[
                  { icon: HomeIcon, label: `${property.beds} ${property.beds === 1 ? 'Bedroom' : 'Bedrooms'}` },
                  { icon: DevicePhoneMobileIcon, label: `${property.baths} ${property.baths === 1 ? 'Bathroom' : 'Bathrooms'}` },
                  { icon: ArrowsRightLeftIcon, label: `${property.sqm || '—'} m²` },
                  { icon: CalendarIcon, label: 'Available Now' },
                ].map((spec, i) => (
                  <div key={i} className="rw-spec">
                    <spec.icon className="rw-spec__icon" />
                    <span className="rw-spec__label">{spec.label}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {property.description && (
                <section className="rw-section">
                  <h2 className="rw-section__title">Description</h2>
                  <p className="rw-section__text">{property.description}</p>
                </section>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <section className="rw-section">
                  <h2 className="rw-section__title">Amenities & Features</h2>
                  <div className="rw-amenities">
                    {property.amenities.map((a, i) => (
                      <div key={i} className="rw-amenity">
                        <CheckCircleIcon className="rw-amenity__icon" />
                        <span>{typeof a === 'string' ? a : a.label}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="rw-property-sidebar">
              
              {/* Landlord Card */}
              <div className="rw-card">
                <h3 className="rw-card__title">Listed by</h3>
                <div className="rw-landlord">
                  <div className="rw-landlord__avatar">
                    {getInitials(landlord?.name || 'L')}
                  </div>
                  <div className="rw-landlord__info">
                    <p className="rw-landlord__name">{landlord?.name || 'Property Owner'}</p>
                    {landlord?.verified && (
                      <p className="rw-landlord__verified">
                        <CheckCircleIcon className="rw-landlord__verified-icon" />
                        Verified Landlord
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Form */}
                {user && user.role === 'tenant' && property.status === 'active' && (
                  <div className="rw-contact-form">
                    {msgSent ? (
                      <div className="rw-contact-form__success">
                        <CheckCircleIcon className="rw-contact-form__success-icon" />
                        <p>Message sent! The landlord will respond shortly.</p>
                      </div>
                    ) : (
                      <>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder="Hi, I'm interested in this property. I'd love to schedule a viewing..."
                          rows={4}
                          className="rw-contact-form__textarea"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={sending || !message.trim()}
                          className="rw-btn rw-btn--primary rw-btn--full"
                        >
                          {sending ? 'Sending...' : 'Send Message'}
                        </button>
                      </>
                    )}

                    {/* Apply Button */}
                    <div className="rw-apply-section">
                      {appliedAlready ? (
                        <div className="rw-apply-success">
                          <CheckCircleIcon className="rw-apply-success__icon" />
                          <span>Application submitted!</span>
                          <Link href="/tenant/applications" className="rw-apply-success__link">
                            View status →
                          </Link>
                        </div>
                      ) : user?.id_document_status !== 'approved' ? (
                        <div className="rw-warning">
                          <ExclamationTriangleIcon className="rw-warning__icon" />
                          <p className="rw-warning__title">ID Verification Required</p>
                          <p className="rw-warning__text">Your identification must be approved before you can apply.</p>
                          <Link href="/tenant/profile" className="rw-warning__link">
                            Upload your ID →
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowApplyModal(true)}
                          className="rw-btn rw-btn--success rw-btn--full"
                        >
                          <DocumentTextIcon className="rw-btn__icon" />
                          Apply for this Property
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {user && property.status === 'active' && (
                  <button
                    onClick={handleSave}
                    className={`rw-btn rw-btn--outline rw-btn--full ${saved ? 'rw-btn--saved' : ''}`}
                  >
                    {saved ? '✓ Saved to Favorites' : '♡ Save Property'}
                  </button>
                )}

                {!user && property.status === 'active' && (
                  <Link href="/auth/login" className="rw-btn rw-btn--primary rw-btn--full">
                    Login to Contact
                  </Link>
                )}
              </div>

              {/* Quick Info Card */}
              <div className="rw-card">
                <h3 className="rw-card__title">Quick Info</h3>
                <div className="rw-quick-info">
                  <div className="rw-quick-info__item">
                    <CurrencyDollarIcon className="rw-quick-info__icon" />
                    <div>
                      <p className="rw-quick-info__label">Security Deposit</p>
                      <p className="rw-quick-info__value">BWP {property.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="rw-quick-info__item">
                    <CalendarIcon className="rw-quick-info__icon" />
                    <div>
                      <p className="rw-quick-info__label">Lease Term</p>
                      <p className="rw-quick-info__value">12 months minimum</p>
                    </div>
                  </div>
                  <div className="rw-quick-info__item">
                    <WifiIcon className="rw-quick-info__icon" />
                    <div>
                      <p className="rw-quick-info__label">Utilities</p>
                      <p className="rw-quick-info__value">Not included</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          {similar.length > 0 && (
            <section className="rw-similar">
              <h2 className="rw-similar__title">Similar Properties</h2>
              <p className="rw-similar__subtitle">You might also like these listings in {property.location}</p>
              <div className="rw-similar__grid">
                {similar.map(p => {
                  const imgs = safeJson(p.images, []);
                  return (
                    <Link key={p.id} href={`/property/${p.id}`} className="rw-similar-card">
                      <div className="rw-similar-card__image">
                        {imgs[0] ? (
                          <img src={imgs[0]} alt={p.title} />
                        ) : (
                          <HomeIcon className="rw-similar-card__placeholder" />
                        )}
                      </div>
                      <div className="rw-similar-card__content">
                        <h3 className="rw-similar-card__title">{p.title}</h3>
                        <p className="rw-similar-card__location">{p.location}</p>
                        <p className="rw-similar-card__price">BWP {p.price?.toLocaleString()}/mo</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="rw-modal">
          <div className="rw-modal__overlay" onClick={() => setShowApplyModal(false)} />
          <div className="rw-modal__content">
            <div className="rw-modal__header">
              <div>
                <h3 className="rw-modal__title">Apply for this Property</h3>
                <p className="rw-modal__subtitle">{property.title}</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="rw-modal__close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="rw-modal__body">
              <label className="rw-modal__label">
                Message to Landlord <span className="rw-modal__required">*</span>
              </label>
              <textarea
                value={applyMessage}
                onChange={e => setApplyMessage(e.target.value)}
                rows={5}
                placeholder="Introduce yourself — tell the landlord about your employment, rental history, and why you'd be a great tenant..."
                className="rw-modal__textarea"
              />
              {applyError && (
                <div className="rw-modal__error">
                  <ExclamationTriangleIcon className="rw-modal__error-icon" />
                  <span>{applyError}</span>
                </div>
              )}
            </div>
            <div className="rw-modal__footer">
              <button onClick={() => setShowApplyModal(false)} className="rw-modal__cancel">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || !applyMessage.trim()}
                className="rw-modal__submit"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx global>{`
        /* Loading State */
        .rw-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--surface);
        }
        .rw-loading__spinner {
          width: 48px;
          height: 48px;
          border: 2px solid var(--surface);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 20px;
        }
        .rw-loading__text {
          color: var(--text-muted);
          font-size: 14px;
        }

        /* Error Page */
        .rw-error-page {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          background: var(--surface);
        }
        .rw-error-page__icon {
          width: 80px;
          height: 80px;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 700;
          margin-bottom: 24px;
        }
        .rw-error-page__icon--warning {
          background: #fef3c7;
          color: #f59e0b;
          font-size: 36px;
        }
        .rw-error-page__title {
          font-family: var(--ff-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 12px;
        }
        .rw-error-page__desc {
          color: var(--text-muted);
          margin-bottom: 32px;
          max-width: 400px;
        }
        .rw-error-page__btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: var(--ink);
          color: var(--white);
          border-radius: 100px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .rw-error-page__btn:hover {
          background: var(--accent);
        }
        .rw-error-page__btn-icon {
          width: 16px;
          height: 16px;
        }

        /* Main Layout */
        .rw-property-page {
          background: var(--surface);
          padding: 32px 0 80px;
          min-height: 100vh;
        }
        .rw-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
        }
        @media (max-width: 768px) {
          .rw-container {
            padding: 0 20px;
          }
        }

        /* Breadcrumb */
        .rw-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .rw-breadcrumb__link {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .rw-breadcrumb__link:hover {
          color: var(--accent);
        }
        .rw-breadcrumb__sep {
          color: var(--text-muted);
        }
        .rw-breadcrumb__current {
          color: var(--ink);
          font-weight: 500;
        }

        /* Back Link */
        .rw-back-link {
          margin-bottom: 24px;
        }
        .rw-back-link__btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          border-radius: 100px;
        }
        .rw-back-link__btn:hover {
          color: var(--accent);
          gap: 12px;
          background: rgba(200, 169, 110, 0.1);
        }
        .rw-back-link__icon {
          width: 16px;
          height: 16px;
        }

        /* Status Banner */
        .rw-status-banner {
          padding: 14px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 13px;
          font-weight: 500;
        }

        /* Admin Bar */
        .rw-admin-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          background: var(--white);
          padding: 16px 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .rw-admin-bar__label {
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
        }
        .rw-admin-bar__actions {
          display: flex;
          gap: 12px;
        }
        .rw-admin-bar__btn {
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rw-admin-bar__btn--approve {
          background: #10b981;
          color: white;
        }
        .rw-admin-bar__btn--approve:hover {
          background: #059669;
        }
        .rw-admin-bar__btn--reject {
          background: #fee2e2;
          color: #ef4444;
        }
        .rw-admin-bar__btn--reject:hover {
          background: #fecaca;
        }

        /* Gallery */
        .rw-gallery {
          margin-bottom: 48px;
        }
        .rw-gallery__main {
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 24px;
          overflow: hidden;
          background: var(--white);
          margin-bottom: 12px;
        }
        .rw-gallery__main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .rw-gallery__placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--surface) 0%, #e8e6e0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rw-gallery__placeholder-icon {
          width: 80px;
          height: 80px;
          color: var(--text-muted);
          opacity: 0.3;
        }
        .rw-gallery__badge {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          border-radius: 100px;
          color: var(--white);
          font-size: 12px;
          font-weight: 600;
        }
        .rw-gallery__badge-icon {
          width: 16px;
          height: 16px;
        }
        .rw-gallery__save {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rw-gallery__save:hover {
          transform: scale(1.05);
        }
        .rw-gallery__save-icon {
          width: 22px;
          height: 22px;
          color: var(--ink-soft);
        }
        .rw-gallery__save-icon--saved {
          color: #ef4444;
          fill: #ef4444;
        }
        .rw-gallery__thumbs {
          display: flex;
          gap: 12px;
        }
        .rw-gallery__thumb {
          width: 100px;
          height: 70px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rw-gallery__thumb--active {
          border-color: var(--accent);
        }
        .rw-gallery__thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .rw-gallery__more {
          width: 100px;
          height: 70px;
          background: var(--ink);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-size: 13px;
          font-weight: 600;
        }

        /* Property Grid */
        .rw-property-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 48px;
        }
        @media (max-width: 1024px) {
          .rw-property-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }

        /* Property Header */
        .rw-property-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .rw-property-header__title {
          font-family: var(--ff-display);
          font-size: 32px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
        }
        .rw-property-header__location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--accent);
          font-size: 14px;
        }
        .rw-property-header__location-icon {
          width: 16px;
          height: 16px;
        }
        .rw-property-header__price {
          background: rgba(200, 169, 110, 0.1);
          padding: 12px 24px;
          border-radius: 16px;
          text-align: right;
        }
        .rw-property-header__price-value {
          font-family: var(--ff-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--accent);
        }
        .rw-property-header__price-period {
          font-size: 13px;
          color: var(--text-muted);
          margin-left: 4px;
        }

        /* Specs */
        .rw-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: 40px;
        }
        .rw-spec {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: var(--white);
          border-radius: 100px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .rw-spec__icon {
          width: 18px;
          height: 18px;
          color: var(--accent);
        }
        .rw-spec__label {
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
        }

        /* Sections */
        .rw-section {
          margin-bottom: 40px;
        }
        .rw-section__title {
          font-family: var(--ff-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 16px;
        }
        .rw-section__text {
          color: var(--text-muted);
          line-height: 1.7;
          font-size: 15px;
        }

        /* Amenities */
        .rw-amenities {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (max-width: 640px) {
          .rw-amenities {
            grid-template-columns: 1fr;
          }
        }
        .rw-amenity {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--white);
          border-radius: 12px;
          font-size: 13px;
          color: var(--ink);
        }
        .rw-amenity__icon {
          width: 16px;
          height: 16px;
          color: var(--accent);
        }

        /* Sidebar Cards */
        .rw-card {
          background: var(--white);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .rw-card__title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        /* Landlord */
        .rw-landlord {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .rw-landlord__avatar {
          width: 56px;
          height: 56px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
          color: var(--white);
        }
        .rw-landlord__name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }
        .rw-landlord__verified {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #10b981;
        }
        .rw-landlord__verified-icon {
          width: 14px;
          height: 14px;
        }

        /* Contact Form */
        .rw-contact-form {
          margin-bottom: 20px;
        }
        .rw-contact-form__textarea {
          width: 100%;
          padding: 14px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          font-size: 13px;
          resize: vertical;
          margin-bottom: 12px;
          font-family: inherit;
        }
        .rw-contact-form__textarea:focus {
          outline: none;
          border-color: var(--accent);
        }
        .rw-contact-form__success {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px;
          background: #ecfdf5;
          border-radius: 12px;
          color: #10b981;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .rw-contact-form__success-icon {
          width: 20px;
          height: 20px;
        }

        /* Apply Section */
        .rw-apply-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .rw-apply-success {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 12px;
          background: #ecfdf5;
          border-radius: 12px;
          font-size: 13px;
          color: #10b981;
        }
        .rw-apply-success__link {
          margin-left: auto;
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }
        .rw-warning {
          padding: 16px;
          background: #fef3c7;
          border-radius: 12px;
        }
        .rw-warning__icon {
          width: 20px;
          height: 20px;
          color: #f59e0b;
          margin-bottom: 8px;
        }
        .rw-warning__title {
          font-weight: 600;
          font-size: 13px;
          color: #92400e;
          margin-bottom: 4px;
        }
        .rw-warning__text {
          font-size: 12px;
          color: #92400e;
          margin-bottom: 12px;
        }
        .rw-warning__link {
          font-size: 12px;
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }

        /* Buttons */
        .rw-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .rw-btn--full {
          width: 100%;
        }
        .rw-btn--primary {
          background: var(--ink);
          color: var(--white);
        }
        .rw-btn--primary:hover:not(:disabled) {
          background: var(--accent);
        }
        .rw-btn--success {
          background: #10b981;
          color: white;
        }
        .rw-btn--success:hover:not(:disabled) {
          background: #059669;
        }
        .rw-btn--outline {
          background: transparent;
          border: 1px solid #e0e0e0;
          color: var(--ink);
        }
        .rw-btn--outline:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .rw-btn--saved {
          background: rgba(200, 169, 110, 0.1);
          border-color: var(--accent);
          color: var(--accent);
        }
        .rw-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .rw-btn__icon {
          width: 16px;
          height: 16px;
        }

        /* Quick Info */
        .rw-quick-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rw-quick-info__item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rw-quick-info__icon {
          width: 20px;
          height: 20px;
          color: var(--accent);
        }
        .rw-quick-info__label {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 2px;
        }
        .rw-quick-info__value {
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
        }

        /* Similar Properties */
        .rw-similar {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .rw-similar__title {
          font-family: var(--ff-display);
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
        }
        .rw-similar__subtitle {
          color: var(--text-muted);
          margin-bottom: 32px;
        }
        .rw-similar__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 768px) {
          .rw-similar__grid {
            grid-template-columns: 1fr;
          }
        }
        .rw-similar-card {
          background: var(--white);
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.3s;
        }
        .rw-similar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }
        .rw-similar-card__image {
          aspect-ratio: 4/3;
          overflow: hidden;
          background: var(--surface);
        }
        .rw-similar-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .rw-similar-card:hover .rw-similar-card__image img {
          transform: scale(1.05);
        }
        .rw-similar-card__placeholder {
          width: 100%;
          height: 100%;
          color: var(--text-muted);
          opacity: 0.3;
        }
        .rw-similar-card__content {
          padding: 16px;
        }
        .rw-similar-card__title {
          font-weight: 600;
          font-size: 15px;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .rw-similar-card__location {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .rw-similar-card__price {
          font-weight: 700;
          color: var(--accent);
          font-size: 14px;
        }

        /* Modal */
        .rw-modal {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .rw-modal__overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .rw-modal__content {
          position: relative;
          background: var(--white);
          border-radius: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          animation: modalSlideUp 0.3s ease;
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .rw-modal__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 24px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .rw-modal__title {
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
        }
        .rw-modal__subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .rw-modal__close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .rw-modal__close:hover {
          background: var(--surface);
        }
        .rw-modal__body {
          padding: 24px;
        }
        .rw-modal__label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .rw-modal__required {
          color: #ef4444;
        }
        .rw-modal__textarea {
          width: 100%;
          padding: 14px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          font-size: 13px;
          resize: vertical;
          font-family: inherit;
        }
        .rw-modal__textarea:focus {
          outline: none;
          border-color: var(--accent);
        }
        .rw-modal__error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 12px;
          background: #fee2e2;
          border-radius: 12px;
          font-size: 13px;
          color: #ef4444;
        }
        .rw-modal__error-icon {
          width: 18px;
          height: 18px;
        }
        .rw-modal__footer {
          display: flex;
          gap: 12px;
          padding: 16px 24px 24px;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .rw-modal__cancel {
          flex: 1;
          padding: 12px;
          background: var(--surface);
          border: none;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .rw-modal__cancel:hover {
          background: #e8e6e0;
        }
        .rw-modal__submit {
          flex: 1;
          padding: 12px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .rw-modal__submit:hover:not(:disabled) {
          background: #059669;
        }
        .rw-modal__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}