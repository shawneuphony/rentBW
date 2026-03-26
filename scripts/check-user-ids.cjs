// scripts/check-user-ids.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkUserIds() {
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  console.log('📋 Users in database:');
  console.log('=====================');
  
  const users = await db.all('SELECT id, email, role FROM users');
  
  users.forEach(user => {
    console.log(`\nEmail: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID Type: ${typeof user.id}`);
    console.log(`   ID Length: ${user.id.length}`);
  });

  await db.close();
}

checkUserIds();