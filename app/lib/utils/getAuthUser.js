// lib/utils/getAuthUser.js
import { verifyToken } from '@/app/lib/utils/auth';
import { getUserById } from '@/app/lib/utils/db';

export async function getAuthUser(request) {
  const token = request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return getUserById(decoded.id);
}