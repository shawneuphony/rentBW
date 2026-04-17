const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function addColumn() {
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  try {
    await db.run("ALTER TABLE users ADD COLUMN id_document_status TEXT DEFAULT 'none'");
    console.log('✅ Added id_document_status column');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('ℹ️ Column already exists');
    } else {
      console.error('Error:', err);
    }
  }
  await db.close();
}

addColumn();