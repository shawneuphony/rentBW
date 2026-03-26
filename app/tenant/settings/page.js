// app/tenant/settings/page.js
'use client';

import { useState } from 'react';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  LanguageIcon,
  MoonIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function TenantSettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      showProfile: true,
      showApplications: false
    },
    language: 'English',
    theme: 'light'
  });

  const handleNotificationChange = (key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
            <nav className="space-y-1">
              <a href="#notifications" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg">
                <BellIcon className="w-5 h-5" />
                <span className="text-sm font-bold">Notifications</span>
              </a>
              <a href="#privacy" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <LockClosedIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Privacy</span>
              </a>
              <a href="#language" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <GlobeAltIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Language & Region</span>
              </a>
              <a href="#theme" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <MoonIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Appearance</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications Section */}
          <section id="notifications" className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold mb-6">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-xs text-slate-500">Receive updates about your applications and messages</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.email ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-xs text-slate-500">Browser and mobile push notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('push')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.push ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium">SMS Alerts</p>
                    <p className="text-xs text-slate-500">Important updates via text message</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('sms')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.sms ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Privacy Section */}
          <section id="privacy" className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold mb-6">Privacy Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-xs text-slate-500">Allow landlords to see your profile when you apply</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, showProfile: !settings.privacy.showProfile }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.showProfile ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.showProfile ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Language Section */}
          <section id="language" className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold mb-6">Language & Region</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select className="w-full md:w-64 px-4 py-2 border border-slate-200 rounded-lg focus:ring-primary focus:border-primary">
                  <option>English</option>
                  <option>Setswana</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select className="w-full md:w-64 px-4 py-2 border border-slate-200 rounded-lg focus:ring-primary focus:border-primary">
                  <option>BWP - Botswana Pula</option>
                  <option>USD - US Dollar</option>
                  <option>ZAR - South African Rand</option>
                </select>
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section id="theme" className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold mb-6">Appearance</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-xs text-slate-500">Switch between light and dark theme</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    theme: settings.theme === 'light' ? 'dark' : 'light'
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.theme === 'dark' ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}