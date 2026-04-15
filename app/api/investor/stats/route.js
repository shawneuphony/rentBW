// app/api/investor/stats/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

// Gross yield = (annual rent / estimated capital value) * 100
// Botswana market convention: capital value ≈ monthly rent × 150 (approx 8% gross yield band)
const RENT_TO_VALUE = 150;

function grossYield(monthlyRent) {
  if (!monthlyRent) return 0;
  return parseFloat(((monthlyRent * 12) / (monthlyRent * RENT_TO_VALUE) * 100).toFixed(2));
}

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (user.role !== 'investor' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const db = await getDb();

    const [totalPropertiesRow, avgPriceRow, totalValueRow] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM properties WHERE status = "active"'),
      db.get('SELECT AVG(price) as avg FROM properties WHERE status = "active"'),
      db.get('SELECT SUM(price) as total FROM properties WHERE status = "active"'),
    ]);

    // Real average yield across all active listings
    const allPrices = await db.all('SELECT price FROM properties WHERE status = "active" AND price > 0');
    const avgYield = allPrices.length > 0
      ? parseFloat((allPrices.reduce((sum, r) => sum + grossYield(r.price), 0) / allPrices.length).toFixed(2))
      : 0;

    // District breakdown with real per-district yield
    const districts = await db.all(`
      SELECT
        location,
        COUNT(*) as count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM properties
      WHERE status = 'active'
      GROUP BY location
      ORDER BY count DESC
      LIMIT 5
    `);

    // Property type breakdown
    const propertyTypes = await db.all(`
      SELECT
        type,
        COUNT(*) as count,
        AVG(price) as avg_price
      FROM properties
      WHERE status = 'active'
      GROUP BY type
    `);

    // Monthly trends — last 6 months
    const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
    const monthlyTrends = await db.all(`
      SELECT
        strftime('%Y-%m', created_at/1000, 'unixepoch') as month,
        COUNT(*) as listings,
        AVG(price) as avg_price
      FROM properties
      WHERE created_at > ? AND status = 'active'
      GROUP BY month
      ORDER BY month ASC
      LIMIT 6
    `, [sixMonthsAgo]);

    // Top properties by engagement (saves + inquiries)
    const topProperties = await db.all(`
      SELECT
        p.*,
        u.name as landlord_name,
        (SELECT COUNT(*) FROM saved_properties WHERE property_id = p.id) as saves,
        (SELECT COUNT(*) FROM messages WHERE property_id = p.id) as inquiries
      FROM properties p
      JOIN users u ON p.landlord_id = u.id
      WHERE p.status = 'active'
      ORDER BY (
        (SELECT COUNT(*) FROM saved_properties WHERE property_id = p.id) +
        (SELECT COUNT(*) FROM messages WHERE property_id = p.id)
      ) DESC
      LIMIT 5
    `);

    const formattedTopProperties = topProperties.map(p => {
      let firstImage = null;
      try { firstImage = p.images ? JSON.parse(p.images)[0] : null; } catch {}
      return {
        id:         p.id,
        title:      p.title,
        price:      p.price,
        location:   p.location,
        type:       p.type,
        views:      p.views || 0,
        saves:      p.saves || 0,
        inquiries:  p.inquiries || 0,
        landlord:   p.landlord_name,
        grossYield: grossYield(p.price),
        image:      firstImage,
      };
    });

    return NextResponse.json({
      marketStats: {
        totalProperties: totalPropertiesRow.count || 0,
        avgPrice:        Math.round(avgPriceRow?.avg || 0),
        totalValue:      Math.round(totalValueRow?.total || 0),
        avgYield,
      },
      districts: districts.map(d => ({
        name:     d.location ? d.location.split(',')[0].trim() : 'Unknown',
        count:    d.count,
        avgPrice: Math.round(d.avg_price || 0),
        minPrice: Math.round(d.min_price || 0),
        maxPrice: Math.round(d.max_price || 0),
        avgYield: grossYield(d.avg_price),
      })),
      propertyTypes: propertyTypes.map(t => ({
        type:     t.type || 'other',
        count:    t.count,
        avgPrice: Math.round(t.avg_price || 0),
        avgYield: grossYield(t.avg_price),
      })),
      monthlyTrends,
      topProperties: formattedTopProperties,
    });
  } catch (error) {
    console.error('Investor stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}