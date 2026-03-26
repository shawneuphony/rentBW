// scripts/test-auth.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testAuth() {
  console.log('🔐 Testing Authentication System...\n');

  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  // Check if users table exists
  const tables = await db.all(`
    SELECT name FROM sqlite_master WHERE type='table'
  `);
  
  console.log('📊 Tables in database:');
  tables.forEach(t => console.log(`   - ${t.name}`));

  // Check users
  const users = await db.all('SELECT id, email, name, role FROM users');
  console.log(`\n👥 Users found: ${users.length}`);
  users.forEach(u => {
    console.log(`   - ${u.email} (${u.role})`);
  });

  if (users.length === 0) {
    console.log('\n❌ No users found. Creating test user...');
    
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const id = require('crypto').randomUUID();
    const now = Date.now();

    await db.run(
      `INSERT INTO users (id, email, password, name, role, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, 'test@rentbw.com', hashedPassword, 'Test User', 'tenant', 1, now, now]
    );
    
    console.log('✅ Test user created: test@rentbw.com / password123');
  }

  // Test JWT
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  console.log('\n🔑 JWT Secret:', JWT_SECRET.substring(0, 5) + '...');

  // Test token generation
  if (users.length > 0) {
    const token = jwt.sign(
      { id: users[0].id, email: users[0].email, role: users[0].role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ Token generation successful');
    console.log('   Token preview:', token.substring(0, 30) + '...');

    // Test token verification
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verification successful');
      console.log('   Decoded:', decoded);
    } catch (err) {
      console.log('❌ Token verification failed:', err.message);
    }
  }

  await db.close();
}

testAuth().catch(console.error);