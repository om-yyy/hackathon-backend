const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// =========================
// HEALTH CHECK
// =========================
app.get('/', (req, res) => {
  res.json({
    message: 'Hackathon Backend API is running!',
    status: 'success'
  });
});

// ============================================================
// 1. GET ALL PARCELS
// GET /api/parcels
// ============================================================
app.get('/api/parcels', (req, res) => {
  const sql = 'SELECT * FROM parcels';

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('GET ALL ERROR:', err.message);

      return res.status(500).json({
        success: false,
        error: err.message
      });
    }

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
  });
});

// ============================================================
// 2. GET SINGLE PARCEL
// GET /api/parcels/:id
// ============================================================
app.get('/api/parcels/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM parcels WHERE id = ?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('GET BY ID ERROR:', err.message);

      return res.status(500).json({
        success: false,
        error: err.message
      });
    }

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

    const parcel = {
      ...row,
      coordinates
    };

    res.status(200).json(parcel);
  });
});

// ============================================================
// 3. CREATE PARCEL
// POST /api/parcels
// ============================================================
app.post('/api/parcels', (req, res) => {
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

  // Basic validation
  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'title is required'
    });
  }

  if (!owner_name) {
    return res.status(400).json({
      success: false,
      message: 'owner_name is required'
    });
  }

  if (!area_sq_ft) {
    return res.status(400).json({
      success: false,
      message: 'area_sq_ft is required'
    });
  }

  const generatedId = id || `p_${Date.now()}`;

  const sql = `
    INSERT INTO parcels (
      id,
      title,
      owner_name,
      area_sq_ft,
      status,
      coordinates,
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
    title,
    owner_name,
    area_sq_ft,
    status || 'vacant',
    JSON.stringify(coordinates || []),
    flat_number || null,
    rent ?? null,
    phone_number || null,
    address || null,
    elevation ?? null,
    number_of_floors ?? null,
    building_height ?? null,
    usage || null,
    volumetric_space ?? null
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('POST ERROR:', err.message);

      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Parcel added successfully!',
      id: generatedId
    });
  });
});

// ============================================================
// 4. UPDATE PARCEL
// PUT /api/parcels/:id
// ============================================================
app.put('/api/parcels/:id', (req, res) => {
  const { id } = req.params;

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

  // First check if parcel exists
  db.get(
    'SELECT * FROM parcels WHERE id = ?',
    [id],
    (checkErr, existingParcel) => {
      if (checkErr) {
        return res.status(500).json({
          success: false,
          error: checkErr.message
        });
      }

      if (!existingParcel) {
        return res.status(404).json({
          success: false,
          message: 'Parcel not found'
        });
      }

      const sql = `
        UPDATE parcels SET
          title = ?,
          owner_name = ?,
          area_sq_ft = ?,
          status = ?,
          coordinates = ?,
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
        owner_name ?? existingParcel.owner_name,
        area_sq_ft ?? existingParcel.area_sq_ft,
        status ?? existingParcel.status,
        coordinates !== undefined
          ? JSON.stringify(coordinates)
          : existingParcel.coordinates,
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

      db.run(sql, params, function (err) {
        if (err) {
          console.error('PUT ERROR:', err.message);

          return res.status(400).json({
            success: false,
            error: err.message
          });
        }

        // Fetch updated parcel
        db.get(
          'SELECT * FROM parcels WHERE id = ?',
          [id],
          (getErr, updatedParcel) => {
            if (getErr) {
              return res.status(500).json({
                success: false,
                error: getErr.message
              });
            }

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
          }
        );
      });
    }
  );
});

// ============================================================
// 5. DELETE PARCEL
// DELETE /api/parcels/:id
// ============================================================
app.delete('/api/parcels/:id', (req, res) => {
  const { id } = req.params;

  // Check first
  db.get(
    'SELECT * FROM parcels WHERE id = ?',
    [id],
    (checkErr, parcel) => {
      if (checkErr) {
        return res.status(500).json({
          success: false,
          error: checkErr.message
        });
      }

      if (!parcel) {
        return res.status(404).json({
          success: false,
          message: 'Parcel not found'
        });
      }

      db.run(
        'DELETE FROM parcels WHERE id = ?',
        [id],
        function (err) {
          if (err) {
            console.error('DELETE ERROR:', err.message);

            return res.status(500).json({
              success: false,
              error: err.message
            });
          }

          res.status(200).json({
            success: true,
            message: 'Parcel deleted successfully!',
            id
          });
        }
      );
    }
  );
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});