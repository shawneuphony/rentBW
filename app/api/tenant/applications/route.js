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

    // Check if the user's ID document is approved (or if they're admin)
    // The column might be missing, so we'll check existence and default to false
    const db = await getDb();
    const freshUser = await db.get('SELECT id_document_status FROM users WHERE id = ?', user.id);
    const idStatus = freshUser?.id_document_status || 'none';
    
    if (user.role !== 'admin' && idStatus !== 'approved') {
      return NextResponse.json(
        { error: 'Your identification must be approved before you can apply for properties.' },
        { status: 403 }
      );
    }

    const { property_id, notes, documents } = await request.json();

    if (!property_id) {
      return NextResponse.json({ error: 'property_id is required' }, { status: 400 });
    }

    // Check if already applied
    const existing = await db.get(
      'SELECT id FROM applications WHERE tenant_id = ? AND property_id = ?',
      [user.id, property_id]
    );
    if (existing) {
      return NextResponse.json({ error: 'You have already applied for this property' }, { status: 409 });
    }

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
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}