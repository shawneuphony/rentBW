// scripts/seed-messages.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

async function seedMessages() {
  console.log('📨 Seeding messages...');
  
  // Open database connection
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  // Get users
  const tenant = await db.get("SELECT * FROM users WHERE email = 'tenant@rentbw.com'");
  const landlord = await db.get("SELECT * FROM users WHERE email = 'landlord@rentbw.com'");
  
  if (!tenant || !landlord) {
    console.log('❌ Tenant or landlord not found. Creating users first...');
    
    // Create users if they don't exist
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
    
    console.log('✅ Created tenant and landlord users');
  }

  // Get fresh user IDs
  const tenantUser = await db.get("SELECT * FROM users WHERE email = 'tenant@rentbw.com'");
  const landlordUser = await db.get("SELECT * FROM users WHERE email = 'landlord@rentbw.com'");

  // Get landlord's properties
  let properties = await db.all(
    'SELECT * FROM properties WHERE landlord_id = ?',
    [landlordUser.id]
  );

  if (properties.length === 0) {
    console.log('⚠️ No properties found. Creating sample properties...');
    
    const now = Date.now();
    const propertyIds = [];
    
    // Create sample properties
    for (let i = 0; i < 3; i++) {
      const propertyId = crypto.randomUUID();
      propertyIds.push(propertyId);
      
      const titles = [
        'Modern 2-Bedroom Apartment in Phakalane',
        'Executive 3-Bedroom House with Garden',
        'Modern Studio in CBD'
      ];
      
      const locations = [
        'Phakalane, Phase 2',
        'Block 8, Gaborone',
        'Gaborone CBD'
      ];
      
      const prices = [7500, 12000, 4200];
      const beds = [2, 3, 1];
      const baths = [1, 2, 1];
      const sqm = [85, 210, 45];
      const types = ['apartment', 'house', 'studio'];
      
      await db.run(
        `INSERT INTO properties (
          id, title, description, price, location, beds, baths, sqm, 
          type, status, featured, verified, images, amenities, landlord_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          propertyId,
          titles[i],
          'Beautiful property with modern finishes and great location.',
          prices[i],
          locations[i],
          beds[i],
          baths[i],
          sqm[i],
          types[i],
          'active',
          i === 0 ? 1 : 0,
          i === 0 ? 1 : 0,
          JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80']),
          JSON.stringify(['parking', 'security', i === 1 ? 'garden' : 'pool']),
          landlordUser.id,
          now - (i * 24 * 60 * 60 * 1000),
          now - (i * 24 * 60 * 60 * 1000)
        ]
      );
    }
    
    properties = await db.all(
      'SELECT * FROM properties WHERE landlord_id = ?',
      [landlordUser.id]
    );
    
    console.log(`✅ Created ${properties.length} sample properties`);
  }

  // Check if messages already exist
  const existingMessages = await db.get('SELECT COUNT(*) as count FROM messages');
  
  if (existingMessages.count > 0) {
    console.log('✅ Messages already exist, skipping seed.');
    
    // Show current messages
    const messages = await db.all(`
      SELECT m.*, u.name as sender_name, p.title as property_title
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN properties p ON m.property_id = p.id
      WHERE m.receiver_id = ?
      ORDER BY m.created_at DESC
    `, [landlordUser.id]);
    
    console.log(`\n📊 Current messages for landlord:`);
    messages.forEach((msg, i) => {
      console.log(`\n${i + 1}. From: ${msg.sender_name}`);
      console.log(`   Property: ${msg.property_title || 'General'}`);
      console.log(`   Message: ${msg.content}`);
      console.log(`   Read: ${msg.read ? 'Yes' : 'No'}`);
      console.log(`   Date: ${new Date(msg.created_at).toLocaleString()}`);
    });
    
    await db.close();
    return;
  }

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const twoDays = 2 * oneDay;

  // Create sample messages
  const messages = [
    {
      id: crypto.randomUUID(),
      content: "Hi, I'm interested in your property. Is it still available for viewing this weekend?",
      read: 0,
      sender_id: tenantUser.id,
      receiver_id: landlordUser.id,
      property_id: properties[0].id,
      created_at: now - oneDay
    },
    {
      id: crypto.randomUUID(),
      content: "What are the pet requirements? I have a small dog.",
      read: 1,
      sender_id: tenantUser.id,
      receiver_id: landlordUser.id,
      property_id: properties[0].id,
      created_at: now - twoDays
    },
    {
      id: crypto.randomUUID(),
      content: "Is parking included in the rent? Looking forward to hearing from you.",
      read: 0,
      sender_id: tenantUser.id,
      receiver_id: landlordUser.id,
      property_id: properties.length > 1 ? properties[1].id : properties[0].id,
      created_at: now - (30 * 60 * 1000) // 30 minutes ago
    },
    {
      id: crypto.randomUUID(),
      content: "I'd like to schedule a viewing for this Saturday. Are you available at 10 AM?",
      read: 0,
      sender_id: tenantUser.id,
      receiver_id: landlordUser.id,
      property_id: properties[0].id,
      created_at: now - (2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: crypto.randomUUID(),
      content: "Thank you for your response. I'd love to see the property. Does this Sunday work?",
      read: 0,
      sender_id: tenantUser.id,
      receiver_id: landlordUser.id,
      property_id: properties[0].id,
      created_at: now - (45 * 60 * 1000) // 45 minutes ago
    }
  ];

  for (const msg of messages) {
    await db.run(
      `INSERT INTO messages (id, content, read, sender_id, receiver_id, property_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [msg.id, msg.content, msg.read, msg.sender_id, msg.receiver_id, msg.property_id, msg.created_at]
    );
  }

  console.log(`✅ Created ${messages.length} sample messages`);

  // Show summary
  const stats = await db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN read = 0 THEN 1 ELSE 0 END) as unread
    FROM messages 
    WHERE receiver_id = ?
  `, [landlordUser.id]);

  console.log(`📊 Message stats: ${stats.total} total, ${stats.unread} unread`);
  
  // Show the messages
  const newMessages = await db.all(`
    SELECT m.*, u.name as sender_name, p.title as property_title
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    LEFT JOIN properties p ON m.property_id = p.id
    WHERE m.receiver_id = ?
    ORDER BY m.created_at DESC
  `, [landlordUser.id]);
  
  console.log(`\n📋 Messages for landlord:`);
  newMessages.forEach((msg, i) => {
    console.log(`\n${i + 1}. From: ${msg.sender_name}`);
    console.log(`   Property: ${msg.property_title || 'General'}`);
    console.log(`   Message: ${msg.content}`);
    console.log(`   Read: ${msg.read ? 'Yes' : 'No'}`);
    console.log(`   Time: ${new Date(msg.created_at).toLocaleString()}`);
  });

  await db.close();
}

seedMessages().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});