// app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import bcrypt from 'bcryptjs';

// POST /api/auth/reset-password  { email, token, newPassword }
export async function POST(request) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'email, token and newPassword are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const db   = await getDb();
    const user = await db.get(
      'SELECT * FROM users WHERE email = ? AND reset_token = ?',
      [email.toLowerCase().trim(), token]
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (Date.now() > user.reset_token_exp) {
      return NextResponse.json({ error: 'Reset token has expired. Please request a new one.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const now    = Date.now();

    await db.run(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_exp = NULL, updated_at = ? WHERE id = ?',
      [hashed, now, user.id]
    );

    return NextResponse.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}