// app/api/tenant/settings/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

// Default settings shape
const DEFAULT_SETTINGS = {
  notifications: {
    email:       true,
    push:        true,
    sms:         false,
    marketing:   false,
  },
  privacy: {
    showProfile:      true,
    showApplications: false,
  },
  language: 'English',
  theme:    'light',
};

function safeJson(val, fallback) {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

// GET /api/tenant/settings
export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db  = await getDb();
    const row = await db.get('SELECT settings FROM users WHERE id = ?', user.id);

    const settings = safeJson(row?.settings, DEFAULT_SETTINGS);

    // Merge with defaults so new keys always exist
    const merged = {
      notifications: { ...DEFAULT_SETTINGS.notifications, ...settings?.notifications },
      privacy:       { ...DEFAULT_SETTINGS.privacy,       ...settings?.privacy },
      language:      settings?.language ?? DEFAULT_SETTINGS.language,
      theme:         settings?.theme    ?? DEFAULT_SETTINGS.theme,
    };

    return NextResponse.json({ settings: merged });
  } catch (err) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tenant/settings  (partial update — send only the keys you want to change)
export async function PATCH(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db   = await getDb();
    const body = await request.json();

    // Load existing settings
    const row      = await db.get('SELECT settings FROM users WHERE id = ?', user.id);
    const existing = safeJson(row?.settings, DEFAULT_SETTINGS);

    // Deep merge: only the keys sent in the body are updated
    const updated = {
      notifications: { ...existing.notifications, ...(body.notifications ?? {}) },
      privacy:       { ...existing.privacy,       ...(body.privacy       ?? {}) },
      language:      body.language ?? existing.language ?? DEFAULT_SETTINGS.language,
      theme:         body.theme    ?? existing.theme    ?? DEFAULT_SETTINGS.theme,
    };

    // FIX 2b: The lazy try/catch that added the column on first PATCH is removed.
    // users.settings is now guaranteed to exist at DB init (see db.js fix), so
    // this write is unconditional and any real SQL error will surface properly.
    await db.run(
      'UPDATE users SET settings = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(updated), Date.now(), user.id]
    );

    return NextResponse.json({ settings: updated });
  } catch (err) {
    console.error('Settings PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}