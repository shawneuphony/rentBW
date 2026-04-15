// app/api/auth/route.js
// Auth sub-routes:
//   POST /api/auth/login
//   POST /api/auth/register
//   POST /api/auth/logout
//   GET  /api/auth/me
//   PATCH /api/auth/me         (update profile, avatar, ID doc, password)
//   POST /api/auth/forgot-password
//   POST /api/auth/reset-password
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    routes: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/auth/logout',
      'GET  /api/auth/me',
      'PATCH /api/auth/me',
      'POST /api/auth/forgot-password',
      'POST /api/auth/reset-password',
    ],
  });
}