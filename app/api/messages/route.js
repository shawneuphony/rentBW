// app/api/messages/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/utils/db';
import { getAuthUser } from '@/app/lib/utils/getAuthUser';
import { randomUUID } from 'crypto';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const conversationWith = searchParams.get('conversation');

    // Return thread with a specific user
    if (conversationWith) {
      const messages = await db.all(
        `SELECT m.*,
          s.name as sender_name,
          r.name as receiver_name,
          p.title as property_title
         FROM messages m
         JOIN users s ON m.sender_id = s.id
         JOIN users r ON m.receiver_id = r.id
         LEFT JOIN properties p ON m.property_id = p.id
         WHERE (m.sender_id = ? AND m.receiver_id = ?)
            OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.created_at ASC`,
        [user.id, conversationWith, conversationWith, user.id]
      );
      return NextResponse.json({ messages });
    }

    // Return all conversations grouped by the other user
    const allMessages = await db.all(
      `SELECT m.*,
        s.name as sender_name,
        r.name as receiver_name,
        p.title as property_title,
        p.id as property_id
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       LEFT JOIN properties p ON m.property_id = p.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      [user.id, user.id]
    );

    // Group into conversations keyed by other_user_id
    const convMap = {};
    for (const msg of allMessages) {
      const isOwn = msg.sender_id === user.id;
      const otherId = isOwn ? msg.receiver_id : msg.sender_id;
      const otherName = isOwn ? msg.receiver_name : msg.sender_name;

      if (!convMap[otherId]) {
        convMap[otherId] = {
          other_user_id: otherId,
          other_user_name: otherName,
          property_id: msg.property_id || null,
          property_title: msg.property_title || null,
          last_message: msg.content,
          last_message_time: msg.created_at,
          unread_count: 0,
        };
      }

      // Count unread messages sent TO current user
      if (msg.receiver_id === user.id && !msg.read) {
        convMap[otherId].unread_count++;
      }
    }

    const conversations = Object.values(convMap);
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('Messages GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const { receiver_id, receiverId, content, property_id, propertyId, parent_id } = await request.json();

    // Support both camelCase and snake_case field names
    const to = receiver_id || receiverId;
    const propId = property_id || propertyId || null;

    if (!content || !to) {
      return NextResponse.json({ error: 'content and receiver_id are required' }, { status: 400 });
    }

    // 🔧 FIX (Bug 7): Validate that the receiver exists
    const receiverExists = await db.get('SELECT id FROM users WHERE id = ?', to);
    if (!receiverExists) {
      return NextResponse.json({ error: 'Receiver does not exist' }, { status: 400 });
    }

    const id = randomUUID();
    const now = Date.now();

    await db.run(
      `INSERT INTO messages (id, content, sender_id, receiver_id, property_id, parent_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, content, user.id, to, propId, parent_id || null, now]
    );

    // Fetch the newly created message with sender/receiver names for the response
    const message = await db.get(
      `SELECT m.*,
              s.name as sender_name,
              r.name as receiver_name,
              p.title as property_title
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       LEFT JOIN properties p ON m.property_id = p.id
       WHERE m.id = ?`,
      id
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error('Messages POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}