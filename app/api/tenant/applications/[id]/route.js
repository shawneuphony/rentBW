// app/api/tenant/applications/[id]/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const application = await db.get(
      `SELECT a.*, p.title as property_title, p.location, p.price
       FROM applications a
       JOIN properties p ON a.property_id = p.id
       WHERE a.id = ? AND a.tenant_id = ?`,
      [params.id, user.id]
    );
    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ application });
  } catch (err) {
    console.error('Application GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const application = await db.get(
      'SELECT * FROM applications WHERE id = ? AND tenant_id = ?',
      [params.id, user.id]
    );
    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Cannot withdraw a processed application' }, { status: 400 });
    }

    await db.run('DELETE FROM applications WHERE id = ?', params.id);
    return NextResponse.json({ message: 'Withdrawn' });
  } catch (err) {
    console.error('Application DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}