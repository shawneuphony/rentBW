// app/api/admin/properties/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

function safeJson(val, fallback) {
  try { return JSON.parse(val); } catch { return fallback; }
}

// GET: all properties with optional status/search filters
export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let query = `
      SELECT p.*, u.name as landlord_name, u.email as landlord_email
      FROM properties p
      LEFT JOIN users u ON p.landlord_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { query += ' AND p.status = ?';                          params.push(status); }
    if (search) { query += ' AND (p.title LIKE ? OR p.location LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY p.created_at DESC';

    const rows = await db.all(query, params);
    const properties = rows.map(p => ({
      ...p,
      images:    safeJson(p.images,    []),
      amenities: safeJson(p.amenities, []),
    }));

    return NextResponse.json({ properties });
  } catch (err) {
    console.error('Admin properties GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: approve | reject | feature | unfeature
export async function PATCH(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const { propertyId, action } = await request.json();

    if (!propertyId || !['approve', 'reject', 'feature', 'unfeature'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const property = await db.get('SELECT * FROM properties WHERE id = ?', propertyId);
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const now = Date.now();

    if (action === 'approve') {
      await db.run('UPDATE properties SET status = ?, updated_at = ? WHERE id = ?',   ['active',   now, propertyId]);
    } else if (action === 'reject') {
      await db.run('UPDATE properties SET status = ?, updated_at = ? WHERE id = ?',   ['rejected', now, propertyId]);
    } else if (action === 'feature') {
      await db.run('UPDATE properties SET featured = 1, updated_at = ? WHERE id = ?', [now, propertyId]);
    } else if (action === 'unfeature') {
      await db.run('UPDATE properties SET featured = 0, updated_at = ? WHERE id = ?', [now, propertyId]);
    }

    const updated = await db.get('SELECT * FROM properties WHERE id = ?', propertyId);
    return NextResponse.json({ property: updated });
  } catch (err) {
    console.error('Admin properties PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: remove property and all related data
export async function DELETE(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const { propertyId } = await request.json();

    if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 });

    await db.run('DELETE FROM saved_properties WHERE property_id = ?', propertyId);
    await db.run('DELETE FROM property_views   WHERE property_id = ?', propertyId);
    await db.run('DELETE FROM applications     WHERE property_id = ?', propertyId);
    await db.run('DELETE FROM messages         WHERE property_id = ?', propertyId);
    await db.run('DELETE FROM properties       WHERE id = ?',          propertyId);

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('Admin properties DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}