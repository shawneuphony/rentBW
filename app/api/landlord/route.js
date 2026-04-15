// app/api/landlord/route.js
// This file intentionally returns 404.
// All landlord API endpoints live under named sub-routes:
//   GET  /api/landlord/stats
//   GET  /api/landlord/listings
//   GET  /api/landlord/analytics
//   GET  /api/landlord/inquiries
//   GET/PUT/PATCH/DELETE  /api/landlord/properties/[id]
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'Use /api/landlord/stats, /api/landlord/listings, or /api/landlord/properties/[id]' },
    { status: 404 }
  );
}