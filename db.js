const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.resolve(__dirname, 'sqlite.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection error:', err.message);
  } else {
    console.log('✅ SQLite database connected');
  }
});

// ===============================
// PROMISE HELPERS
// ===============================

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// ===============================
// DATABASE INITIALIZATION
// ===============================

async function initializeDatabase() {
  try {
    // Base table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS parcels (
        id TEXT PRIMARY KEY,
        title TEXT,
        owner_name TEXT,
        area_sq_ft REAL,
        status TEXT,
        coordinates TEXT
      )
    `);

    // Additional columns
    const targetColumns = [
      { name: 'flat_number', type: 'TEXT' },
      { name: 'rent', type: 'REAL' },
      { name: 'phone_number', type: 'TEXT' },
      { name: 'address', type: 'TEXT' },
      { name: 'elevation', type: 'REAL' },
      { name: 'number_of_floors', type: 'INTEGER' },
      { name: 'building_height', type: 'REAL' },
      { name: 'usage', type: 'TEXT' },
      { name: 'volumetric_space', type: 'REAL' }
    ];

    const existingColumns = await dbAll(
      'PRAGMA table_info(parcels)'
    );

    const existingColumnNames = existingColumns.map(
      column => column.name
    );

    for (const column of targetColumns) {
      if (!existingColumnNames.includes(column.name)) {
        await dbRun(
          `ALTER TABLE parcels ADD COLUMN ${column.name} ${column.type}`
        );

        console.log(
          `✅ Added column: ${column.name}`
        );
      }
    }

    // Seed only if database is completely empty
    const countResult = await dbGet(
      'SELECT COUNT(*) AS count FROM parcels'
    );

    if (countResult.count === 0) {
      console.log('📦 Database empty. Adding seed parcels...');

      await dbRun(`
        INSERT INTO parcels (
          id,
          title,
          owner_name,
          area_sq_ft,
          status,
          coordinates
        )
        VALUES
        (
          'p101',
          'Sunrise Villa',
          'Rahul Sharma',
          1200,
          'occupied',
          '[77.5946, 12.9716]'
        ),
        (
          'p102',
          'Green Acres',
          'Priya Singh',
          2500,
          'vacant',
          '[77.6, 12.975]'
        ),
        (
          'p103',
          'Ocean View',
          'Amit Kumar',
          1800,
          'vacant',
          '[77.61, 12.98]'
        )
      `);

      console.log('✅ Seed data added');
    } else {
      console.log(
        `ℹ️ Existing database found with ${countResult.count} parcels`
      );
    }

    console.log('✅ Database initialization completed');

  } catch (error) {
    console.error(
      '❌ Database initialization failed:',
      error.message
    );

    throw error;
  }
}

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initializeDatabase
};