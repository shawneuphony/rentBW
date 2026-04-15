'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  GlobeAltIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

export default function SettingsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: { email: true, push: true, sms: false, marketing: false },
    privacy: { showProfile: true, showApplications: false },
    language: 'English',
    theme: 'light'
  });

  useEffect(() => {
    if (user) {
      fetch('/api/user/settings')
        .then(res => res.json())
        .then(data => setSettings(prev => ({ ...prev, ...data })))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const updateSetting = async (path, value) => {
    const newSettings = { ...settings };
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      newSettings[parent][child] = value;
    } else {
      newSettings[path] = value;
    }
    setSettings(newSettings);
    setSaving(true);
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-display">Settings</h1>
      {saving && <div className="text-xs text-primary text-right">Saving...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-24">
            <nav className="space-y-1">
              <a href="#notifications" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl">
                <BellIcon className="w-5 h-5" />
                <span className="text-sm font-bold">Notifications</span>
              </a>
              <a href="#privacy" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition">
                <LockClosedIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Privacy</span>
              </a>
              <a href="#language" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition">
                <GlobeAltIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Language & Region</span>
              </a>
              <a href="#theme" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition">
                <MoonIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Appearance</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <section id="notifications" className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold font-display mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { key: 'email', icon: EnvelopeIcon, label: 'Email Notifications', desc: 'Receive updates and alerts' },
                { key: 'push', icon: BellIcon, label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
                { key: 'sms', icon: DevicePhoneMobileIcon, label: 'SMS Alerts', desc: 'Important updates via text message' }
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-400" />
                    <div><p className="font-medium">{label}</p><p className="text-xs text-slate-500">{desc}</p></div>
                  </div>
                  <button
                    onClick={() => updateSetting(`notifications.${key}`, !settings.notifications[key])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications[key] ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy */}
          <section id="privacy" className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold font-display mb-6">Privacy Settings</h2>
            <div className="flex items-center justify-between">
              <div><p className="font-medium">Profile Visibility</p><p className="text-xs text-slate-500">Allow others to see your profile information</p></div>
              <button onClick={() => updateSetting('privacy.showProfile', !settings.privacy.showProfile)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.privacy.showProfile ? 'bg-primary' : 'bg-slate-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.privacy.showProfile ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          {/* Language */}
          <section id="language" className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold font-display mb-6">Language & Region</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Language</label><select value={settings.language} onChange={e => updateSetting('language', e.target.value)} className="w-full md:w-64 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"><option>English</option><option>Setswana</option></select></div>
              <div><label className="block text-sm font-medium mb-2">Currency</label><select className="w-full md:w-64 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"><option>BWP - Botswana Pula</option><option>USD - US Dollar</option></select></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
