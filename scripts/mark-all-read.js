// scripts/mark-all-read.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function markAllRead() {
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  const result = await db.run('UPDATE messages SET read = 1');
  console.log(`✅ Marked ${result.changes} messages as read.`);
  await db.close();
}

markAllRead().catch(console.error);