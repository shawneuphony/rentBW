// app/api/admin/datasets/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();

    const [users, properties, applications, messages] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM users'),
      db.get('SELECT COUNT(*) as count FROM properties'),
      db.get('SELECT COUNT(*) as count FROM applications'),
      db.get('SELECT COUNT(*) as count FROM messages'),
    ]);

    const datasets = [
      {
        id:          'users',
        label:       'Users',
        description: 'All registered users (tenants, landlords, investors, admins)',
        count:       users.count,
        exportFields: ['id', 'name', 'email', 'role', 'phone', 'verified', 'created_at'],
      },
      {
        id:          'properties',
        label:       'Properties',
        description: 'All property listings across all statuses',
        count:       properties.count,
        exportFields: ['id', 'title', 'location', 'price', 'type', 'beds', 'baths', 'sqm', 'status', 'landlord_id', 'created_at'],
      },
      {
        id:          'applications',
        label:       'Applications',
        description: 'Rental applications submitted by tenants',
        count:       applications.count,
        exportFields: ['id', 'status', 'tenant_id', 'property_id', 'notes', 'created_at'],
      },
      {
        id:          'messages',
        label:       'Messages',
        description: 'All messages between tenants and landlords',
        count:       messages.count,
        exportFields: ['id', 'sender_id', 'receiver_id', 'property_id', 'content', 'created_at'],
        purgeable:   true,
      },
    ];

    return NextResponse.json({ datasets });
  } catch (err) {
    console.error('Datasets GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, dataset } = await request.json();
    const db = await getDb();

    const ALLOWED_TABLES = ['users', 'properties', 'applications', 'messages'];
    if (!ALLOWED_TABLES.includes(dataset)) {
      return NextResponse.json({ error: 'Invalid dataset' }, { status: 400 });
    }

    if (action === 'export') {
      const rows = await db.all(`SELECT * FROM ${dataset} ORDER BY created_at DESC`);
      const safe = rows.map((row) => {
        const r = { ...row };
        delete r.password;
        delete r.verification_token;
        delete r.reset_token;
        delete r.reset_token_exp;
        delete r.avatar;
        delete r.id_document;
        return r;
      });
      return NextResponse.json({ rows: safe, count: safe.length });
    }

    if (action === 'purge') {
      if (dataset !== 'messages') {
        return NextResponse.json({ error: 'This dataset cannot be purged' }, { status: 400 });
      }
      await db.run(`DELETE FROM ${dataset}`);
      return NextResponse.json({ purged: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Datasets POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}