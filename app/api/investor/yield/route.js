// app/api/investor/yield/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'investor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const properties = await db.all(
      "SELECT id, title, location, price, type, beds, baths, sqm FROM properties WHERE status = 'active'"
    );

    // Simple gross yield estimate: assume monthly rent = price, annual = price * 12
    // and a rough property value multiplier based on market norms
    const RENT_TO_VALUE_RATIO = 150; // estimated property value = monthly rent * 150
    const yields = properties.map(p => ({
      ...p,
      estimatedValue: p.price * RENT_TO_VALUE_RATIO,
      annualRent: p.price * 12,
      grossYield: parseFloat(((p.price * 12) / (p.price * RENT_TO_VALUE_RATIO) * 100).toFixed(2)),
    }));

    yields.sort((a, b) => b.grossYield - a.grossYield);

    return NextResponse.json({ yields });
  } catch (err) {
    console.error('Investor yield error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}