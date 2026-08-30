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
// DATABASE HELPERS
// ===============================

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}


function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}


function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}


// ===============================
// DATABASE INITIALIZATION
// ===============================

async function initializeDatabase() {

  // Create parcels table if it doesn't exist
  await dbRun(`
    CREATE TABLE IF NOT EXISTS parcels (
      id TEXT PRIMARY KEY,
      title TEXT,
      owner_name TEXT,
      area_sq_ft REAL,
      status TEXT,
      coordinates TEXT,
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


  // Check existing columns
  const columns = await dbAll(
    `PRAGMA table_info(parcels)`
  );

  const existingColumns = columns.map(
    column => column.name
  );


  // Add missing columns if necessary
  const additionalColumns = [
    ['flat_number', 'TEXT'],
    ['rent', 'REAL'],
    ['phone_number', 'TEXT'],
    ['address', 'TEXT'],
    ['elevation', 'REAL'],
    ['number_of_floors', 'INTEGER'],
    ['building_height', 'REAL'],
    ['usage', 'TEXT'],
    ['volumetric_space', 'REAL']
  ];


  for (const [name, type] of additionalColumns) {

    if (!existingColumns.includes(name)) {

      await dbRun(
        `ALTER TABLE parcels ADD COLUMN ${name} ${type}`
      );

      console.log(`✅ Added column: ${name}`);
    }
  }


  // Check number of parcels
  const result = await dbGet(
    `SELECT COUNT(*) AS count FROM parcels`
  );


  // Add seed data only if database is empty
  if (result.count === 0) {

    console.log('📦 Database empty. Adding seed data...');

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
      `ℹ️ Existing database found with ${result.count} parcels`
    );

  }

  console.log('✅ Database initialization completed');
}


// ===============================
// EXPORT EVERYTHING
// ===============================

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initializeDatabase
};