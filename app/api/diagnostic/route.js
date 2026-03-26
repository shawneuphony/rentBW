// app/api/diagnostic/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';

export async function GET() {
  try {
    const db = await getDb();
    const [users, properties, applications, messages] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM users'),
      db.get('SELECT COUNT(*) as count FROM properties'),
      db.get('SELECT COUNT(*) as count FROM applications'),
      db.get('SELECT COUNT(*) as count FROM messages'),
    ]);

    return NextResponse.json({
      status: 'ok',
      counts: {
        users: users.count,
        properties: properties.count,
        applications: applications.count,
        messages: messages.count,
      },
    });
  } catch (err) {
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}