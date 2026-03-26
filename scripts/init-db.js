// scripts/init-db.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

async function init() {
  console.log('🚀 Initializing database...');
  
  // Open database connection
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  console.log('📁 Creating tables...');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'tenant',
      verified INTEGER DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_exp INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      location TEXT NOT NULL,
      beds INTEGER,
      baths REAL,
      sqm REAL,
      type TEXT,
      status TEXT DEFAULT 'pending',
      featured INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      images TEXT,
      amenities TEXT,
      landlord_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (landlord_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS saved_properties (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (property_id) REFERENCES properties(id),
      UNIQUE(user_id, property_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      property_id TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      status TEXT DEFAULT 'pending',
      documents TEXT,
      notes TEXT,
      tenant_id TEXT NOT NULL,
      property_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES users(id),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    );
  `);

  console.log('✅ Tables created successfully');

  // Check if we need to insert demo users
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  
  if (userCount.count === 0) {
    console.log('👥 No users found, creating demo users...');
    
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const now = Date.now();

    const demoUsers = [
      ['1', 'tenant@rentbw.com', hashedPassword, 'Thabo Molefe', '', 'tenant', 1, now, now],
      ['2', 'landlord@rentbw.com', hashedPassword, 'James Wilson', '', 'landlord', 1, now, now],
      ['3', 'investor@rentbw.com', hashedPassword, 'Keneilwe Molefe', '', 'investor', 1, now, now],
      ['4', 'admin@rentbw.com', hashedPassword, 'Admin User', '', 'admin', 1, now, now],
    ];

    for (const user of demoUsers) {
      await db.run(
        `INSERT INTO users (id, email, password, name, phone, role, verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        user
      );
    }

    console.log('✅ Demo users created successfully');
  } else {
    console.log('👥 Users already exist, skipping demo creation');
  }

  // List all users
  const users = await db.all('SELECT id, email, name, role, verified FROM users');
  console.log('\n📋 Current users in database:');
  console.table(users);

  await db.close();
  console.log('\n✨ Database initialization complete!');
}

init().catch(error => {
  console.error('❌ Error initializing database:', error);
  process.exit(1);
});