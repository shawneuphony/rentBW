// app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';

export async function GET(request, { params }) {
  try {
    const db = await getDb();
    const user = await db.get(
      'SELECT id, name, role, verified, created_at FROM users WHERE id = ?',
      params.id
    );
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error('User GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}