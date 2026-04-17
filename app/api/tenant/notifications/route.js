import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const notifications = await db.all(
      `SELECT id, type, title, message, read, data, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      user.id
    );
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error('Notifications GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { notificationId, markAll } = await request.json();
    const db = await getDb();

    if (markAll) {
      await db.run(
        'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0',
        user.id
      );
    } else if (notificationId) {
      await db.run(
        'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
        [notificationId, user.id]
      );
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notifications PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}