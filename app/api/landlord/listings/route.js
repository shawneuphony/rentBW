// app/api/landlord/listings/route.js
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

    const rows = await db.all(
      'SELECT * FROM properties WHERE landlord_id = ? ORDER BY created_at DESC',
      user.id
    );

    // Enrich each listing with views, inquiries, saves counts
    const listings = await Promise.all(rows.map(async (listing) => {
      const [views, inquiries, saves] = await Promise.all([
        db.get('SELECT COUNT(*) as count FROM property_views WHERE property_id = ?', listing.id),
        db.get('SELECT COUNT(*) as count FROM messages WHERE property_id = ?', listing.id),
        db.get('SELECT COUNT(*) as count FROM saved_properties WHERE property_id = ?', listing.id),
      ]);

      return {
        ...listing,
        images: safeParseJson(listing.images, []),
        amenities: safeParseJson(listing.amenities, []),
        views: views.count,
        inquiries: inquiries.count,
        saves: saves.count,
      };
    }));

    return NextResponse.json({ listings });
  } catch (err) {
    console.error('Landlord listings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function safeParseJson(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}