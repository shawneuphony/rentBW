// app/api/messages/unread/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read = 0',
      user.id
    );
    return NextResponse.json({ count: result.count });
  } catch (err) {
    console.error('Unread count error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}