const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// Auto-seed function: Jab Render restart hoga, tab default parcels add honge
const seedDefaultParcels = () => {
  const initialParcels = [
    { id: 'p101', title: 'Sunrise Villa', coordinates: [77.5946, 12.9716], area_sq_ft: 1200, status: 'occupied', owner_name: 'Rahul Sharma' },
    { id: 'p102', title: 'Green Acres', coordinates: [77.6000, 12.9750], area_sq_ft: 2500, status: 'vacant', owner_name: 'Priya Singh' },
    { id: 'p103', title: 'Ocean View', coordinates: [77.6100, 12.9800], area_sq_ft: 1800, status: 'vacant', owner_name: 'Amit Kumar' }
  ];

  db.get("SELECT COUNT(*) AS count FROM parcels", [], (err, row) => {
    if (!err && row && row.count === 0) {
      console.log("Database empty hai, seed data add ho raha hai...");
      const sql = `INSERT INTO parcels (id, title, coordinates, area_sq_ft, status, owner_name) VALUES (?, ?, ?, ?, ?, ?)`;
      
      initialParcels.forEach(p => {
        db.run(sql, [p.id, p.title, JSON.stringify(p.coordinates), p.area_sq_ft, p.status, p.owner_name]);
      });
      console.log("✅ Default seed data add ho gaya!");
    }
  });
};

// Check and run seed on startup
seedDefaultParcels();

// 1. Get all parcels
app.get('/api/parcels', (req, res) => {
  db.all('SELECT * FROM parcels', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ parcels: rows });
  });
});

// 2. Add a new parcel
app.post('/api/parcels', (req, res) => {
  const { id, title, coordinates, area_sq_ft, status, owner_name } = req.body;
  const sql = `INSERT INTO parcels (id, title, coordinates, area_sq_ft, status, owner_name) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [id, title, JSON.stringify(coordinates), area_sq_ft, status || 'vacant', owner_name];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Parcel added successfully!', id });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});