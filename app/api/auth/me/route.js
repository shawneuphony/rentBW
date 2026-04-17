// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/app/lib/utils/db';
import { verifyToken } from '@/app/lib/utils/auth';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';
import bcrypt from 'bcryptjs';

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    verified: user.verified,
    avatar: user.avatar ?? null,
    id_document: user.id_document ?? null,
    id_document_status: user.id_document_status ?? 'none',
    created_at: user.created_at,
  };
}

export async function GET(request) {
  console.log('👤 /api/auth/me GET called');
  try {
    const token =
      request.cookies.get('token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await getUserById(decoded.id);
    if (!user) {
      console.log('❌ User not found for id:', decoded.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User data fetched for:', user.email);
    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Me GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  console.log('✏️ /api/auth/me PATCH called');
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const updates = {};

    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.phone === 'string') updates.phone = body.phone.trim();
    if (typeof body.avatar === 'string') {
      if (body.avatar.length > 2_200_000) {
        return NextResponse.json({ error: 'Avatar image too large (max 2MB)' }, { status: 400 });
      }
      updates.avatar = body.avatar;
    }
    if (typeof body.id_document === 'string') {
      if (body.id_document.length > 5_000_000) {
        return NextResponse.json({ error: 'Document too large (max 5MB)' }, { status: 400 });
      }
      updates.id_document = body.id_document;
      updates.id_document_status = 'pending';
    }
    if (body.currentPassword && body.newPassword) {
      const valid = await bcrypt.compare(body.currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }
      updates.password = await bcrypt.hash(body.newPassword, 10);
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await updateUser(user.id, updates);
    console.log('✅ User updated:', updated.email);
    return NextResponse.json({ user: sanitizeUser(updated) });
  } catch (err) {
    console.error('Me PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}