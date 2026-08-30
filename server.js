const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const {
  dbRun,
  dbAll,
  dbGet,
  initializeDatabase
} = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===============================
// HEALTH CHECK
// ===============================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Hackathon Backend API is running',
    endpoints: {
      parcels: '/api/parcels'
    }
  });
});

// ===============================
// GET ALL PARCELS
// GET /api/parcels
// ===============================

app.get('/api/parcels', async (req, res, next) => {
  try {
    const rows = await dbAll('SELECT * FROM parcels');

    const formattedRows = rows.map(row => {
      let coordinates = [];

      try {
        if (typeof row.coordinates === 'string') {
          coordinates = JSON.parse(row.coordinates);
        } else if (Array.isArray(row.coordinates)) {
          coordinates = row.coordinates;
        }
      } catch (error) {
        coordinates = [];
      }

      return {
        ...row,
        coordinates
      };
    });

    res.status(200).json(formattedRows);

  } catch (error) {
    next(error);
  }
});

// ===============================
// GET SINGLE PARCEL
// GET /api/parcels/:id
// ===============================

app.get('/api/parcels/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const row = await dbGet(
      'SELECT * FROM parcels WHERE id = ?',
      [id]
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    let coordinates = [];

    try {
      if (typeof row.coordinates === 'string') {
        coordinates = JSON.parse(row.coordinates);
      }
    } catch (error) {
      coordinates = [];
    }

    res.status(200).json({
      ...row,
      coordinates
    });

  } catch (error) {
    next(error);
  }
});

// ===============================
// CREATE PARCEL
// POST /api/parcels
// ===============================

app.post('/api/parcels', async (req, res, next) => {
  try {
    const {
      id,
      title,
      coordinates,
      area_sq_ft,
      status,
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
    } = req.body;

    const generatedId = id || `p_${Date.now()}`;

    const sql = `
      INSERT INTO parcels (
        id,
        title,
        coordinates,
        area_sq_ft,
        status,
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
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      generatedId,
      title || '',
      JSON.stringify(coordinates || []),
      area_sq_ft || 0,
      status || 'vacant',
      owner_name || '',
      flat_number || '',
      rent || 0,
      phone_number || '',
      address || '',
      elevation || 0,
      number_of_floors || 0,
      building_height || 0,
      usage || '',
      volumetric_space || 0
    ];

    await dbRun(sql, params);

    res.status(201).json({
      success: true,
      message: 'Parcel added successfully!',
      id: generatedId
    });

  } catch (error) {
    next(error);
  }
});

// ===============================
// UPDATE PARCEL
// PUT /api/parcels/:id
// ===============================

app.put('/api/parcels/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingParcel = await dbGet(
      'SELECT * FROM parcels WHERE id = ?',
      [id]
    );

    if (!existingParcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const {
      title,
      coordinates,
      area_sq_ft,
      status,
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
    } = req.body;

    const sql = `
      UPDATE parcels
      SET
        title = ?,
        coordinates = ?,
        area_sq_ft = ?,
        status = ?,
        owner_name = ?,
        flat_number = ?,
        rent = ?,
        phone_number = ?,
        address = ?,
        elevation = ?,
        number_of_floors = ?,
        building_height = ?,
        usage = ?,
        volumetric_space = ?
      WHERE id = ?
    `;

    const params = [
      title ?? existingParcel.title,
      JSON.stringify(
        coordinates ?? JSON.parse(existingParcel.coordinates || '[]')
      ),
      area_sq_ft ?? existingParcel.area_sq_ft,
      status ?? existingParcel.status,
      owner_name ?? existingParcel.owner_name,
      flat_number ?? existingParcel.flat_number,
      rent ?? existingParcel.rent,
      phone_number ?? existingParcel.phone_number,
      address ?? existingParcel.address,
      elevation ?? existingParcel.elevation,
      number_of_floors ?? existingParcel.number_of_floors,
      building_height ?? existingParcel.building_height,
      usage ?? existingParcel.usage,
      volumetric_space ?? existingParcel.volumetric_space,
      id
    ];

    await dbRun(sql, params);

    const updatedParcel = await dbGet(
      'SELECT * FROM parcels WHERE id = ?',
      [id]
    );

    let parsedCoordinates = [];

    try {
      parsedCoordinates = JSON.parse(
        updatedParcel.coordinates || '[]'
      );
    } catch (error) {
      parsedCoordinates = [];
    }

    res.status(200).json({
      success: true,
      message: 'Parcel updated successfully!',
      parcel: {
        ...updatedParcel,
        coordinates: parsedCoordinates
      }
    });

  } catch (error) {
    next(error);
  }
});

// ===============================
// DELETE PARCEL
// DELETE /api/parcels/:id
// ===============================

app.delete('/api/parcels/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingParcel = await dbGet(
      'SELECT * FROM parcels WHERE id = ?',
      [id]
    );

    if (!existingParcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    await dbRun(
      'DELETE FROM parcels WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Parcel deleted successfully!',
      id
    });

  } catch (error) {
    next(error);
  }
});

// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ===============================
// CENTRAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// ===============================
// START SERVER
// ===============================

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('✅ SQLite database connected');
    });

  } catch (error) {
    console.error(
      '❌ Server failed to start:',
      error.message
    );

    process.exit(1);
  }
}

startServer();