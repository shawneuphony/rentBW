// scripts/seed-messages.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

async function seedMessages() {
  console.log('📨 Seeding messages (marked as read)...');
  
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  // Get or create tenant and landlord
  let tenant = await db.get("SELECT * FROM users WHERE email = 'tenant@rentbw.com'");
  let landlord = await db.get("SELECT * FROM users WHERE email = 'landlord@rentbw.com'");
  
  if (!tenant || !landlord) {
    console.log('Creating tenant and landlord users...');
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const now = Date.now();
    
    const tenantId = crypto.randomUUID();
    const landlordId = crypto.randomUUID();
    
    await db.run(
      `INSERT INTO users (id, email, password, name, phone, role, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, 'tenant@rentbw.com', hashedPassword, 'Thabo Molefe', '+267 71 234 567', 'tenant', 1, now, now]
    );
    await db.run(
      `INSERT INTO users (id, email, password, name, phone, role, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [landlordId, 'landlord@rentbw.com', hashedPassword, 'James Wilson', '+267 72 345 678', 'landlord', 1, now, now]
    );
    tenant = await db.get("SELECT * FROM users WHERE email = 'tenant@rentbw.com'");
    landlord = await db.get("SELECT * FROM users WHERE email = 'landlord@rentbw.com'");
  }

  // Ensure landlord has at least one property
  let properties = await db.all('SELECT * FROM properties WHERE landlord_id = ?', [landlord.id]);
  if (properties.length === 0) {
    console.log('Creating sample property...');
    const propertyId = crypto.randomUUID();
    await db.run(
      `INSERT INTO properties (id, title, description, price, location, beds, baths, sqm, type, status, landlord_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [propertyId, 'Modern 2-Bedroom Apartment', 'Beautiful apartment in Phakalane', 7500, 'Phakalane, Gaborone', 2, 1, 85, 'apartment', 'active', landlord.id, Date.now(), Date.now()]
    );
    properties = await db.all('SELECT * FROM properties WHERE landlord_id = ?', [landlord.id]);
  }

  // Delete any existing messages to avoid duplicates
  await db.run('DELETE FROM messages');
  console.log('Cleared existing messages.');

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const messages = [
    {
      id: crypto.randomUUID(),
      content: "Hi, I'm interested in your property. Is it still available?",
      read: 1,   // <-- marked as read
      sender_id: tenant.id,
      receiver_id: landlord.id,
      property_id: properties[0].id,
      created_at: now - oneDay
    },
    {
      id: crypto.randomUUID(),
      content: "What are the pet requirements? I have a small dog.",
      read: 1,
      sender_id: tenant.id,
      receiver_id: landlord.id,
      property_id: properties[0].id,
      created_at: now - (2 * oneDay)
    },
    {
      id: crypto.randomUUID(),
      content: "Is parking included in the rent?",
      read: 1,
      sender_id: tenant.id,
      receiver_id: landlord.id,
      property_id: properties[0].id,
      created_at: now - (3 * oneDay)
    }
  ];

  for (const msg of messages) {
    await db.run(
      `INSERT INTO messages (id, content, read, sender_id, receiver_id, property_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [msg.id, msg.content, msg.read, msg.sender_id, msg.receiver_id, msg.property_id, msg.created_at]
    );
  }

  console.log(`✅ Created ${messages.length} sample messages (all marked as read).`);
  console.log('📊 Unread message count should now be 0.');
  await db.close();
}

seedMessages().catch(console.error);