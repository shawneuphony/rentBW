const { getDb } = require('./app/lib/utils/db');

async function test() {
  try {
    const db = await getDb();
    const userId = '1'; // Default tenant id from createDemoUsers
    console.log('Testing stats for user_id:', userId);
    
    const [saved, applications, unread] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM saved_properties WHERE user_id = ?', userId),
      db.get('SELECT COUNT(*) as count FROM applications WHERE tenant_id = ?', userId),
      db.get('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read = 0', userId),
    ]);

    console.log('Stats:', {
      savedProperties:    saved.count,
      activeApplications: applications.count,
      unreadMessages:     unread.count,
    });
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
