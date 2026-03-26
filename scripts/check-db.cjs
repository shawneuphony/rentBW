// scripts/check-db.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkDB() {
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  console.log('\n📊 DATABASE STATISTICS');
  console.log('=====================\n');

  // Users
  const users = await db.all('SELECT id, email, name, role, verified FROM users');
  console.log(`👥 Users (${users.length}):`);
  users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

  // Properties
  const properties = await db.all('SELECT id, title, price, status FROM properties');
  console.log(`\n🏠 Properties (${properties.length}):`);
  properties.forEach(p => console.log(`   - ${p.title}: BWP ${p.price} (${p.status})`));

  // Messages
  const messages = await db.all(`
    SELECT m.*, u.name as sender, p.title as property 
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    LEFT JOIN properties p ON m.property_id = p.id
    ORDER BY m.created_at DESC
  `);
  
  console.log(`\n💬 Messages (${messages.length}):`);
  messages.forEach((m, i) => {
    console.log(`\n   ${i+1}. From: ${m.sender}`);
    console.log(`      To: ${m.receiver_id}`);
    console.log(`      Property: ${m.property || 'N/A'}`);
    console.log(`      Message: ${m.content.substring(0, 50)}...`);
    console.log(`      Read: ${m.read ? 'Yes' : 'No'}`);
    console.log(`      Time: ${new Date(m.created_at).toLocaleString()}`);
  });

  // Saved Properties
  const saved = await db.all('SELECT COUNT(*) as count FROM saved_properties');
  console.log(`\n❤️ Saved Properties: ${saved[0].count}`);

  await db.close();
}

checkDB();