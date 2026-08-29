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
  `, (err) => {
    if (err) {
      console.error('❌ Table Creation Error:', err.message);
    } else {
      console.log('✅ "parcels" table ready!');
      
      // Auto Seed Data immediately after table confirmation
      db.get("SELECT COUNT(*) AS count FROM parcels", [], (err, row) => {
        if (!err && row && row.count === 0) {
          const initialParcels = [
            { id: 'p101', title: 'Sunrise Villa', coordinates: [77.5946, 12.9716], area_sq_ft: 1200, status: 'occupied', owner_name: 'Rahul Sharma', flat_number: '101', rent: 15000, phone_number: '9876543210', address: 'MG Road, Bangalore', elevation: 920, number_of_floors: 3, building_height: 12.5, usage: 'Residential', volumetric_space: 4500 },
            { id: 'p102', title: 'Green Acres', coordinates: [77.6000, 12.9750], area_sq_ft: 2500, status: 'vacant', owner_name: 'Priya Singh', flat_number: '202', rent: 25000, phone_number: '9876543211', address: 'Indiranagar, Bangalore', elevation: 915, number_of_floors: 2, building_height: 8.0, usage: 'Commercial', volumetric_space: 8000 },
            { id: 'p103', title: 'Ocean View', coordinates: [77.6100, 12.9800], area_sq_ft: 1800, status: 'vacant', owner_name: 'Amit Kumar', flat_number: '303', rent: 20000, phone_number: '9876543212', address: 'Koramangala, Bangalore', elevation: 910, number_of_floors: 4, building_height: 15.0, usage: 'Mixed', volumetric_space: 6200 }
          ];

          const sql = `
            INSERT INTO parcels (
              id, title, coordinates, area_sq_ft, status, owner_name,
              flat_number, rent, phone_number, address, elevation,
              number_of_floors, building_height, usage, volumetric_space
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          initialParcels.forEach(p => {
            db.run(sql, [
              p.id, p.title, JSON.stringify(p.coordinates), p.area_sq_ft, p.status, p.owner_name,
              p.flat_number, p.rent, p.phone_number, p.address, p.elevation,
              p.number_of_floors, p.building_height, p.usage, p.volumetric_space
            ]);
          });
          console.log("🌱 Default parcels successfully seeded!");
        }
      });
    }
  });
});

module.exports = db;