// app/api/properties/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';
import { randomUUID } from 'crypto';

// Helper to safely parse JSON fields
function safeJsonParse(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const location = searchParams.get('location');
    const type     = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const beds     = searchParams.get('beds');
    const sort     = searchParams.get('sort');
    const limit    = searchParams.get('limit');

    let query = "SELECT * FROM properties WHERE status = 'active'";
    const params = [];

    if (location) { query += ' AND location LIKE ?';  params.push(`%${location}%`); }
    if (type && type !== 'all') { query += ' AND type = ?'; params.push(type); }
    if (minPrice) { query += ' AND price >= ?';        params.push(Number(minPrice)); }
    if (maxPrice) { query += ' AND price <= ?';        params.push(Number(maxPrice)); }
    if (beds && beds !== 'any') { query += ' AND beds >= ?'; params.push(Number(beds)); }

    // Sort order – removed 'views' because column doesn't exist
    if (sort === 'trending') {
      query += ' ORDER BY created_at DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    if (limit) {
      const limitNum = Math.min(Math.abs(parseInt(limit, 10)) || 6, 50);
      query += ` LIMIT ${limitNum}`;
    }

    const rawProperties = await db.all(query, params);

    // Parse JSON fields safely
    const properties = rawProperties.map(p => ({
      ...p,
      images: safeJsonParse(p.images, []),
      amenities: safeJsonParse(p.amenities, []),
    }));

    return NextResponse.json({ properties });
  } catch (err) {
    console.error('Properties GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'landlord' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check ID approval for landlords
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