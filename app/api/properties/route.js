// app/api/properties/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const location = searchParams.get('location');
    const type     = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const beds     = searchParams.get('beds');

    let query = "SELECT * FROM properties WHERE status = 'active'";
    const params = [];

    if (location) { query += ' AND location LIKE ?';  params.push(`%${location}%`); }
    if (type)     { query += ' AND type = ?';          params.push(type); }
    if (minPrice) { query += ' AND price >= ?';        params.push(Number(minPrice)); }
    if (maxPrice) { query += ' AND price <= ?';        params.push(Number(maxPrice)); }
    if (beds)     { query += ' AND beds >= ?';         params.push(Number(beds)); }

    query += ' ORDER BY created_at DESC';

    const properties = await db.all(query, params);
    return NextResponse.json({ properties });
  } catch (err) {
    console.error('Properties GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'landlord' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db   = await getDb();
    const body = await request.json();
    const { title, description, price, location, beds, baths, sqm, type, amenities, images } = body;

    if (!title || !price || !location) {
      return NextResponse.json({ error: 'Title, price and location are required' }, { status: 400 });
    }

    const id  = randomUUID();
    const now = Date.now();

    // Always insert as 'pending' so admin must approve before going live
    await db.run(
      `INSERT INTO properties
         (id, title, description, price, location, beds, baths, sqm, type,
          status, images, amenities, landlord_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [
        id, title, description || '', price, location,
        beds || 0, baths || 0, sqm || 0, type || 'apartment',
        JSON.stringify(images    || []),
        JSON.stringify(amenities || []),
        user.id, now, now,
      ]
    );

    const property = await db.get('SELECT * FROM properties WHERE id = ?', id);
    return NextResponse.json({ property }, { status: 201 });
  } catch (err) {
    console.error('Properties POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}