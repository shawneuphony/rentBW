// scripts/seed-applications.cjs
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');

async function seedApplications() {
  console.log('📝 Seeding applications...');
  
  const db = await open({
    filename: path.join(__dirname, '../rentbw.db'),
    driver: sqlite3.Database
  });

  // Get users
  const tenant = await db.get("SELECT * FROM users WHERE email = 'tenant@rentbw.com'");
  const landlord = await db.get("SELECT * FROM users WHERE email = 'landlord@rentbw.com'");
  
  if (!tenant || !landlord) {
    console.log('❌ Tenant or landlord not found. Run db:init first.');
    return;
  }

  // Get properties
  const properties = await db.all(
    'SELECT * FROM properties WHERE landlord_id = ?',
    [landlord.id]
  );

  if (properties.length === 0) {
    console.log('❌ No properties found. Run seed:all first.');
    return;
  }

  // Check if applications already exist
  const existing = await db.get('SELECT COUNT(*) as count FROM applications');
  if (existing.count > 0) {
    console.log('✅ Applications already exist, skipping seed.');
    return;
  }

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const twoDays = 2 * oneDay;
  const threeDays = 3 * oneDay;
  const fiveDays = 5 * oneDay;

  const applications = [
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      property_id: properties[0].id,
      status: 'pending',
      documents: JSON.stringify(['id_document.pdf']),
      notes: 'I am very interested in this property. I work from home and need a quiet space.',
      created_at: now - oneDay,
      updated_at: now - oneDay
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      property_id: properties.length > 1 ? properties[1].id : properties[0].id,
      status: 'reviewing',
      documents: JSON.stringify(['id_document.pdf', 'proof_of_income.pdf']),
      notes: 'Please find my documents attached. Let me know if you need anything else.',
      created_at: now - threeDays,
      updated_at: now - twoDays
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      property_id: properties[0].id,
      status: 'approved',
      documents: JSON.stringify(['id_document.pdf', 'proof_of_income.pdf', 'references.pdf']),
      notes: 'Congratulations! Your application has been approved. Please contact me to arrange move-in.',
      created_at: now - fiveDays,
      updated_at: now - twoDays
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant.id,
      property_id: properties.length > 2 ? properties[2].id : properties[0].id,
      status: 'rejected',
      documents: JSON.stringify(['id_document.pdf']),
      notes: 'Thank you for your interest, but we have selected another applicant.',
      created_at: now - fiveDays,
      updated_at: now - threeDays
    }
  ];

  for (const app of applications) {
    await db.run(
      `INSERT INTO applications (
        id, tenant_id, property_id, status, documents, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [app.id, app.tenant_id, app.property_id, app.status, app.documents, app.notes, app.created_at, app.updated_at]
    );
  }

  console.log(`✅ Created ${applications.length} sample applications`);

  // Show summary
  const stats = await db.all(`
    SELECT status, COUNT(*) as count 
    FROM applications 
    WHERE tenant_id = ?
    GROUP BY status
  `, [tenant.id]);

  console.log('\n📊 Application stats:');
  stats.forEach(s => console.log(`   ${s.status}: ${s.count}`));

  await db.close();
}

seedApplications().catch(console.error);