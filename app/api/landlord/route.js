// app/api/landlord/stats/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { verifyToken } from '@/app/lib/utils/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

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

    // Only landlords can access this
    if (payload.role !== 'landlord' && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const db = await getDb();

    // Get counts for landlord's properties
    const [totalListings, activeListings, pendingListings, totalViews, totalInquiries] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM properties WHERE landlord_id = ?', [payload.id]),
      db.get('SELECT COUNT(*) as count FROM properties WHERE landlord_id = ? AND status = "active"', [payload.id]),
      db.get('SELECT COUNT(*) as count FROM properties WHERE landlord_id = ? AND status = "pending"', [payload.id]),
      db.get('SELECT SUM(views) as total FROM properties WHERE landlord_id = ?', [payload.id]),
      db.get(`
        SELECT COUNT(*) as count 
        FROM messages m
        JOIN properties p ON m.property_id = p.id
        WHERE p.landlord_id = ? AND m.receiver_id = ?
      `, [payload.id, payload.id])
    ]);

    // Get monthly view trends (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const viewsLast30Days = await db.all(`
      SELECT date(created_at/1000, 'unixepoch') as date, COUNT(*) as views
      FROM property_views
      WHERE property_id IN (SELECT id FROM properties WHERE landlord_id = ?)
        AND created_at > ?
      GROUP BY date
      ORDER BY date ASC
    `, [payload.id, thirtyDaysAgo]);

    // Get recent inquiries
    const recentInquiries = await db.all(`
      SELECT m.*, 
             u.name as tenant_name,
             p.title as property_title
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      JOIN properties p ON m.property_id = p.id
      WHERE p.landlord_id = ? AND m.receiver_id = ?
      ORDER BY m.created_at DESC
      LIMIT 5
    `, [payload.id, payload.id]);

    // Calculate response rate (messages responded to within 24h)
    const responseRate = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN (m2.created_at - m.created_at) < 86400000 THEN 1 ELSE 0 END) as responded
      FROM messages m
      LEFT JOIN messages m2 ON m2.parent_id = m.id
      WHERE m.receiver_id = ?
    `, [payload.id]);

    return NextResponse.json({
      totalListings: totalListings.count,
      activeListings: activeListings.count,
      pendingListings: pendingListings.count,
      totalViews: totalViews?.total || 0,
      totalInquiries: totalInquiries.count,
      viewTrends: viewsLast30Days,
      recentInquiries: recentInquiries.map(i => ({
        ...i,
        created_at: new Date(i.created_at).toLocaleString()
      })),
      responseRate: responseRate.total > 0 
        ? Math.round((responseRate.responded / responseRate.total) * 100) 
        : 100
    });
  } catch (error) {
    console.error('Error fetching landlord stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}