const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const dbPath = process.env.DATABASE_URL || 'sqlite.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database Connection Error:', err.message);
  } else {
    console.log('✅ Connected to Local SQLite Database successfully!');
  }
});

db.serialize(() => {
  // Table create na ho to naye schema se banayein
  db.run(`
    CREATE TABLE IF NOT EXISTS parcels (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      coordinates TEXT NOT NULL,
      area_sq_ft REAL,
      status TEXT DEFAULT 'vacant',
      owner_name TEXT,
      flat_number TEXT,
      rent REAL,
      phone_number TEXT,
      address TEXT,
      elevation REAL,
      number_of_floors INTEGER,
      building_height REAL,
      usage TEXT,
      volumetric_space REAL
    )
  `);

  // Render par purani DB file me missing columns add karne ke liye auto-alter query
  const missingColumns = [
    "flat_number TEXT", "rent REAL", "phone_number TEXT", 
    "address TEXT", "elevation REAL", "number_of_floors INTEGER", 
    "building_height REAL", "usage TEXT", "volumetric_space REAL"
  ];

  missingColumns.forEach(col => {
    db.run(`ALTER TABLE parcels ADD COLUMN ${col}`, (err) => {
      // Ignore error if column already exists
    });
  });
});

module.exports = db;