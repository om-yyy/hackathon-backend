const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// 1. Get all parcels
app.get('/api/parcels', (req, res) => {
  db.all('SELECT * FROM parcels', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Coordinates ko parse karna aur format sahi karna
    const formattedRows = rows.map(row => {
      let parsedCoords = row.coordinates;
      try {
        if (typeof row.coordinates === 'string') {
          parsedCoords = JSON.parse(row.coordinates);
        }
      } catch (e) {
        parsedCoords = [];
      }
      return { ...row, coordinates: parsedCoords };
    });

    // Frontend ke liye direct Array [] bhejna
    res.json(formattedRows);
  });
});

// 2. Add a new parcel
app.post('/api/parcels', (req, res) => {
  const {
    id, title, coordinates, area_sq_ft, status, owner_name,
    flat_number, rent, phone_number, address, elevation,
    number_of_floors, building_height, usage, volumetric_space
  } = req.body;

  const sql = `
    INSERT INTO parcels (
      id, title, coordinates, area_sq_ft, status, owner_name,
      flat_number, rent, phone_number, address, elevation,
      number_of_floors, building_height, usage, volumetric_space
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    id || `p_${Date.now()}`,
    title,
    JSON.stringify(coordinates || []),
    area_sq_ft,
    status || 'vacant',
    owner_name,
    flat_number,
    rent,
    phone_number,
    address,
    elevation,
    number_of_floors,
    building_height,
    usage,
    volumetric_space
  ];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Parcel added successfully!', id: id || this.lastID });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});