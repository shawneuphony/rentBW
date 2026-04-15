import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const [totalUsers, totalListings, totalApplications, totalMessages, weeklySignups, monthlyActivity] = await Promise.all([
    db.get('SELECT COUNT(*) as count FROM users'),
    db.get('SELECT COUNT(*) as count FROM properties'),
    db.get('SELECT COUNT(*) as count FROM applications'),
    db.get('SELECT COUNT(*) as count FROM messages'),
    db.all(`
      SELECT strftime('%W', created_at/1000, 'unixepoch') as week, COUNT(*) as signups
      FROM users WHERE created_at > ? GROUP BY week ORDER BY week DESC LIMIT 8
    `, Date.now() - 60 * 24 * 60 * 60 * 1000),
    db.all(`
      SELECT strftime('%Y-%m', created_at/1000, 'unixepoch') as month, COUNT(*) as activity
      FROM messages WHERE created_at > ? GROUP BY month ORDER BY month ASC LIMIT 6
    `, Date.now() - 180 * 24 * 60 * 60 * 1000),
  ]);

  return NextResponse.json({
    totalUsers: totalUsers.count,
    totalListings: totalListings.count,
    totalApplications: totalApplications.count,
    totalMessages: totalMessages.count,
    weeklySignups: weeklySignups.map(w => ({ label: `Week ${w.week}`, value: w.signups })),
    monthlyActivity: monthlyActivity.map(m => ({ label: m.month.slice(5), value: m.activity })),
  });
}