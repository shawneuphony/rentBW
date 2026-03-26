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
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all ${
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

// ── Field component (view / edit) ──────────────────────────────────────────────

function Field({ label, value, name, type = 'text', editing, onChange }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {editing ? (
        <input
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
      ) : (
        <p className="text-slate-900 font-medium mt-1">{value || <span className="text-slate-400 italic">Not set</span>}</p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TenantProfile() {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState(null);
  const [editing, setEditing]   = useState(false);
  const [profile, setProfile]   = useState(null);
  const [form,    setForm]      = useState({});
  const [toast,   setToast]     = useState({ show: false, message: '', type: 'success' });

  // Password change state
  const [showPwForm,   setShowPwForm]   = useState(false);
  const [pwForm,       setPwForm]       = useState({ current: '', next: '', confirm: '' });
  const [pwSaving,     setPwSaving]     = useState(false);
  const [pwError,      setPwError]      = useState('');

  const fileRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // ── Fetch profile ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch('/api/auth/me');
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        const u    = data.user ?? data;
        setProfile(u);
        setForm({ name: u.name ?? '', phone: u.phone ?? '' });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  // ── Save profile ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name?.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      const data = await res.json();
      const updated = data.user ?? data;
      setProfile(updated);
      setForm({ name: updated.name ?? '', phone: updated.phone ?? '' });
      setEditing(false);
      showToast('Profile updated successfully');
      if (typeof refreshUser === 'function') refreshUser();
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: profile?.name ?? '', phone: profile?.phone ?? '' });
    setEditing(false);
  };

  // ── Password change ────────────────────────────────────────────────────────

  const handlePasswordSave = async () => {
    setPwError('');
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError('All fields are required');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      setPwForm({ current: '', next: '', confirm: '' });
      setShowPwForm(false);
      showToast('Password updated successfully');
    } catch (err) {
      setPwError(err.message || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────

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

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-2">Failed to load profile</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your personal information</p>
        </div>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-5 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
              >
                {saving
                  ? <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  : <CheckCircleIcon className="w-5 h-5" />}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              <PencilIcon className="w-5 h-5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: main info ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Information */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold mb-6">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Full Name"
                name="name"
                value={editing ? form.name : profile?.name}
                editing={editing}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />

              {/* Email — never editable directly */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-900 font-medium">{profile?.email}</p>
                  {profile?.verified ? (
                    <CheckBadgeIcon className="w-4 h-4 text-green-500" title="Verified" />
                  ) : null}
                </div>
                {editing && (
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed here</p>
                )}
              </div>

              <Field
                label="Phone Number"
                name="phone"
                value={editing ? form.phone : profile?.phone}
                editing={editing}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />

              {/* Role — read only */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Type</label>
                <p className="text-slate-900 font-medium mt-1 capitalize">{profile?.role ?? 'Tenant'}</p>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold mb-6">Verification Status</h3>

            <div className="space-y-4">
              {[
                {
                  icon:  IdentificationIcon,
                  label: 'Identity Document (Omang)',
                  done:  !!profile?.verified,
                  note:  profile?.verified ? 'Verified' : 'Not submitted',
                  action: profile?.verified ? 'View' : 'Upload',
                },
                {
                  icon:  EnvelopeIcon,
                  label: 'Email Address',
                  done:  !!profile?.verified,
                  note:  profile?.verified ? 'Verified' : 'Pending verification',
                  action: null,
                },
                {
                  icon:  PhoneIcon,
                  label: 'Phone Number',
                  done:  !!profile?.phone,
                  note:  profile?.phone ? 'On file' : 'Not provided',
                  action: null,
                },
              ].map(({ icon: Icon, label, done, note, action }) => (
                <div key={label} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${done ? 'bg-green-100' : 'bg-amber-100'}`}>
                      <Icon className={`w-5 h-5 ${done ? 'text-green-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className={`text-xs ${done ? 'text-green-600' : 'text-amber-600'}`}>{note}</p>
                    </div>
                  </div>
                  {action && (
                    <button className="text-primary text-xs font-bold hover:underline">{action}</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Password</h3>
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
                  { label: 'New Password',     key: 'next'    },
                  { label: 'Confirm New',       key: 'confirm' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                    <input
                      type="password"
                      value={pwForm[key]}
                      onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                ))}
                <button
                  onClick={handlePasswordSave}
                  disabled={pwSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {pwSaving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                  Update Password
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Keep your account secure with a strong password.</p>
            )}
          </div>
        </div>

        {/* ── Right: sidebar ────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Avatar card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-primary/10 flex items-center justify-center">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {(profile?.name ?? 'T').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg">{profile?.name}</h3>
            <p className="text-sm text-slate-500 mb-1 capitalize">{profile?.role ?? 'Tenant'}</p>
            {memberSince && (
              <p className="text-xs text-slate-400 mb-4">Member since {memberSince}</p>
            )}

            {/* Hidden file input */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => showToast('Photo upload coming soon', 'error')} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Change Photo
            </button>
          </div>

          {/* Account summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-4">Account Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Account Status', value: profile?.verified ? 'Verified' : 'Unverified', positive: !!profile?.verified },
                { label: 'Role',           value: profile?.role ?? 'tenant',                      positive: true },
                { label: 'Email',          value: profile?.email ?? '—',                           positive: true },
              ].map(({ label, value, positive }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className={`text-sm font-medium capitalize ${positive ? 'text-slate-900' : 'text-amber-600'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white p-6 rounded-xl border border-red-100">
            <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
            <p className="text-xs text-slate-500 mb-4">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button
              onClick={() => showToast('Please contact support to delete your account', 'error')}
              className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition"
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}