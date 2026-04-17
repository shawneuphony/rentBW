// app/api/auth/forgot-password/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { randomBytes } from 'crypto';

// Token valid for 1 hour
const TOKEN_TTL_MS = 60 * 60 * 1000;

// POST /api/auth/forgot-password  { email }
// Stores a reset token in the DB and (in production) emails the reset link.
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

    // PRE-PROD FIX 6: resetToken and resetLink were returned in the JSON
    // response for dev convenience. That must never reach production — it
    // lets anyone trigger a password reset for any account by simply reading
    // the API response. Wire up an email/SMS delivery here instead.
    //
    // The reset link to deliver out-of-band:
    //   /auth/reset-password?token=<token>&email=<encoded-email>
    //
    // Example with a transactional email service (nodemailer, Resend, etc.):
    //   await sendResetEmail({ to: email, token, resetLink });

    return NextResponse.json({
      message: 'If that email is registered, a reset link has been sent.',
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