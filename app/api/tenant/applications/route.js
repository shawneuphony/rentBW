import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'tenant') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    // Bug 2 Fix: Added p.images, p.landlord_id, and joined users for landlord_name
    const applications = await db.all(`
      SELECT 
        a.*, 
        p.title as property_title, 
        p.location, 
        p.price, 
        p.images, 
        p.landlord_id,
        u.name as landlord_name
      FROM applications a
      JOIN properties p ON a.property_id = p.id
      LEFT JOIN users u ON p.landlord_id = u.id
      WHERE a.tenant_id = ?
      ORDER BY a.created_at DESC
    `, [user.id]);

    return NextResponse.json(applications);
  } catch (err) {
    console.error('Applications GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'tenant') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Bug 1 Logic: Check ID status
    if (user.id_document_status !== 'approved') {
      return NextResponse.json({ 
        error: 'Your ID must be approved before you can apply for properties.' 
      }, { status: 403 });
    }

    const db = await getDb();
    const body = await request.json();
    const { propertyId, notes, documents } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Prevent duplicate applications
    const existing = await db.get(
      'SELECT id FROM applications WHERE tenant_id = ? AND property_id = ?',
      [user.id, propertyId]
    );

    if (existing) {
      return NextResponse.json({ error: 'You have already applied for this property' }, { status: 409 });
    }

    const id = randomUUID();
    await db.run(`
      INSERT INTO applications (id, tenant_id, property_id, status, notes, documents, created_at)
      VALUES (?, ?, ?, 'pending', ?, ?, ?)
    `, [
      id, 
      user.id, 
      propertyId, 
      notes || '', 
      JSON.stringify(documents || []), 
      Date.now()
    ]);

    return NextResponse.json({ id, success: true });
  } catch (err) {
    console.error('Application POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}