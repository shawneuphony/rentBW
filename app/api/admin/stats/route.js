import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const db = await getDb();

    const [
      totalUsers,
      tenants,
      landlords,
      investors,
      activeListings,
      pendingListings,
      totalApplications,
      pendingApplications,
      approvedApplications,
      unreadMessages,
      totalMessages,
      pendingVerification,
      recentUsers,
      recentProperties,
    ] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM users'),
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'tenant'"),
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'landlord'"),
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'investor'"),
      db.get("SELECT COUNT(*) as count FROM properties WHERE status = 'active'"),
      db.get("SELECT COUNT(*) as count FROM properties WHERE status = 'pending'"),
      db.get('SELECT COUNT(*) as count FROM applications'),
      db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'"),
      db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'"),
      db.get('SELECT COUNT(*) as count FROM messages WHERE read = 0'),
      db.get('SELECT COUNT(*) as count FROM messages'),
      db.get('SELECT COUNT(*) as count FROM users WHERE verified = 0'),
      db.all(`SELECT id, name, email, role, verified, created_at FROM users ORDER BY created_at DESC LIMIT 5`),
      db.all(`SELECT p.id, p.title, p.price, p.location, p.status, p.created_at, u.name AS landlord_name FROM properties p LEFT JOIN users u ON p.landlord_id = u.id ORDER BY p.created_at DESC LIMIT 5`),
    ]);

    const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
    const weeklySignups = await db.all(`SELECT created_at FROM users WHERE created_at >= ? ORDER BY created_at ASC`, fourWeeksAgo);
    const weeks = [0, 0, 0, 0];
    const now = Date.now();
    for (const row of weeklySignups) {
      const daysAgo = Math.floor((now - row.created_at) / (24 * 60 * 60 * 1000));
      const weekIdx = Math.min(3, Math.floor(daysAgo / 7));
      weeks[3 - weekIdx]++;
    }

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers?.count ?? 0,
        tenants: tenants?.count ?? 0,
        landlords: landlords?.count ?? 0,
        investors: investors?.count ?? 0,
        activeListings: activeListings?.count ?? 0,
        pendingListings: pendingListings?.count ?? 0,
        totalApplications: totalApplications?.count ?? 0,
        pendingApplications: pendingApplications?.count ?? 0,
        approvedApplications: approvedApplications?.count ?? 0,
        unreadMessages: unreadMessages?.count ?? 0,
        totalMessages: totalMessages?.count ?? 0,
        pendingVerification: pendingVerification?.count ?? 0,
      },
      weeklySignups: [
        { label: 'Week 1', value: weeks[0] },
        { label: 'Week 2', value: weeks[1] },
        { label: 'Week 3', value: weeks[2] },
        { label: 'Week 4', value: weeks[3] },
      ],
      recentUsers,
      recentProperties,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}