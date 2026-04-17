const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function test() {
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  const userId = '1';

  try {
    console.log('Running queries...');
    const [saved, applications, unread] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM saved_properties WHERE user_id = ?', userId),
      db.get('SELECT COUNT(*) as count FROM applications WHERE tenant_id = ?', userId),
      db.get('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND "read" = 0', userId),
    ]);

    console.log('Results:', { saved, applications, unread });
  } catch (err) {
    console.error('Error during queries:', err);
  } finally {
    await db.close();
  }
}

test();
