// scripts/inspect-db.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function inspectDB() {
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  console.log('\n📊 DATABASE INSPECTION');
  console.log('=====================\n');

  // Get all tables
  const tables = await db.all(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `);

  console.log('📁 Tables:');
  for (const table of tables) {
    const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
    console.log(`   - ${table.name}: ${count.count} records`);
  }

  // Show users
  const users = await db.all('SELECT id, email, name, role FROM users LIMIT 5');
  console.log('\n👥 Users:');
  users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

  // Show conversations
  const conversations = await db.all(`
    SELECT c.*, 
           u1.name as user1, 
           u2.name as user2,
           p.title as property
    FROM conversations c
    JOIN users u1 ON c.participant1_id = u1.id
    JOIN users u2 ON c.participant2_id = u2.id
    LEFT JOIN properties p ON c.property_id = p.id
    ORDER BY c.last_message_at DESC
    LIMIT 5
  `);

  console.log('\n💬 Recent Conversations:');
  conversations.forEach(c => {
    console.log(`   - ${c.user1} ↔ ${c.user2}`);
    console.log(`     Property: ${c.property || 'General'}`);
    console.log(`     Last message: ${new Date(c.last_message_at).toLocaleString()}`);
  });

  // Show recent messages
  const messages = await db.all(`
    SELECT m.*, u.name as sender, c.id as conv_id
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    JOIN conversations c ON m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 10
  `);

  console.log('\n📨 Recent Messages:');
  messages.forEach(m => {
    console.log(`   - [${new Date(m.created_at).toLocaleString()}] ${m.sender}: ${m.content.substring(0, 50)}${m.content.length > 50 ? '...' : ''}`);
    console.log(`     Read: ${m.read ? 'Yes' : 'No'}`);
  });

  // Show unread counts
  const unread = await db.get(`
    SELECT COUNT(*) as count FROM messages WHERE read = 0
  `);
  console.log(`\n🔔 Unread Messages: ${unread.count}`);

  await db.close();
}

inspectDB().catch(console.error);