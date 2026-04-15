// app/api/auth/forgot-password/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { randomBytes } from 'crypto';

// Token valid for 1 hour
const TOKEN_TTL_MS = 60 * 60 * 1000;

// POST /api/auth/forgot-password  { email }
// Stores a reset token in the DB. In production you would email the link;
// here the token is returned in the response so you can test without an SMTP server.
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase().trim());

    // Always respond with success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const token  = randomBytes(32).toString('hex');
    const expiry = Date.now() + TOKEN_TTL_MS;

    await db.run(
      'UPDATE users SET reset_token = ?, reset_token_exp = ?, updated_at = ? WHERE id = ?',
      [token, expiry, Date.now(), user.id]
    );

    // TODO: send email here. For now return token so the reset flow can be tested.
    // In production: remove resetToken from the response and email the link instead.
    const resetLink = `/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    return NextResponse.json({
      message: 'If that email is registered, a reset link has been sent.',
      // Dev only — remove before going to production:
      resetToken: token,
      resetLink,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/auth/forgot-password/reset  { email, token, newPassword }
// Separate action to actually apply the new password using the token.
// NOTE: wire this up at /api/auth/reset-password/route.js or handle it here
// by checking the ?action query param if you prefer a single file.