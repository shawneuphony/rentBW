// app/api/properties/[id]/view/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { randomUUID } from 'crypto';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    await db.run(
      'INSERT INTO property_views (id, property_id, created_at) VALUES (?, ?, ?)',
      [randomUUID(), id, Date.now()]
    );
    return NextResponse.json({ recorded: true });
  } catch (err) {
    console.error('View property error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}