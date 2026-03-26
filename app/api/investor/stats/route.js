// app/api/investor/stats/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { verifyToken } from '@/app/lib/utils/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
n
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await getDb();

    // Get market statistics with corrected yield calculation
    // Estimated yield is typically (annual rent * 12) / property price * 100
    // For now, we'll use a placeholder calculation
    const totalProperties = await db.get('SELECT COUNT(*) as count FROM properties WHERE status = "active"');
    
    const avgPriceResult = await db.get('SELECT AVG(price) as avg FROM properties WHERE status = "active"');
    
    const totalValueResult = await db.get('SELECT SUM(price) as total FROM properties WHERE status = "active"');
    
    // Calculate average yield based on estimated annual rent (assuming 8% of property value)
    // This is a simplified calculation - in reality, yield = (annual rent / property price) * 100
    const avgYield = 8.5; // Placeholder - in production, calculate from actual rental data

    // Get district breakdown
    const districts = await db.all(`
      SELECT 
        location,
        COUNT(*) as count,
        AVG(price) as avg_price,
        AVG(price) * 0.08 as est_annual_rent,
        (AVG(price) * 0.08 / AVG(price)) * 100 as est_yield
      FROM properties 
      WHERE status = 'active'
      GROUP BY location
      ORDER BY count DESC
      LIMIT 5
    `);

    // Get property type breakdown
    const propertyTypes = await db.all(`
      SELECT 
        type,
        COUNT(*) as count,
        AVG(price) as avg_price
      FROM properties 
      WHERE status = 'active'
      GROUP BY type
    `);

    // Get monthly trends (last 6 months)
    const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
    const monthlyTrends = await db.all(`
      SELECT 
        strftime('%Y-%m', created_at/1000, 'unixepoch') as month,
        COUNT(*) as listings,
        AVG(price) as avg_price
      FROM properties
      WHERE created_at > ? AND status = 'active'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `, [sixMonthsAgo]);

    // Get top performing properties
    const topProperties = await db.all(`
      SELECT 
        p.*,
        u.name as landlord_name,
        (SELECT COUNT(*) FROM saved_properties WHERE property_id = p.id) as saves,
        (SELECT COUNT(*) FROM messages WHERE property_id = p.id) as inquiries
      FROM properties p
      JOIN users u ON p.landlord_id = u.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    // Parse JSON fields for properties
    const formattedTopProperties = topProperties.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      location: p.location,
      type: p.type,
      views: p.views || 0,
      saves: p.saves || 0,
      inquiries: p.inquiries || 0,
      landlord: p.landlord_name,
      yield: Math.round((p.price * 0.08 / p.price) * 100 * 10) / 10, // Simplified yield calculation
      image: p.images ? JSON.parse(p.images)[0] : null
    }));

    return NextResponse.json({
      marketStats: {
        totalProperties: totalProperties.count || 0,
        avgPrice: Math.round(avgPriceResult?.avg || 0),
        totalValue: Math.round(totalValueResult?.total || 0),
        avgYield: avgYield
      },
      districts: districts.map(d => ({
        name: d.location ? d.location.split(',')[0] : 'Unknown',
        count: d.count,
        avgPrice: Math.round(d.avg_price || 0),
        avgYield: Math.round((d.est_yield || 8) * 10) / 10
      })),
      propertyTypes: propertyTypes.map(t => ({
        type: t.type || 'other',
        count: t.count,
        avgPrice: Math.round(t.avg_price || 0)
      })),
      monthlyTrends: monthlyTrends.reverse(),
      topProperties: formattedTopProperties
    });
  } catch (error) {
    console.error('Error fetching investor stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}