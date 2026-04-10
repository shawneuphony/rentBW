// app/api/investor/saved-reports/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'investor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const reports = await db.all(
      'SELECT id, title, type, params, created_at FROM saved_reports WHERE user_id = ? ORDER BY created_at DESC',
      user.id
    );

    return NextResponse.json({
      reports: reports.map((r) => ({
        ...r,
        params: r.params ? JSON.parse(r.params) : {},
      })),
    });
  } catch (err) {
    console.error('Saved reports GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'investor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, type, params } = await request.json();
    if (!title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const db    = await getDb();
    const id    = randomUUID();
    const now   = Date.now();

    await db.run(
      'INSERT INTO saved_reports (id, user_id, title, type, params, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, user.id, title.trim(), type ?? 'yield', JSON.stringify(params ?? {}), now]
    );

    const report = await db.get('SELECT * FROM saved_reports WHERE id = ?', id);
    return NextResponse.json(
      { report: { ...report, params: JSON.parse(report.params ?? '{}') } },
      { status: 201 }
    );
  } catch (err) {
    console.error('Saved reports POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'investor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const db = await getDb();
    const report = await db.get(
      'SELECT id FROM saved_reports WHERE id = ? AND user_id = ?',
      [id, user.id]
    );
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.run('DELETE FROM saved_reports WHERE id = ?', id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('Saved reports DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}