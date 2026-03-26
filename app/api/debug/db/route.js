// app/api/debug/db/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';

export async function GET() {
  // Only available in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const db = await getDb();
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");

    const info = {};
    for (const { name } of tables) {
      const rows = await db.all(`SELECT * FROM ${name} LIMIT 5`);
      const count = await db.get(`SELECT COUNT(*) as count FROM ${name}`);
      info[name] = { count: count.count, sample: rows };
    }

    return NextResponse.json({ tables: tables.map(t => t.name), info });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}