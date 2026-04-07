// app/api/landlord/properties/[id]/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

// GET: property detail + its applications
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const property = await db.get(
      'SELECT * FROM properties WHERE id = ? AND landlord_id = ?', [id, user.id]
    );
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const applications = await db.all(
      `SELECT a.*, u.name as tenant_name, u.email as tenant_email
       FROM applications a
       JOIN users u ON a.tenant_id = u.id
       WHERE a.property_id = ?
       ORDER BY a.created_at DESC`,
      id
    );

    return NextResponse.json({ property, applications });
  } catch (err) {
    console.error('Landlord property GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: update full property details (used by edit listing page)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const property = await db.get(
      'SELECT id FROM properties WHERE id = ? AND landlord_id = ?', [id, user.id]
    );
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json();
    const { title, description, location, price, beds, baths, sqm, type, amenities, images } = body;

    if (!title || !location || price == null) {
      return NextResponse.json({ error: 'title, location and price are required' }, { status: 400 });
    }

    await db.run(
      `UPDATE properties
       SET title = ?, description = ?, location = ?, price = ?,
           beds = ?, baths = ?, sqm = ?, type = ?,
           amenities = ?, images = ?,
           status = 'pending', updated_at = ?
       WHERE id = ?`,
      [
        title,
        description ?? '',
        location,
        Number(price),
        Number(beds)  || 0,
        Number(baths) || 0,
        Number(sqm)   || 0,
        type          || 'apartment',
        JSON.stringify(amenities ?? []),
        JSON.stringify(images    ?? []),
        Date.now(),
        id,
      ]
    );

    return NextResponse.json({ updated: true });
  } catch (err) {
    console.error('Landlord property PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: update property status OR update an application status
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const property = await db.get(
      'SELECT id FROM properties WHERE id = ? AND landlord_id = ?', [id, user.id]
    );
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json();

    // Update application status
    if (body.application_id) {
      if (!['approved', 'rejected', 'pending'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      await db.run(
        'UPDATE applications SET status = ?, updated_at = ? WHERE id = ? AND property_id = ?',
        [body.status, Date.now(), body.application_id, id]
      );
      return NextResponse.json({ updated: true });
    }

    // Update property status
    const allowed = ['active', 'pending', 'rejected', 'rented', 'inactive'];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    await db.run(
      'UPDATE properties SET status = ?, updated_at = ? WHERE id = ?',
      [body.status, Date.now(), id]
    );
    return NextResponse.json({ updated: true });
  } catch (err) {
    console.error('Landlord property PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: remove a property
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const property = await db.get(
      'SELECT id FROM properties WHERE id = ? AND landlord_id = ?', [id, user.id]
    );
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Clean up related records first
    await db.run('DELETE FROM saved_properties WHERE property_id = ?', id);
    await db.run('DELETE FROM property_views WHERE property_id = ?', id);
    await db.run('DELETE FROM applications WHERE property_id = ?', id);
    await db.run('DELETE FROM messages WHERE property_id = ?', id);
    await db.run('DELETE FROM properties WHERE id = ?', id);

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('Landlord property DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}