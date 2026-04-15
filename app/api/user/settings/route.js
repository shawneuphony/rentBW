import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = await getDb();
    const row = await db.get('SELECT preferences FROM user_settings WHERE user_id = ?', user.id);
    const defaults = {
      notifications: { email: true, push: true, sms: false, marketing: false },
      privacy: { showProfile: true, showApplications: false },
      language: 'English',
      theme: 'light',
    };
    if (!row) return NextResponse.json(defaults);
    return NextResponse.json({ ...defaults, ...JSON.parse(row.preferences) });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const db = await getDb();
    await db.run(
      `INSERT INTO user_settings (user_id, preferences, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET preferences = ?, updated_at = ?`,
      [user.id, JSON.stringify(body), Date.now(), JSON.stringify(body), Date.now()]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}