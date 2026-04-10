// app/api/investor/export/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'investor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { format = 'csv', filters = {} } = body;

    const db = await getDb();

    // Build query with optional filters
    let whereClause = "WHERE p.status = 'active'";
    const params = [];

    if (filters.location) {
      whereClause += ' AND p.location LIKE ?';
      params.push(`%${filters.location}%`);
    }
    if (filters.type) {
      whereClause += ' AND p.type = ?';
      params.push(filters.type);
    }
    if (filters.minPrice) {
      whereClause += ' AND p.price >= ?';
      params.push(Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      whereClause += ' AND p.price <= ?';
      params.push(Number(filters.maxPrice));
    }

    const properties = await db.all(`
      SELECT
        p.id, p.title, p.location, p.price, p.type, p.beds, p.baths, p.sqm,
        p.status, p.created_at,
        u.name AS landlord_name,
        (SELECT COUNT(*) FROM saved_properties WHERE property_id = p.id) AS saves,
        (SELECT COUNT(*) FROM messages WHERE property_id = p.id) AS inquiries,
        (SELECT COUNT(*) FROM applications WHERE property_id = p.id) AS applications
      FROM properties p
      LEFT JOIN users u ON p.landlord_id = u.id
      ${whereClause}
      ORDER BY p.price DESC
    `, params);

    const RENT_TO_VALUE = 150;
    const rows = properties.map((p) => ({
      id:             p.id,
      title:          p.title,
      location:       p.location,
      type:           p.type ?? '—',
      beds:           p.beds ?? '—',
      baths:          p.baths ?? '—',
      sqm:            p.sqm ?? '—',
      monthly_rent:   p.price,
      annual_rent:    p.price * 12,
      estimated_value: p.price * RENT_TO_VALUE,
      gross_yield_pct: parseFloat(((p.price * 12) / (p.price * RENT_TO_VALUE) * 100).toFixed(2)),
      landlord:       p.landlord_name ?? '—',
      saves:          p.saves,
      inquiries:      p.inquiries,
      applications:   p.applications,
      listed_date:    p.created_at
        ? new Date(p.created_at).toLocaleDateString('en-GB')
        : '—',
    }));

    if (format === 'json') {
      return NextResponse.json({
        meta: {
          exported_at:  new Date().toISOString(),
          exported_by:  user.name,
          total_records: rows.length,
          filters,
        },
        data: rows,
      });
    }

    // CSV
    const keys   = Object.keys(rows[0] ?? {});
    const escape = (v) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      keys.join(','),
      ...rows.map((r) => keys.map((k) => escape(r[k])).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type':        'text/csv',
        'Content-Disposition': `attachment; filename="rentbw_yield_report_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}