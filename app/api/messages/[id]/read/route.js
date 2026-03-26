// app/api/messages/[id]/read/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

async function markRead(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const message = await db.get('SELECT * FROM messages WHERE id = ?', params.id);
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (message.receiver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.run('UPDATE messages SET read = 1 WHERE id = ?', params.id);
    return NextResponse.json({ read: true });
  } catch (err) {
    console.error('Mark read error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Support both POST (used by useLandlordData) and PUT
export const POST = markRead;
export const PUT = markRead;