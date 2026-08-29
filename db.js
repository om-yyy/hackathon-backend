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

// Auto-create Tables & Seed Initial Data
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
      
      // Auto Seed Data immediately after table confirmation
      db.get("SELECT COUNT(*) AS count FROM parcels", [], (err, row) => {
        if (!err && row && row.count === 0) {
          const initialParcels = [
            { id: 'p101', title: 'Sunrise Villa', coordinates: [77.5946, 12.9716], area_sq_ft: 1200, status: 'occupied', owner_name: 'Rahul Sharma' },
            { id: 'p102', title: 'Green Acres', coordinates: [77.6000, 12.9750], area_sq_ft: 2500, status: 'vacant', owner_name: 'Priya Singh' },
            { id: 'p103', title: 'Ocean View', coordinates: [77.6100, 12.9800], area_sq_ft: 1800, status: 'vacant', owner_name: 'Amit Kumar' }
          ];

          const sql = `INSERT INTO parcels (id, title, coordinates, area_sq_ft, status, owner_name) VALUES (?, ?, ?, ?, ?, ?)`;
          
          initialParcels.forEach(p => {
            db.run(sql, [p.id, p.title, JSON.stringify(p.coordinates), p.area_sq_ft, p.status, p.owner_name]);
          });
          console.log("🌱 Default parcels successfully seeded!");
        }
      });
    }
  });
});

module.exports = db;