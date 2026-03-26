// scripts/update-schema.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function updateSchema() {
  console.log('🔧 Updating database schema for messages system...');
  
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  // Check if conversations table exists
  const tableCheck = await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'"
  );

  if (!tableCheck) {
    console.log('📁 Creating conversations table...');
    
    await db.exec(`
      CREATE TABLE conversations (
        id TEXT PRIMARY KEY,
        participant1_id TEXT NOT NULL,
        participant2_id TEXT NOT NULL,
        property_id TEXT,
        last_message_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (participant1_id) REFERENCES users(id),
        FOREIGN KEY (participant2_id) REFERENCES users(id),
        FOREIGN KEY (property_id) REFERENCES properties(id),
        UNIQUE(participant1_id, participant2_id, property_id)
      );

      CREATE INDEX idx_conversations_participant ON conversations(participant1_id, participant2_id);
      CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
    `);
    
    console.log('✅ Conversations table created');
  } else {
    console.log('✅ Conversations table already exists');
  }

  // Check if messages table exists with correct schema
  const messagesCheck = await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='messages'"
  );

  if (!messagesCheck) {
    console.log('📁 Creating messages table...');
    
    await db.exec(`
      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (sender_id) REFERENCES users(id)
      );

      CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
      CREATE INDEX idx_messages_unread ON messages(conversation_id, read, sender_id);
    `);
    
    console.log('✅ Messages table created');
  } else {
    // Check if messages table has the correct columns
    const columns = await db.all("PRAGMA table_info(messages)");
    const columnNames = columns.map(c => c.name);
    
    const neededColumns = ['id', 'conversation_id', 'sender_id', 'content', 'read', 'created_at'];
    const missingColumns = neededColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('📁 Updating messages table schema...');
      
      // Backup existing messages
      const existingMessages = await db.all('SELECT * FROM messages');
      
      // Rename old table
      await db.exec('ALTER TABLE messages RENAME TO messages_old');
      
      // Create new table with correct schema
      await db.exec(`
        CREATE TABLE messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          sender_id TEXT NOT NULL,
          content TEXT NOT NULL,
          read INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id),
          FOREIGN KEY (sender_id) REFERENCES users(id)
        );

        CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
        CREATE INDEX idx_messages_unread ON messages(conversation_id, read, sender_id);
      `);
      
      // Restore data if possible (mapping old columns to new)
      if (existingMessages.length > 0) {
        console.log(`📦 Migrating ${existingMessages.length} existing messages...`);
        
        for (const msg of existingMessages) {
          // Try to map old column names to new ones
          await db.run(
            `INSERT INTO messages (id, conversation_id, sender_id, content, read, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              msg.id || crypto.randomUUID(),
              msg.conversation_id || msg.thread_id || 'temp',
              msg.sender_id || msg.from_id,
              msg.content || msg.message,
              msg.read || 0,
              msg.created_at || msg.timestamp || Date.now()
            ]
          );
        }
      }
      
      // Drop old table
      await db.exec('DROP TABLE IF EXISTS messages_old');
      
      console.log('✅ Messages table updated');
    } else {
      console.log('✅ Messages table already has correct schema');
    }
  }

  // Show current schema
  const tables = await db.all(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `);

  console.log('\n📊 Current tables in database:');
  tables.forEach(t => console.log(`   - ${t.name}`));

  // Show table schemas
  for (const table of tables) {
    const columns = await db.all(`PRAGMA table_info(${table.name})`);
    console.log(`\n📋 ${table.name} columns:`);
    columns.forEach(col => {
      console.log(`   - ${col.name}: ${col.type} ${col.pk ? '(PRIMARY KEY)' : ''}`);
    });
  }

  await db.close();
  console.log('\n✨ Schema update complete!');
}

updateSchema().catch(console.error);