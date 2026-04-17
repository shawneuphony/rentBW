import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

const ALLOWED = ['users', 'properties', 'applications', 'messages'];

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  if (!type || !ALLOWED.includes(type)) {
    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  }

  const db = await getDb();
  let rows = await db.all(`SELECT * FROM ${type} ORDER BY created_at DESC`);

  // Remove sensitive fields
  const sensitive = ['password', 'verification_token', 'reset_token', 'reset_token_exp', 'avatar', 'id_document'];
  rows = rows.map(row => {
    const clean = { ...row };
    sensitive.forEach(f => delete clean[f]);
    return clean;
  });

  // FIX 1: rows[0] was undefined on an empty table, crashing Object.keys().
  // Return an empty CSV body instead of throwing a TypeError.
  if (rows.length === 0) {
    return new NextResponse('', {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rentbw_${type}_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const csv = [
    Object.keys(rows[0]).join(','),
    ...rows.map(row => Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="rentbw_${type}_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}