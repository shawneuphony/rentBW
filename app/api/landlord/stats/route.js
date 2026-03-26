// app/api/landlord/stats/route.js
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

    const [totalListings, activeListings, pendingListings, totalViews, totalInquiries, unreadInquiries, repliedCount] =
      await Promise.all([
        db.get('SELECT COUNT(*) as count FROM properties WHERE landlord_id = ?', user.id),
        db.get("SELECT COUNT(*) as count FROM properties WHERE landlord_id = ? AND status = 'active'", user.id),
        db.get("SELECT COUNT(*) as count FROM properties WHERE landlord_id = ? AND status = 'pending'", user.id),
        db.get(
          `SELECT COUNT(*) as count FROM property_views pv
           JOIN properties p ON pv.property_id = p.id
           WHERE p.landlord_id = ?`, user.id
        ),
        db.get(
          `SELECT COUNT(*) as count FROM messages m
           JOIN properties p ON m.property_id = p.id
           WHERE p.landlord_id = ? AND m.receiver_id = ?`, [user.id, user.id]
        ),
        db.get(
          `SELECT COUNT(*) as count FROM messages m
           JOIN properties p ON m.property_id = p.id
           WHERE p.landlord_id = ? AND m.receiver_id = ? AND m.read = 0`, [user.id, user.id]
        ),
        db.get(
          `SELECT COUNT(DISTINCT parent_id) as count FROM messages
           WHERE sender_id = ? AND parent_id IS NOT NULL`, user.id
        ),
      ]);

    const responseRate = totalInquiries.count > 0
      ? Math.round((repliedCount.count / totalInquiries.count) * 100)
      : 100;

    // View trends — last 7 days grouped by date
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rawViews = await db.all(
      `SELECT pv.created_at FROM property_views pv
       JOIN properties p ON pv.property_id = p.id
       WHERE p.landlord_id = ? AND pv.created_at >= ?`, [user.id, sevenDaysAgo]
    );

    const viewsByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      viewsByDay[d.toISOString().split('T')[0]] = 0;
    }
    for (const v of rawViews) {
      const key = new Date(v.created_at).toISOString().split('T')[0];
      if (key in viewsByDay) viewsByDay[key]++;
    }
    const viewTrends = Object.entries(viewsByDay).map(([date, views]) => ({ date, views }));

    return NextResponse.json({
      totalListings: totalListings.count,
      activeListings: activeListings.count,
      pendingListings: pendingListings.count,
      totalViews: totalViews.count,
      totalInquiries: totalInquiries.count,
      unreadCount: unreadInquiries.count,
      responseRate,
      viewTrends,
    });
  } catch (err) {
    console.error('Landlord stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}