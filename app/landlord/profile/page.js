// app/landlord/profile/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';  
import {
  CheckBadgeIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
  CameraIcon,
  DocumentTextIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolid,
  ShieldCheckIcon as ShieldSolid,
} from '@heroicons/react/24/solid';

export default function RedirectProfile() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/landlord/profile');
  }, [router]);
  return null;
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
      toast.type === 'success'
        ? 'bg-green-50 text-green-800 border border-green-200'
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {toast.type === 'success'
        ? <CheckCircleSolid className="w-5 h-5 text-green-600" />
        : <XCircleIcon      className="w-5 h-5 text-red-600" />}
      <span className="text-sm">{toast.message}</span>
    </div>
  );
}

// ── ID Document Status Badge ───────────────────────────────────────────────────

function DocStatusBadge({ status }) {
  const map = {
    none:     { label: 'Not uploaded',  cls: 'bg-slate-100 text-slate-500',  Icon: DocumentTextIcon },
    pending:  { label: 'Under review',  cls: 'bg-amber-100 text-amber-700',  Icon: ClockIcon },
    verified: { label: 'Verified',      cls: 'bg-green-100 text-green-700',  Icon: ShieldSolid },
    rejected: { label: 'Rejected',      cls: 'bg-red-100 text-red-700',      Icon: XCircleIcon },
  };
  const { label, cls, Icon } = map[status] ?? map.none;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function LandlordProfilePage() {
  const { user, refreshUser } = useAuth();

  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [isEditing,     setIsEditing]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [stats,         setStats]         = useState({ responseRate: 0, totalListings: 0 });
  const [form,          setForm]          = useState({ name: '', phone: '' });
  const [toast,         setToast]         = useState({ show: false, message: '', type: 'success' });

  // Avatar
  const avatarRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ID Document
  const docRef    = useRef(null);
  const [docUploading,  setDocUploading]  = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);

  // Password
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm,     setPwForm]     = useState({ current: '', next: '', confirm: '' });
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwError,    setPwError]    = useState('');

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ── Load ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        const u    = data.user ?? data;
        setProfile(u);
        setForm({ name: u.name ?? '', phone: u.phone ?? '' });
      } catch {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  useEffect(() => {
    fetch('/api/landlord/stats', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setStats({
        responseRate:  data.responseRate  ?? 0,
        totalListings: data.totalListings ?? 0,
      }))
      .catch(() => {});
  }, []);

  // ── Save profile ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name?.trim()) { showToast('Name cannot be empty', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      const { user: updated } = await res.json();
      setProfile(updated);
      setForm({ name: updated.name ?? '', phone: updated.phone ?? '' });
      setIsEditing(false);
      showToast('Profile updated successfully');
      if (typeof refreshUser === 'function') refreshUser();
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar ────────────────────────────────────────────────────────────────────

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB', 'error'); return; }

    setAvatarUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/auth/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify({ avatar: base64 }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Upload failed');
      const { user: updated } = await res.json();
      setProfile((p) => ({ ...p, avatar: updated.avatar }));
      showToast('Profile photo updated');
      if (typeof refreshUser === 'function') refreshUser();
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  // ── ID Document ───────────────────────────────────────────────────────────────

  const handleDocChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) { showToast('Please upload a JPG, PNG, or PDF', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Document must be under 5MB', 'error'); return; }

    setDocUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/auth/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify({ id_document: base64 }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Upload failed');
      const { user: updated } = await res.json();
      setProfile((p) => ({ ...p, id_document: updated.id_document, id_document_status: 'pending' }));
      showToast('Document submitted for review');
    } catch (err) {
      showToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setDocUploading(false);
      e.target.value = '';
    }
  };

  // ── Password ──────────────────────────────────────────────────────────────────

  const handlePasswordSave = async () => {
    setPwError('');
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) { setPwError('All fields are required'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match'); return; }
    if (pwForm.next.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed');
      setPwForm({ current: '', next: '', confirm: '' });
      setShowPwForm(false);
      showToast('Password updated successfully');
    } catch (err) {
      setPwError(err.message || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const docStatus = profile?.id_document_status ?? 'none';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-500 mt-1">Manage your information and verification documents</p>
        </div>
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          <PencilIcon className="w-5 h-5" />
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left sidebar ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Avatar Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

            {/* Avatar with camera overlay */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-4 border-white shadow-md">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary">{initials}</span>
                )}
              </div>
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition disabled:opacity-50"
                title="Change photo"
              >
                {avatarUploading
                  ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  : <CameraIcon className="w-4 h-4" />}
              </button>
            </div>

            <h2 className="text-xl font-bold">{profile?.name || '—'}</h2>

            {profile?.verified ? (
              <div className="flex items-center justify-center gap-1 text-blue-600 mt-1">
                <CheckBadgeIcon className="w-4 h-4" />
                <span className="text-sm">Verified Landlord</span>
              </div>
            ) : (
              <p className="text-sm text-amber-500 mt-1">Unverified</p>
            )}

            <p className="text-sm text-slate-500 mt-2">Member since {memberSince}</p>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Response Rate</span>
                <span className="font-bold text-primary">{stats.responseRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${stats.responseRate}%` }} />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Listings</span>
                <span className="font-bold text-slate-900">{stats.totalListings}</span>
              </div>
            </div>

            <button
              onClick={() => avatarRef.current?.click()}
              disabled={avatarUploading}
              className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-2 text-slate-600 disabled:opacity-50 transition"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              {avatarUploading ? 'Uploading…' : 'Change Photo'}
            </button>
            <p className="text-xs text-slate-400 mt-1.5">JPG, PNG, WebP • Max 2MB</p>
          </div>

          {/* Verification checklist */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-4">Verification Status</h3>
            <div className="space-y-3">
              {[
                {
                  Icon:     IdentificationIcon,
                  label:    'Identity Document',
                  done:     docStatus === 'verified',
                  note:     { none: 'Not submitted', pending: 'Under review', verified: 'Verified', rejected: 'Rejected' }[docStatus],
                  action:   docStatus !== 'verified' ? () => docRef.current?.click() : null,
                  actLabel: docStatus === 'none' ? 'Upload' : docStatus === 'rejected' ? 'Re-upload' : null,
                },
                {
                  Icon:  EnvelopeIcon,
                  label: 'Email Address',
                  done:  !!profile?.verified,
                  note:  profile?.verified ? 'Verified' : 'Pending',
                },
                {
                  Icon:  PhoneIcon,
                  label: 'Phone Number',
                  done:  !!profile?.phone,
                  note:  profile?.phone ? 'On file' : 'Not provided',
                },
              ].map(({ Icon, label, done, note, action, actLabel }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${done ? 'bg-green-100' : 'bg-amber-100'}`}>
                      <Icon className={`w-4 h-4 ${done ? 'text-green-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-xs">{label}</p>
                      <p className={`text-xs ${done ? 'text-green-600' : 'text-amber-600'}`}>{note}</p>
                    </div>
                  </div>
                  {action && actLabel && (
                    <button onClick={action} className="text-primary text-xs font-bold hover:underline">{actLabel}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: main content ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Information */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                {isEditing ? (
                  <input type="text" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                ) : (
                  <p className="text-lg font-medium">{profile?.name || '—'}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <p className="text-lg font-medium">{profile?.email || '—'}</p>
                <p className="text-xs text-slate-400">Email cannot be changed</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                {isEditing ? (
                  <input type="tel" value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+267 7XXXXXXX"
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                ) : (
                  <p className="text-lg font-medium">{profile?.phone || '—'}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                <p className="text-lg font-medium capitalize">{profile?.role || '—'}</p>
              </div>
            </div>
          </div>

          {/* ID Document */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold">Identity Document</h3>
                <p className="text-sm text-slate-500 mt-0.5">Omang or Passport required for account verification</p>
              </div>
              <DocStatusBadge status={docStatus} />
            </div>

            {/* Alert banners */}
            {docStatus === 'pending' && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <ClockIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">Document submitted — under review (1–2 business days).</p>
              </div>
            )}
            {docStatus === 'verified' && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <ShieldSolid className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">Identity verified. Your listings are marked as trusted.</p>
              </div>
            )}
            {docStatus === 'rejected' && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">Document rejected. Please upload a clearer image of your ID.</p>
              </div>
            )}

            <input ref={docRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden" onChange={handleDocChange} />

            {profile?.id_document ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {profile.id_document.startsWith('data:image') ? (
                  <div className="relative bg-slate-50">
                    <img
                      src={profile.id_document}
                      alt="ID Document"
                      className={`w-full object-contain transition-all ${showDocPreview ? 'max-h-96' : 'max-h-48'}`}
                    />
                    <button onClick={() => setShowDocPreview((v) => !v)}
                      className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">
                      {showDocPreview ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-slate-50">
                    <DocumentTextIcon className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">PDF Document uploaded</p>
                      <p className="text-xs text-slate-500">Click below to replace</p>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {docStatus === 'verified' ? 'Verified ✓' : 'Uploaded — awaiting review'}
                  </p>
                  <button onClick={() => docRef.current?.click()} disabled={docUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 transition disabled:opacity-50">
                    {docUploading ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpTrayIcon className="w-3.5 h-3.5" />}
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => docRef.current?.click()} disabled={docUploading}
                className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50">
                {docUploading
                  ? <ArrowPathIcon className="w-8 h-8 text-primary animate-spin" />
                  : <IdentificationIcon className="w-10 h-10 text-slate-300" />}
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {docUploading ? 'Uploading…' : 'Upload Identity Document'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Omang, Passport • JPG, PNG, PDF • Max 5MB</p>
                </div>
              </button>
            )}
          </div>

          {/* Password */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Account Security</h3>
              <button
                onClick={() => { setShowPwForm((v) => !v); setPwError(''); }}
                className="px-4 py-1.5 border border-primary/20 rounded-lg text-primary text-sm font-bold hover:bg-primary/5 transition"
              >
                {showPwForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPwForm ? (
              <div className="space-y-4">
                {pwError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" /> {pwError}
                  </p>
                )}
                {[
                  { label: 'Current Password', key: 'current' },
                  { label: 'New Password',      key: 'next'    },
                  { label: 'Confirm New',        key: 'confirm' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                    <input type="password" value={pwForm[key]}
                      onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                ))}
                <button onClick={handlePasswordSave} disabled={pwSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition disabled:opacity-60">
                  {pwSaving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                  Update Password
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">Password</p>
                  <p className="text-xs text-slate-500">Use a strong, unique password</p>
                </div>
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}