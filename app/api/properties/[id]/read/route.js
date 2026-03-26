// app/api/messages/[id]/read/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { verifyToken } from '@/app/lib/utils/auth';

function getAuthUser(request) {
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

// PATCH — mark a message as read (only the receiver can do this)
export async function PATCH(request, { params }) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db  = await getDb();
    const msg = await db.get('SELECT * FROM messages WHERE id = ?', params.id);

    if (!msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only the intended receiver can mark it read
    if (msg.receiver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.run('UPDATE messages SET read = 1 WHERE id = ?', params.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}