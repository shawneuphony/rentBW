// app/api/tenant/messages/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const messages = await db.all(
      `SELECT m.*, 
        s.name as sender_name,
        r.name as receiver_name,
        p.title as property_title
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       LEFT JOIN properties p ON m.property_id = p.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      [user.id, user.id]
    );
    return NextResponse.json({ messages });
  } catch (err) {
    console.error('Tenant messages error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}