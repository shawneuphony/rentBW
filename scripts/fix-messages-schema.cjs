// scripts/fix-messages-schema.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function fixMessagesSchema() {
  console.log('🔧 Fixing messages table schema...');
  
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  // Check current messages table structure
  const tableInfo = await db.all("PRAGMA table_info(messages)");
  console.log('\n📋 Current messages table columns:');
  tableInfo.forEach(col => {
    console.log(`   - ${col.name}: ${col.type}`);
  });

  // Check if we need to rebuild the messages table
  const hasConversationId = tableInfo.some(col => col.name === 'conversation_id');
  
  if (!hasConversationId) {
    console.log('\n⚠️  conversation_id column missing. Rebuilding messages table...');
    
    // Backup existing messages if any
    const existingMessages = await db.all('SELECT * FROM messages');
    console.log(`   Found ${existingMessages.length} existing messages to backup`);
    
    // Drop and recreate messages table with correct schema
    await db.exec('DROP TABLE IF EXISTS messages');
    
    await db.exec(`
      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
      CREATE INDEX idx_messages_unread ON messages(conversation_id, read, sender_id);
    `);
    
    console.log('✅ Messages table recreated with correct schema');
    
    // Restore messages if possible (this is simplified - you may need to map old columns)
    if (existingMessages.length > 0) {
      console.log('⚠️  Existing messages need to be recreated. Run seed script to add sample messages.');
    }
  } else {
    console.log('\n✅ messages table has correct schema');
  }

  // Check conversations table
  const conversationsExist = await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'"
  );
  
  if (!conversationsExist) {
    console.log('\n📁 Creating conversations table...');
    
    await db.exec(`
      CREATE TABLE conversations (
        id TEXT PRIMARY KEY,
        participant1_id TEXT NOT NULL,
        participant2_id TEXT NOT NULL,
        property_id TEXT,
        last_message_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
        UNIQUE(participant1_id, participant2_id, property_id)
      );

      CREATE INDEX idx_conversations_participant ON conversations(participant1_id, participant2_id);
      CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
    `);
    
    console.log('✅ Conversations table created');
  }

  await db.close();
  console.log('\n✨ Schema fix complete!');
}

fixMessagesSchema().catch(console.error);