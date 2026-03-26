// scripts/seed-investor-data.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');

async function seedInvestorData() {
  console.log('📊 Seeding investor data...');
  
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  // Get landlord
  const landlord = await db.get("SELECT * FROM users WHERE email = 'landlord@rentbw.com'");
  
  if (!landlord) {
    console.log('❌ Landlord not found. Run db:init first.');
    return;
  }

  // Check if we already have properties
  const existingProps = await db.get('SELECT COUNT(*) as count FROM properties');
  
  if (existingProps.count > 0) {
    console.log('✅ Properties already exist, skipping seed.');
  } else {
    console.log('📁 Creating sample properties...');
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneMonth = 30 * oneDay;

    const properties = [
      {
        id: crypto.randomUUID(),
        title: 'Modern Office Tower - CBD',
        description: 'Prime office space in the heart of Gaborone CBD. 15 floors of modern office space with panoramic views.',
        price: 4500000,
        location: 'CBD, Gaborone',
        beds: 0,
        baths: 4,
        sqm: 850,
        type: 'commercial',
        status: 'active',
        featured: 1,
        verified: 1,
        views: 1240,
        images: JSON.stringify(['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80']),
        amenities: JSON.stringify(['elevator', 'parking', 'security', 'cafeteria']),
        landlord_id: landlord.id,
        created_at: now - (2 * oneMonth),
        updated_at: now - (2 * oneMonth)
      },
      {
        id: crypto.randomUUID(),
        title: 'Phakalane Industrial Park - Unit B',
        description: 'Modern warehouse and distribution center with high ceilings and loading bays.',
        price: 1800000,
        location: 'Phakalane, Gaborone',
        beds: 0,
        baths: 2,
        sqm: 1200,
        type: 'commercial',
        status: 'active',
        featured: 1,
        verified: 1,
        views: 890,
        images: JSON.stringify(['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80']),
        amenities: JSON.stringify(['loading bay', 'security', 'generator', 'office space']),
        landlord_id: landlord.id,
        created_at: now - (3 * oneMonth),
        updated_at: now - (3 * oneMonth)
      },
      {
        id: crypto.randomUUID(),
        title: 'Broadhurst Retail Plaza',
        description: 'Mixed-use retail center with multiple storefronts and ample parking.',
        price: 3200000,
        location: 'Broadhurst, Gaborone',
        beds: 0,
        baths: 6,
        sqm: 950,
        type: 'commercial',
        status: 'active',
        featured: 0,
        verified: 1,
        views: 675,
        images: JSON.stringify(['https://images.unsplash.com/photo-1519567770579-c2fc5436bcf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80']),
        amenities: JSON.stringify(['parking', 'security', 'storefronts', 'signage']),
        landlord_id: landlord.id,
        created_at: now - (1 * oneMonth),
        updated_at: now - (1 * oneMonth)
      },
      {
        id: crypto.randomUUID(),
        title: 'G-West Light Industrial Units',
        description: 'Flexible light industrial units perfect for workshops and small manufacturing.',
        price: 950000,
        location: 'G-West, Gaborone',
        beds: 0,
        baths: 1,
        sqm: 450,
        type: 'commercial',
        status: 'active',
        featured: 0,
        verified: 1,
        views: 543,
        images: JSON.stringify(['https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80']),
        amenities: JSON.stringify(['roller door', '3-phase power', 'security']),
        landlord_id: landlord.id,
        created_at: now - (45 * oneDay),
        updated_at: now - (45 * oneDay)
      },
      {
        id: crypto.randomUUID(),
        title: 'Block 8 Commercial Center',
        description: 'Corner commercial property with high visibility and traffic.',
        price: 2150000,
        location: 'Block 8, Gaborone',
        beds: 0,
        baths: 2,
        sqm: 620,
        type: 'commercial',
        status: 'active',
        featured: 0,
        verified: 1,
        views: 432,
        images: JSON.stringify(['https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80']),
        amenities: JSON.stringify(['parking', 'signage', 'air conditioning']),
        landlord_id: landlord.id,
        created_at: now - (20 * oneDay),
        updated_at: now - (20 * oneDay)
      },
      {
        id: crypto.randomUUID(),
        title: 'Executive 4-Bedroom Home - Phakalane',
        description: 'Luxurious family home with pool and large garden in prestigious neighborhood.',
        price: 25000,
        location: 'Phakalane, Gaborone',
        beds: 4,
        baths: 3,
        sqm: 380,
        type: 'house',
        status: 'active',
        featured: 1,
        verified: 1,
        views: 2150,
        images: JSON.stringify(['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80']),
        amenities: JSON.stringify(['pool', 'garden', 'staff quarters', 'double garage']),
        landlord_id: landlord.id,
        created_at: now - (10 * oneDay),
        updated_at: now - (10 * oneDay)
      }
    ];

    for (const prop of properties) {
      await db.run(
        `INSERT INTO properties (
          id, title, description, price, location, beds, baths, sqm, 
          type, status, featured, verified, views, images, amenities, 
          landlord_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prop.id, prop.title, prop.description, prop.price, prop.location,
          prop.beds, prop.baths, prop.sqm, prop.type, prop.status, 
          prop.featured, prop.verified, prop.views, prop.images, prop.amenities,
          prop.landlord_id, prop.created_at, prop.updated_at
        ]
      );
    }

    console.log(`✅ Created ${properties.length} sample properties`);
  }

  // Add some saved properties for metrics
  const tenant = await db.get("SELECT * FROM users WHERE email = 'tenant@rentbw.com'");
  
  if (tenant) {
    const properties = await db.all('SELECT id FROM properties LIMIT 3');
    
    for (const prop of properties) {
      const existing = await db.get(
        'SELECT * FROM saved_properties WHERE user_id = ? AND property_id = ?',
        [tenant.id, prop.id]
      );
      
      if (!existing) {
        await db.run(
          'INSERT INTO saved_properties (id, user_id, property_id, created_at) VALUES (?, ?, ?, ?)',
          [crypto.randomUUID(), tenant.id, prop.id, Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)]
        );
      }
    }
    console.log('✅ Added sample saved properties');
  }

  // Get final stats
  const stats = await db.get(`
    SELECT 
      COUNT(*) as total_properties,
      AVG(price) as avg_price,
      SUM(price) as total_value
    FROM properties 
    WHERE status = 'active'
  `);

  console.log('\n📊 Market Statistics:');
  console.log(`   Total Properties: ${stats.total_properties}`);
  console.log(`   Average Price: BWP ${Math.round(stats.avg_price).toLocaleString()}`);
  console.log(`   Total Market Value: BWP ${Math.round(stats.total_value / 1000000)}M`);

  await db.close();
}

seedInvestorData().catch(console.error);