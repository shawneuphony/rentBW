// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/app/lib/utils/db';
import { hashPassword, generateToken } from '@/app/lib/utils/auth';

export async function POST(request) {
  try {
    const { name, email, password, role, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await createUser({ name, email, password: hashed, role: role || 'tenant', phone });

    const token = generateToken(user);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });

    response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' });
    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}