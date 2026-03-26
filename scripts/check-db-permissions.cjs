// scripts/check-db-permissions.cjs
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, '../rentbw.db');

console.log('🔍 Checking database file...\n');

// Check if file exists
if (fs.existsSync(dbPath)) {
  console.log('✅ Database file exists');
  
  const stats = fs.statSync(dbPath);
  console.log(`   Location: ${dbPath}`);
  console.log(`   Size: ${stats.size} bytes`);
  console.log(`   Created: ${stats.birthtime}`);
  console.log(`   Modified: ${stats.mtime}`);
  console.log(`   Permissions: ${stats.mode.toString(8)}`);
  
  // Try to read the file
  try {
    const buffer = fs.readFileSync(dbPath, { encoding: 'utf8', flag: 'r' });
    console.log('✅ File is readable');
  } catch (readError) {
    console.log('❌ File is NOT readable:', readError.message);
  }
  
  // Try to write to the file (test permissions)
  try {
    fs.accessSync(dbPath, fs.constants.W_OK);
    console.log('✅ File is writable');
  } catch (writeError) {
    console.log('❌ File is NOT writable:', writeError.message);
  }
  
} else {
  console.log('❌ Database file does not exist at:', dbPath);
  console.log('   Please run: npm run db:init');
}

// Check directory permissions
const dbDir = path.dirname(dbPath);
console.log(`\n📁 Database directory: ${dbDir}`);

try {
  fs.accessSync(dbDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log('✅ Directory is readable and writable');
} catch (dirError) {
  console.log('❌ Directory permission issue:', dirError.message);
}

// Try to run a simple sqlite3 command if available
try {
  console.log('\n🔄 Trying to query database with sqlite3...');
  const result = execSync('sqlite3 rentbw.db "SELECT name FROM sqlite_master WHERE type=\'table\';"', { encoding: 'utf8' });
  console.log('✅ Tables found:');
  console.log(result);
} catch (sqliteError) {
  console.log('⚠️  Could not run sqlite3 command:', sqliteError.message);
}