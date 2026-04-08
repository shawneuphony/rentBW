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

    const sort  = searchParams.get('sort');
    const limit = searchParams.get('limit');

    if (sort === 'trending') {
      query += ' ORDER BY views DESC, created_at DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    if (limit) {
      query += ` LIMIT ${Math.min(Math.abs(parseInt(limit, 10)) || 6, 50)}`;
    }

    const rawProperties = await db.all(query, params);

    // Parse JSON fields so clients get arrays, not strings
    const properties = rawProperties.map(p => ({
      ...p,
      images: (() => {
        if (Array.isArray(p.images)) return p.images;
        try { const a = JSON.parse(p.images); return Array.isArray(a) ? a : []; } catch { return []; }
      })(),
      amenities: (() => {
        if (Array.isArray(p.amenities)) return p.amenities;
        try { const a = JSON.parse(p.amenities); return Array.isArray(a) ? a : []; } catch { return []; }
      })(),
    }));

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

    // Fix #4 — enforce ID approval on the server side too
    if (user.role === 'landlord' && user.id_document_status !== 'approved') {
      return NextResponse.json(
        { error: 'Your identification must be approved before you can add listings.' },
        { status: 403 }
      );
    }

    const db   = await getDb();
    const body = await request.json();
    const { title, description, price, location, beds, baths, sqm, type, amenities, images, lease_url } = body;

    if (!title || !price || !location) {
      return NextResponse.json({ error: 'Title, price and location are required' }, { status: 400 });
    }

    // Fix #5 — require lease document on the server side too
    if (!lease_url) {
      return NextResponse.json({ error: 'A lease agreement document is required.' }, { status: 400 });
    }

    const id  = randomUUID();
    const now = Date.now();

    await db.run(
      `INSERT INTO properties
         (id, title, description, price, location, beds, baths, sqm, type,
          status, images, amenities, lease_url, landlord_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
      [
        id, title, description || '', price, location,
        beds || 0, baths || 0, sqm || 0, type || 'apartment',
        JSON.stringify(images    || []),
        JSON.stringify(amenities || []),
        lease_url || '',
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