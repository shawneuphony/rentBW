// app/api/properties/[id]/save/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';
import { randomUUID } from 'crypto';

export async function POST(request, { params }) {
  try {
    const { id } = await params; // ← Next.js 15: await params
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const existing = await db.get(
      'SELECT * FROM saved_properties WHERE user_id = ? AND property_id = ?',
      [user.id, id]
    );

    if (existing) {
      await db.run(
        'DELETE FROM saved_properties WHERE user_id = ? AND property_id = ?',
        [user.id, id]
      );
      return NextResponse.json({ saved: false });
    }

    await db.run(
      'INSERT INTO saved_properties (id, user_id, property_id, created_at) VALUES (?, ?, ?, ?)',
      [randomUUID(), user.id, id, Date.now()]
    );
    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error('Save property error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // ← awaited
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    await db.run(
      'DELETE FROM saved_properties WHERE user_id = ? AND property_id = ?',
      [user.id, id]
    );
    return NextResponse.json({ saved: false });
  } catch (err) {
    console.error('Unsave property error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}