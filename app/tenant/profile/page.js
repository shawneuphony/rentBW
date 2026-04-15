// app/tenant/profile/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  CheckBadgeIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CameraIcon,
  DocumentTextIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, ShieldCheckIcon as ShieldSolid } from '@heroicons/react/24/solid';

function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
      toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {toast.message}
    </div>
  );
}

function DocStatusBadge({ status }) {
  const map = {
    none: { label: 'Not uploaded', cls: 'bg-slate-100 text-slate-500', Icon: DocumentTextIcon },
    pending: { label: 'Under review', cls: 'bg-amber-100 text-amber-700', Icon: ClockIcon },
    verified: { label: 'Verified', cls: 'bg-green-100 text-green-700', Icon: ShieldSolid },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', Icon: XCircleIcon },
  };
  const { label, cls, Icon } = map[status] ?? map.none;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

export default function TenantProfile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const avatarRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const docRef = useRef(null);
  const [docUploading, setDocUploading] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error();
        const data = await res.json();
        const u = data.user ?? data;
        setProfile(u);
        setForm({ name: u.name ?? '', phone: u.phone ?? '' });
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  const handleSave = async () => {
    if (!form.name?.trim()) { showToastMsg('Name cannot be empty', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() }),
      });
      if (!res.ok) throw new Error();
      const { user: updated } = await res.json();
      setProfile(updated);
      setForm({ name: updated.name ?? '', phone: updated.phone ?? '' });
      setEditing(false);
      showToastMsg('Profile updated');
      if (refreshUser) refreshUser();
    } catch {
      showToastMsg('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToastMsg('Please select an image', 'error'); return; }
    if (file.size > 2 * 1024 * 1024) { showToastMsg('Image must be under 2MB', 'error'); return; }
    setAvatarUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: base64 }),
      });
      if (!res.ok) throw new Error();
      const { user: updated } = await res.json();
      setProfile(p => ({ ...p, avatar: updated.avatar }));
      showToastMsg('Photo updated');
      if (refreshUser) refreshUser();
    } catch {
      showToastMsg('Upload failed', 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDocChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) { showToastMsg('Please upload JPG, PNG or PDF', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToastMsg('Document must be under 5MB', 'error'); return; }
    setDocUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_document: base64 }),
      });
      if (!res.ok) throw new Error();
      const { user: updated } = await res.json();
      setProfile(p => ({ ...p, id_document: updated.id_document, id_document_status: 'pending' }));
      showToastMsg('Document submitted for review');
    } catch {
      showToastMsg('Upload failed', 'error');
    } finally {
      setDocUploading(false);
    }
  };

  const handlePasswordSave = async () => {
    setPwError('');
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) { setPwError('All fields required'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.next.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      if (!res.ok) throw new Error();
      setPwForm({ current: '', next: '', confirm: '' });
      setShowPwForm(false);
      showToastMsg('Password updated');
    } catch (err) {
      setPwError(err.message || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Failed to load profile</h3>
        <p className="text-text-muted mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary px-6 py-2">Retry</button>
      </div>
    );
  }

  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : null;
  const docStatus = profile?.id_document_status ?? 'none';

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">My Profile</h1>
          <p className="text-text-muted mt-1">Manage your personal information and documents</p>
        </div>
        <button
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
        >
          <PencilIcon className="w-4 h-4" />
          {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl p-6 border border-border-light">
            <h3 className="text-xl font-bold font-display mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                {editing ? (
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-1 focus:ring-accent" />
                ) : (
                  <p className="text-lg font-medium mt-1">{profile?.name}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email</label>
                <p className="text-lg font-medium mt-1">{profile?.email}</p>
                <p className="text-xs text-text-muted">Email cannot be changed</p>
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Phone</label>
                {editing ? (
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+267 7XXXXXXX" className="mt-1 w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-1 focus:ring-accent" />
                ) : (
                  <p className="text-lg font-medium mt-1">{profile?.phone || '—'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Account Type</label>
                <p className="text-lg font-medium mt-1 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>

          {/* ID Document */}
          <div className="bg-white rounded-2xl p-6 border border-border-light">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold font-display">Identity Document</h3>
                <p className="text-sm text-text-muted">Upload your Omang or Passport</p>
              </div>
              <DocStatusBadge status={docStatus} />
            </div>
            {docStatus === 'pending' && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl mb-4">
                <ClockIcon className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-800">Document submitted — under review (1–2 business days).</p>
              </div>
            )}
            {docStatus === 'verified' && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl mb-4">
                <ShieldSolid className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">Identity verified. You have full access.</p>
              </div>
            )}
            {docStatus === 'rejected' && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl mb-4">
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">Document rejected. Please upload a clearer copy.</p>
              </div>
            )}
            <input ref={docRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleDocChange} />
            {profile?.id_document ? (
              <div className="border border-border-light rounded-xl overflow-hidden">
                {profile.id_document.startsWith('data:image') ? (
                  <div className="relative">
                    <img src={profile.id_document} alt="ID" className={`w-full object-contain ${showDocPreview ? 'max-h-96' : 'max-h-48'} transition-all`} />
                    <button onClick={() => setShowDocPreview(v => !v)} className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">Expand</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-surface">
                    <DocumentTextIcon className="w-8 h-8 text-accent" />
                    <div><p className="text-sm font-medium">PDF Document uploaded</p><p className="text-xs text-text-muted">Click below to replace</p></div>
                  </div>
                )}
                <div className="p-3 border-t border-border-light flex justify-between items-center">
                  <p className="text-xs text-text-muted">{docStatus === 'verified' ? 'Verified' : 'Uploaded — awaiting review'}</p>
                  <button onClick={() => docRef.current?.click()} disabled={docUploading} className="flex items-center gap-1.5 px-3 py-1.5 border border-border-light rounded-lg text-xs font-medium hover:bg-surface transition">
                    {docUploading ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpTrayIcon className="w-3.5 h-3.5" />}
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => docRef.current?.click()} disabled={docUploading} className="w-full flex flex-col items-center gap-3 p-8 border-2 border-dashed border-border-light rounded-xl hover:border-accent/40 hover:bg-accent/5 transition">
                {docUploading ? <ArrowPathIcon className="w-8 h-8 text-accent animate-spin" /> : <IdentificationIcon className="w-10 h-10 text-text-muted/50" />}
                <div className="text-center">
                  <p className="text-sm font-semibold">{docUploading ? 'Uploading...' : 'Upload Identity Document'}</p>
                  <p className="text-xs text-text-muted mt-1">Omang, Passport • JPG, PNG, PDF • Max 5MB</p>
                </div>
              </button>
            )}
          </div>

          {/* Password */}
          <div className="bg-white rounded-2xl p-6 border border-border-light">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold font-display">Account Security</h3>
              <button onClick={() => { setShowPwForm(v => !v); setPwError(''); }} className="px-4 py-1.5 border border-accent/20 rounded-full text-accent text-sm font-medium hover:bg-accent/5 transition">
                {showPwForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showPwForm ? (
              <div className="space-y-4">
                {pwError && <p className="text-sm text-red-500">{pwError}</p>}
                <div><label className="text-xs font-bold text-text-muted uppercase">Current Password</label><input type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} className="mt-1 w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-1 focus:ring-accent" /></div>
                <div><label className="text-xs font-bold text-text-muted uppercase">New Password</label><input type="password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} className="mt-1 w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-1 focus:ring-accent" /></div>
                <div><label className="text-xs font-bold text-text-muted uppercase">Confirm New</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} className="mt-1 w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-1 focus:ring-accent" /></div>
                <button onClick={handlePasswordSave} disabled={pwSaving} className="btn-primary px-5 py-2 text-sm">Update Password</button>
              </div>
            ) : (
              <p className="text-sm text-text-muted">Keep your account secure with a strong password.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border-light text-center">
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="relative w-28 h-28 mx-auto mb-4">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-accent/10 flex items-center justify-center border-4 border-white shadow-md">
                {profile?.avatar ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-accent">{(profile?.name ?? 'T').charAt(0).toUpperCase()}</span>}
              </div>
              <button onClick={() => avatarRef.current?.click()} disabled={avatarUploading} className="absolute bottom-0 right-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:bg-accent-dark transition">
                {avatarUploading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CameraIcon className="w-4 h-4" />}
              </button>
            </div>
            <h3 className="font-bold text-lg">{profile?.name}</h3>
            <p className="text-sm text-text-muted capitalize mb-1">{profile?.role}</p>
            {memberSince && <p className="text-xs text-text-muted mb-4">Member since {memberSince}</p>}
            <button onClick={() => avatarRef.current?.click()} className="w-full py-2 border border-border-light rounded-full text-sm font-medium hover:bg-surface transition">Change Photo</button>
            <p className="text-xs text-text-muted mt-2">JPG, PNG, WebP • Max 2MB</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-border-light">
            <h3 className="font-bold mb-4">Account Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border-light"><span className="text-sm text-text-muted">Account Status</span><span className={`text-sm font-medium ${profile?.verified ? 'text-green-600' : 'text-amber-600'}`}>{profile?.verified ? 'Verified' : 'Unverified'}</span></div>
              <div className="flex justify-between py-2 border-b border-border-light"><span className="text-sm text-text-muted">ID Verification</span><span className="text-sm font-medium">{docStatus === 'verified' ? 'Verified' : docStatus === 'pending' ? 'Under review' : 'Not submitted'}</span></div>
              <div className="flex justify-between py-2 border-b border-border-light"><span className="text-sm text-text-muted">Role</span><span className="text-sm font-medium capitalize">{profile?.role}</span></div>
              <div className="flex justify-between py-2"><span className="text-sm text-text-muted">Email</span><span className="text-sm font-medium">{profile?.email}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-red-100">
            <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
            <p className="text-xs text-text-muted mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
            <button onClick={() => showToastMsg('Please contact support to delete your account', 'error')} className="w-full py-2 border border-red-200 text-red-600 rounded-full text-sm font-bold hover:bg-red-50 transition">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}