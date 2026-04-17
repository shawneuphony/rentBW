// app/api/landlord/applications/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const propertyFilter = searchParams.get('propertyId');

    let query = `
      SELECT 
        a.*,
        p.title as property_title,
        p.location as property_location,
        p.price as property_price,
        u.name as tenant_name,
        u.email as tenant_email,
        u.phone as tenant_phone
      FROM applications a
      JOIN properties p ON a.property_id = p.id
      JOIN users u ON a.tenant_id = u.id
      WHERE p.landlord_id = ?
    `;
    const params = [user.id];

    if (statusFilter && statusFilter !== 'all') {
      query += ' AND a.status = ?';
      params.push(statusFilter);
    }
    if (propertyFilter) {
      query += ' AND a.property_id = ?';
      params.push(propertyFilter);
    }

    query += ' ORDER BY a.created_at DESC';

    const applications = await db.all(query, params);

    // Get property list for filter dropdown
    const properties = await db.all(
      'SELECT id, title FROM properties WHERE landlord_id = ? ORDER BY created_at DESC',
      user.id
    );

    return NextResponse.json({ applications, properties });
  } catch (err) {
    console.error('Landlord applications error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, status } = await request.json();

    if (!applicationId || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const db = await getDb();

    // Verify the application belongs to one of landlord's properties
    const app = await db.get(
      `SELECT a.*, p.landlord_id 
       FROM applications a
       JOIN properties p ON a.property_id = p.id
       WHERE a.id = ?`,
      applicationId
    );

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (app.landlord_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.run(
      'UPDATE applications SET status = ?, updated_at = ? WHERE id = ?',
      [status, Date.now(), applicationId]
    );

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error('Landlord application update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}