// app/api/tenant/saved/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const properties = await db.all(
      `SELECT p.*, sp.created_at as saved_at
       FROM properties p
       JOIN saved_properties sp ON p.id = sp.property_id
       WHERE sp.user_id = ?
       ORDER BY sp.created_at DESC`,
      user.id
    );

    // Parse JSON fields and ensure id is always a string
    const parsed = properties.map((p) => ({
      ...p,
      id:        String(p.id),
      images:    safeJson(p.images,    []),
      amenities: safeJson(p.amenities, []),
    }));

    return NextResponse.json({ saved: parsed }); // ← was: { properties }
  } catch (err) {
    console.error('Tenant saved error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function safeJson(val, fallback) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
}