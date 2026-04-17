// app/api/tenant/stats/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    
    // Use explicit column selection and handle potential undefined results
    const [saved, applications, unread] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM saved_properties WHERE user_id = ?', [user.id]),
      db.get('SELECT COUNT(*) as count FROM applications WHERE tenant_id = ?', [user.id]),
      db.get('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND "read" = 0', [user.id]),
    ]);

    return NextResponse.json({
      savedProperties:    saved?.count        ?? 0,
      activeApplications: applications?.count ?? 0,
      unreadMessages:     unread?.count       ?? 0,
    });
  } catch (err) {
    console.error('Tenant stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}