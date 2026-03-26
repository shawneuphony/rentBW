// app/api/landlord/inquiries/route.js
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

    const rows = await db.all(
      `SELECT 
        m.id,
        m.content as message,
        m.read,
        m.created_at as date,
        m.property_id,
        s.name as tenantName,
        s.email as tenantEmail,
        p.title as propertyTitle
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       LEFT JOIN properties p ON m.property_id = p.id
       WHERE m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      user.id
    );

    // Generate avatar initials from name
    const inquiries = rows.map((row) => ({
      ...row,
      read: row.read === 1,
      avatar: row.tenantName
        ? row.tenantName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?',
    }));

    const unreadCount = inquiries.filter(i => !i.read).length;

    return NextResponse.json({ inquiries, unreadCount });
  } catch (err) {
    console.error('Landlord inquiries error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}