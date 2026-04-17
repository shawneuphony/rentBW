// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { verifyToken } from '@/app/lib/utils/auth';
import { randomUUID } from 'crypto';

function getAuthUser(request) {
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

// GET — list all users with optional filters
export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user)                 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 });

    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const role      = searchParams.get('role');
    const verified  = searchParams.get('verified');
    const search    = searchParams.get('search');
    const pendingId = searchParams.get('pending_id');
    const limit     = parseInt(searchParams.get('limit') ?? '100', 10);
    const offset    = parseInt(searchParams.get('offset') ?? '0',  10);

    let query  = 'SELECT id, name, email, role, verified, phone, created_at, id_document, id_document_status FROM users WHERE 1=1';
    const params = [];

    if (role)     { query += ' AND role = ?';           params.push(role); }
    if (verified !== null && verified !== undefined && verified !== '') {
                    query += ' AND verified = ?';        params.push(Number(verified)); }
    if (pendingId) { query += " AND id_document_status = 'pending' AND id_document IS NOT NULL"; }
    if (search)   { query += ' AND (name LIKE ? OR email LIKE ?)';
                    params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await db.all(query, params);
    const totalRow = await db.get('SELECT COUNT(*) as count FROM users WHERE 1=1');

    return NextResponse.json({ users, total: totalRow?.count ?? 0 });
  } catch (err) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — verify, suspend, unsuspend, approve_id, reject_id
export async function PATCH(request) {
  try {
    const admin = getAuthUser(request);
    if (!admin)                 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 });

    const db   = await getDb();
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });
    }

    const target = await db.get('SELECT * FROM users WHERE id = ?', userId);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (target.role === 'admin') {
      return NextResponse.json({ error: 'Cannot modify admin accounts' }, { status: 403 });
    }

    const now = Date.now();

    switch (action) {
      case 'approve':
        await db.run('UPDATE users SET verified = 1, updated_at = ? WHERE id = ?', [now, userId]);
        break;
      case 'suspend':
        await db.run('UPDATE users SET verified = 0, updated_at = ? WHERE id = ?', [now, userId]);
        break;
      case 'unsuspend':
        await db.run('UPDATE users SET verified = 1, updated_at = ? WHERE id = ?', [now, userId]);
        break;
      case 'approve_id':
        await db.run(
          "UPDATE users SET id_document_status = 'approved', updated_at = ? WHERE id = ?",
          [now, userId]
        );
        // Create notification for the user
        await db.run(
          `INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [randomUUID(), userId, 'id_approved', 'ID Document Approved',
           'Your identity document has been approved. You can now apply for properties.', 0, now]
        );
        break;
      case 'reject_id':
        await db.run(
          "UPDATE users SET id_document_status = 'rejected', updated_at = ? WHERE id = ?",
          [now, userId]
        );
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const updated = await db.get(
      'SELECT id, name, email, role, verified, created_at, id_document, id_document_status FROM users WHERE id = ?',
      userId
    );

    return NextResponse.json({ user: updated, message: `User ${action}d successfully` });
  } catch (err) {
    console.error('Admin users PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — permanently remove a user and all their data
export async function DELETE(request) {
  try {
    const admin = getAuthUser(request);
    if (!admin)                 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 });

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    const db = await getDb();
    const target = await db.get('SELECT * FROM users WHERE id = ?', userId);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (target.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin accounts' }, { status: 403 });
    }

    // Cascade: remove all user data in dependency order
    await db.run('DELETE FROM applications WHERE tenant_id = ?', userId);
    await db.run('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId]);
    await db.run('DELETE FROM saved_properties WHERE user_id = ?', userId);
    await db.run('DELETE FROM saved_reports WHERE user_id = ?', userId);
    await db.run('DELETE FROM notifications WHERE user_id = ?', userId);

    const ownedProperties = await db.all('SELECT id FROM properties WHERE landlord_id = ?', userId);
    for (const { id } of ownedProperties) {
      await db.run('DELETE FROM applications     WHERE property_id = ?', id);
      await db.run('DELETE FROM messages         WHERE property_id = ?', id);
      await db.run('DELETE FROM saved_properties WHERE property_id = ?', id);
      await db.run('DELETE FROM property_views   WHERE property_id = ?', id);
      await db.run('DELETE FROM properties       WHERE id = ?',          id);
    }

    await db.run('DELETE FROM users WHERE id = ?', userId);

    return NextResponse.json({ deleted: true, message: `User "${target.name}" has been permanently deleted.` });
  } catch (err) {
    console.error('Admin users DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}