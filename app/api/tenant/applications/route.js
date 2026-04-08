// app/api/tenant/applications/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const applications = await db.all(
      `SELECT a.*, p.title as property_title, p.location, p.price
       FROM applications a
       JOIN properties p ON a.property_id = p.id
       WHERE a.tenant_id = ?
       ORDER BY a.created_at DESC`,
      user.id
    );
    return NextResponse.json({ applications });
  } catch (err) {
    console.error('Applications GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fix #3 — enforce ID approval server-side
    if (user.id_document_status !== 'approved') {
      return NextResponse.json(
        { error: 'Your identification must be approved before you can apply for properties.' },
        { status: 403 }
      );
    }

    const db = await getDb();
    const { property_id, notes, documents } = await request.json();

    if (!property_id) return NextResponse.json({ error: 'property_id is required' }, { status: 400 });

    const existing = await db.get(
      'SELECT id FROM applications WHERE tenant_id = ? AND property_id = ?',
      [user.id, property_id]
    );
    if (existing) return NextResponse.json({ error: 'Already applied' }, { status: 409 });

    const id = randomUUID();
    const now = Date.now();

    await db.run(
      `INSERT INTO applications (id, status, tenant_id, property_id, notes, documents, created_at, updated_at)
       VALUES (?, 'pending', ?, ?, ?, ?, ?, ?)`,
      [id, user.id, property_id, notes || '', JSON.stringify(documents || []), now, now]
    );

    const application = await db.get('SELECT * FROM applications WHERE id = ?', id);
    return NextResponse.json({ application }, { status: 201 });
  } catch (err) {
    console.error('Applications POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}