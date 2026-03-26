// app/api/landlord/analytics/route.js
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

    // Totals
    const [totalViews, totalInquiries, totalSaves, totalListings] = await Promise.all([
      db.get(`SELECT COUNT(*) as count FROM property_views pv
              JOIN properties p ON pv.property_id = p.id
              WHERE p.landlord_id = ?`, user.id),
      db.get(`SELECT COUNT(*) as count FROM messages m
              JOIN properties p ON m.property_id = p.id
              WHERE p.landlord_id = ? AND m.receiver_id = ?`, [user.id, user.id]),
      db.get(`SELECT COUNT(*) as count FROM saved_properties sp
              JOIN properties p ON sp.property_id = p.id
              WHERE p.landlord_id = ?`, user.id),
      db.get(`SELECT COUNT(*) as count FROM properties WHERE landlord_id = ?`, user.id),
    ]);

    // Conversion rate = inquiries / views * 100
    const conversionRate = totalViews.count > 0
      ? ((totalInquiries.count / totalViews.count) * 100).toFixed(1)
      : 0;

    // Daily views — last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rawViews = await db.all(
      `SELECT pv.created_at FROM property_views pv
       JOIN properties p ON pv.property_id = p.id
       WHERE p.landlord_id = ? AND pv.created_at >= ?`, [user.id, sevenDaysAgo]
    );

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { label: days[d.getDay()], value: 0 };
    }
    for (const v of rawViews) {
      const key = new Date(v.created_at).toISOString().split('T')[0];
      if (dailyMap[key]) dailyMap[key].value++;
    }
    const dailyViews = Object.values(dailyMap);

    // Weekly inquiries — last 4 weeks
    const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const rawInquiries = await db.all(
      `SELECT m.created_at FROM messages m
       JOIN properties p ON m.property_id = p.id
       WHERE p.landlord_id = ? AND m.receiver_id = ? AND m.created_at >= ?`,
      [user.id, user.id, fourWeeksAgo]
    );

    const weeklyMap = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
    for (const m of rawInquiries) {
      const daysAgo = Math.floor((Date.now() - m.created_at) / (1000 * 60 * 60 * 24));
      if (daysAgo < 7)        weeklyMap['Week 4']++;
      else if (daysAgo < 14)  weeklyMap['Week 3']++;
      else if (daysAgo < 21)  weeklyMap['Week 2']++;
      else                    weeklyMap['Week 1']++;
    }
    const weeklyInquiries = Object.entries(weeklyMap).map(([label, value]) => ({ label, value }));

    // Per-property breakdown
    const properties = await db.all(
      'SELECT id, title FROM properties WHERE landlord_id = ?', user.id
    );
    const perProperty = await Promise.all(properties.map(async (p) => {
      const [views, inquiries, saves] = await Promise.all([
        db.get('SELECT COUNT(*) as count FROM property_views WHERE property_id = ?', p.id),
        db.get('SELECT COUNT(*) as count FROM messages WHERE property_id = ?', p.id),
        db.get('SELECT COUNT(*) as count FROM saved_properties WHERE property_id = ?', p.id),
      ]);
      return {
        id: p.id,
        title: p.title,
        views: views.count,
        inquiries: inquiries.count,
        saves: saves.count,
      };
    }));

    return NextResponse.json({
      totals: {
        views: totalViews.count,
        inquiries: totalInquiries.count,
        saves: totalSaves.count,
        listings: totalListings.count,
        conversionRate: Number(conversionRate),
      },
      dailyViews,
      weeklyInquiries,
      perProperty,
    });
  } catch (err) {
    console.error('Landlord analytics error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}