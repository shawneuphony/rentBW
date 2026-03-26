// app/api/auth/me/update/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function PATCH(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const body = await request.json();

    const allowed = ['name', 'phone'];
    const fields = [];
    const values = [];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (!fields.length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    fields.push('updated_at = ?');
    values.push(Date.now(), user.id);

    await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = await db.get(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?', user.id
    );

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}