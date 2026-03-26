// app/landlord/profile/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  CheckBadgeIcon,
  PencilIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

export default function LandlordProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ responseRate: 0, totalListings: 0 });
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Fetch stats for response rate
  useEffect(() => {
    fetch('/api/landlord/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setStats({
        responseRate: data.responseRate ?? 0,
        totalListings: data.totalListings ?? 0,
      }))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/me/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Profile updated successfully.');
        setIsEditing(false);
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          <PencilIcon className="w-5 h-5" />
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
            {/* Avatar — initials fallback since we don't have image upload yet */}
            <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">{initials}</span>
            </div>

            <h2 className="text-xl font-bold">{user?.name || '—'}</h2>

            {user?.verified ? (
              <div className="flex items-center justify-center gap-1 text-blue-600 mt-1">
                <CheckBadgeIcon className="w-4 h-4" />
                <span className="text-sm">Verified Landlord</span>
              </div>
            ) : (
              <p className="text-sm text-amber-500 mt-1">Unverified</p>
            )}

            <p className="text-sm text-slate-500 mt-2">Member since {memberSince}</p>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Response Rate</span>
                <span className="font-bold text-primary">{stats.responseRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${stats.responseRate}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Listings</span>
                <span className="font-bold text-slate-900">{stats.totalListings}</span>
              </div>
            </div>

            <button className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-2 text-slate-600">
              <ArrowUpTrayIcon className="w-4 h-4" />
              Change Photo
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold mb-6">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                ) : (
                  <p className="text-lg font-medium">{user?.name || '—'}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                {/* Email not editable — used for auth */}
                <p className="text-lg font-medium">{user?.email || '—'}</p>
                <p className="text-xs text-slate-400">Email cannot be changed</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+267 7XXXXXXX"
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                ) : (
                  <p className="text-lg font-medium">{user?.phone || '—'}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                <p className="text-lg font-medium capitalize">{user?.role || '—'}</p>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold mb-4">Account Security</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-900">Password</p>
                <p className="text-xs text-slate-500">Last changed: unknown</p>
              </div>
              <button className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}