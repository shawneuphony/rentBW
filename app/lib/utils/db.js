// app/lib/utils/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let db = null;

export async function getDb() {
  if (db) return db;

  console.log('📁 Opening database connection...');

  db = await open({
    filename: path.join(__dirname, '../../../rentbw.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'tenant',
      verified INTEGER DEFAULT 0,
      avatar TEXT,
      id_document TEXT,
      id_document_status TEXT DEFAULT 'none',
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

    CREATE TABLE IF NOT EXISTS property_views (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (property_id) REFERENCES properties(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      property_id TEXT,
      parent_id TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id),
      FOREIGN KEY (property_id) REFERENCES properties(id),
      FOREIGN KEY (parent_id) REFERENCES messages(id)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, read, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_property ON messages(property_id);

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

  // Migrations: add columns if they don't exist
  const userCols = await db.all("PRAGMA table_info(users)");
  const colNames = userCols.map(c => c.name);
  if (!colNames.includes('avatar')) await db.run("ALTER TABLE users ADD COLUMN avatar TEXT");
  if (!colNames.includes('id_document')) await db.run("ALTER TABLE users ADD COLUMN id_document TEXT");
  if (!colNames.includes('id_document_status')) await db.run("ALTER TABLE users ADD COLUMN id_document_status TEXT DEFAULT 'none'");

  // Migrations: properties table
  const propCols = await db.all("PRAGMA table_info(properties)");
  const propColNames = propCols.map(c => c.name);
  if (!propColNames.includes('lease_url')) await db.run("ALTER TABLE properties ADD COLUMN lease_url TEXT DEFAULT ''");
  if (!propColNames.includes('views')) await db.run("ALTER TABLE properties ADD COLUMN views INTEGER DEFAULT 0");

  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('👥 No users found, creating demo users...');
    await createDemoUsers(db);
  }

  return db;
}

async function createDemoUsers(db) {
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const now = Date.now();

  const demoUsers = [
    ['1', 'tenant@rentbw.com',   hashedPassword, 'Thabo Molefe',    '', 'tenant',   1, now, now],
    ['2', 'landlord@rentbw.com', hashedPassword, 'James Wilson',    '', 'landlord', 1, now, now],
    ['3', 'investor@rentbw.com', hashedPassword, 'Keneilwe Molefe', '', 'investor', 1, now, now],
    ['4', 'admin@rentbw.com',    hashedPassword, 'Admin User',      '', 'admin',    1, now, now],
  ];

  for (const user of demoUsers) {
    await db.run(
      `INSERT INTO users (id, email, password, name, phone, role, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      user
    );
  }

  console.log('✅ Demo users created successfully');
}

export async function createUser(userData) {
  const db = await getDb();
  const id = crypto.randomUUID();
  const now = Date.now();

  await db.run(
    `INSERT INTO users (id, email, password, name, phone, role, verified, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userData.email, userData.password, userData.name, userData.phone || '', userData.role || 'tenant', 0, now, now]
  );

  return getUserById(id);
}

export async function getUserByEmail(email) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE email = ?', email);
}

export async function getUserById(id) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE id = ?', id);
}

export async function updateUser(id, updates) {
  const db = await getDb();
  const now = Date.now();

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return getUserById(id);
}

export async function verifyUser(email, token) {
  const db = await getDb();
  const user = await db.get(
    'SELECT * FROM users WHERE email = ? AND verification_token = ?',
    [email, token]
  );

  if (user) {
    await db.run(
      'UPDATE users SET verified = 1, verification_token = NULL WHERE id = ?',
      user.id
    );
    return true;
  }

  return false;
}