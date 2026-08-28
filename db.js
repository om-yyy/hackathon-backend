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

// Auto-create Tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS parcels (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      coordinates TEXT NOT NULL,
      area_sq_ft REAL,
      status TEXT DEFAULT 'vacant',
      owner_name TEXT
    )
  `, (err) => {
    if (err) {
      console.error('❌ Table Creation Error:', err.message);
    } else {
      console.log('✅ "parcels" table ready!');
    }
  });
});

module.exports = db;