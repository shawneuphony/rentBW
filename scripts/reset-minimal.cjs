// scripts/reset-minimal.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function resetMinimal() {
  console.log('🔄 Creating minimal database...');
  
  const dbPath = path.join(__dirname, '../rentbw.db');
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create ONLY essential tables for now
  await db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'tenant',
      verified INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      location TEXT NOT NULL,
      landlord_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (landlord_id) REFERENCES users(id)
    );
  `);

  // Create demo users
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const now = Date.now();

  const users = [
    {
      id: crypto.randomUUID(),
      email: 'tenant@rentbw.com',
      password: hashedPassword,
      name: 'Thabo Molefe',
      role: 'tenant'
    },
    {
      id: crypto.randomUUID(),
      email: 'landlord@rentbw.com',
      password: hashedPassword,
      name: 'James Wilson',
      role: 'landlord'
    },
    {
      id: crypto.randomUUID(),
      email: 'investor@rentbw.com',
      password: hashedPassword,
      name: 'Keneilwe Molefe',
      role: 'investor'
    },
    {
      id: crypto.randomUUID(),
      email: 'admin@rentbw.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin'
    }
  ];

  for (const user of users) {
    await db.run(
      `INSERT INTO users (id, email, password, name, role, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.password, user.name, user.role, 1, now, now]
    );
  }

  console.log('✅ Database created with users');

  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  console.log(`📊 Users in database: ${userCount.count}`);

  await db.close();
}

resetMinimal().catch(console.error);