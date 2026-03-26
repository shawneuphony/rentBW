// app/api/properties/[id]/saved/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Next.js 15: await params
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ saved: false });
    }

    const db = await getDb();
    const saved = await db.get(
      'SELECT id FROM saved_properties WHERE user_id = ? AND property_id = ?',
      [user.id, id]
    );

    return NextResponse.json({ saved: !!saved });
  } catch (err) {
    console.error('Saved GET error:', err);
    return NextResponse.json({ saved: false });
  }
}