// app/api/stats/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';

export async function GET() {
  try {
    const db = await getDb();

    // Get total properties
    const propertyCount = await db.get('SELECT COUNT(*) as count FROM properties WHERE status = "active"');
    
    // Get total users (tenants)
    const tenantCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = "tenant"');
    
    // Get total landlords
    const landlordCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = "landlord" AND verified = 1');

    return NextResponse.json({
      totalProperties: propertyCount?.count || 1200,
      happyTenants: tenantCount?.count || 500,
      verifiedLandlords: landlordCount?.count || 300
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default stats if database query fails
    return NextResponse.json({
      totalProperties: 1200,
      happyTenants: 500,
      verifiedLandlords: 300
    });
  }
}