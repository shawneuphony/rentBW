'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          setProfile(data.user);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden text-3xl font-bold text-white">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{profile?.name}</h1>
            <p className="text-slate-500 capitalize">System Administrator</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Admin Details</h3>
            <div className="flex items-center gap-3 text-slate-600">
              <EnvelopeIcon className="w-5 h-5" />
              <span>{profile?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <ShieldCheckIcon className="w-5 h-5 text-red-500" />
              <span>Superuser Permissions</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Security</h3>
            <div className="flex items-center gap-3 text-slate-600">
              <LockClosedIcon className="w-5 h-5 text-blue-500" />
              <span>Last login: 2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <ShieldCheckIcon className="w-5 h-5 text-green-500" />
              <span>Two-factor Auth: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
