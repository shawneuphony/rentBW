// app/api/test/route.js
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';

export async function GET(request) {
  const user = await getAuthUser(request);
  return NextResponse.json({
    message: 'API is working',
    authenticated: !!user,
    user: user ? { id: user.id, name: user.name, role: user.role } : null,
  });
}