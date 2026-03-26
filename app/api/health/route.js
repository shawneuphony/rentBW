// app/api/health/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';

export async function GET() {
  try {
    const db = await getDb();
    await db.get('SELECT 1');
    return NextResponse.json({ status: 'ok', db: 'connected', timestamp: Date.now() });
  } catch (err) {
    return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 500 });
  }
}