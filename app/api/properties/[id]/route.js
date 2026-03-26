// app/api/properties/[id]/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request, { params }) {
  try {
    const { id } = await params; // ← Next.js 15: params is a Promise
    const db = await getDb();
    const property = await db.get('SELECT * FROM properties WHERE id = ?', id);
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ property });
  } catch (err) {
    console.error('Property GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params; // ← awaited
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const property = await db.get('SELECT * FROM properties WHERE id = ?', id);
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (property.landlord_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const allowed = ['title', 'description', 'price', 'location', 'beds', 'baths', 'sqm', 'type', 'status', 'images', 'amenities'];
    const fields = [], values = [];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(['images', 'amenities'].includes(key) ? JSON.stringify(body[key]) : body[key]);
      }
    }

    if (!fields.length) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    fields.push('updated_at = ?');
    values.push(Date.now(), id);

    await db.run(`UPDATE properties SET ${fields.join(', ')} WHERE id = ?`, values);
    const updated = await db.get('SELECT * FROM properties WHERE id = ?', id);
    return NextResponse.json({ property: updated });
  } catch (err) {
    console.error('Property PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // ← awaited
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const property = await db.get('SELECT * FROM properties WHERE id = ?', id);
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (property.landlord_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.run('DELETE FROM properties WHERE id = ?', id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Property DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}