// scripts/check-messages-schema.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkMessagesSchema() {
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  console.log('📋 Checking messages table schema...\n');
  
  const tableInfo = await db.all("PRAGMA table_info(messages)");
  console.log('Columns in messages table:');
  tableInfo.forEach(col => {
    console.log(`   - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });

  console.log('\n📋 Checking conversations table...');
  const convTable = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'");
  
  if (convTable.length > 0) {
    console.log('✅ conversations table exists');
    const convInfo = await db.all("PRAGMA table_info(conversations)");
    console.log('Columns in conversations table:');
    convInfo.forEach(col => {
      console.log(`   - ${col.name}: ${col.type}`);
    });
  } else {
    console.log('❌ conversations table does not exist');
  }

  // Check foreign keys
  const foreignKeys = await db.all("PRAGMA foreign_key_list(messages)");
  console.log('\n🔗 Foreign keys in messages table:');
  if (foreignKeys.length > 0) {
    foreignKeys.forEach(fk => {
      console.log(`   - ${fk.from} -> ${fk.table}.${fk.to}`);
    });
  } else {
    console.log('   No foreign keys defined');
  }

  await db.close();
}

checkMessagesSchema().catch(console.error);