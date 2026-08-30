const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.resolve(__dirname, 'sqlite.db');
const db = new sqlite3.Database(dbPath);

// Define missing columns to add to schema
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

// Promise wrappers for async/await execution
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

async function runSchemaOnlyMigration() {
  try {
    // 1. Ensure table exists with base columns
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

    // 2. Inspect existing table structure
    const existingColumns = await dbAll("PRAGMA table_info(parcels)");
    const existingColumnNames = existingColumns.map(col => col.name);

    // 3. Sequentially add only the missing columns (NULL values allowed)
    for (const col of targetColumns) {
      if (!existingColumnNames.includes(col.name)) {
        const alterSql = `ALTER TABLE parcels ADD COLUMN ${col.name} ${col.type}`;
        await dbRun(alterSql);
        console.log(`Successfully added missing column: ${col.name}`);
      }
    }

    // 4. Seed ONLY IF table is completely empty (no existing records)
    const row = await dbGet("SELECT COUNT(*) as count FROM parcels");
    if (row && row.count === 0) {
      console.log("Database completely empty. Initializing baseline seed data...");
      await dbRun(`
        INSERT INTO parcels (
          id, title, owner_name, area_sq_ft, status, coordinates
        ) VALUES 
        ('p101', 'Sunrise Villa', 'Rahul Sharma', 1200, 'occupied', '[77.5946, 12.9716]'),
        ('p102', 'Green Acres', 'Priya Singh', 2500, 'vacant', '[77.6, 12.975]'),
        ('p103', 'Ocean View', 'Amit Kumar', 1800, 'vacant', '[77.61, 12.98]')
      `);
    } else {
      console.log(`Existing database found with ${row.count} records. No rows altered or seeded.`);
    }

  } catch (error) {
    console.error("Schema migration error:", error);
  }
}

// Execute migration on startup
db.serialize(() => {
  runSchemaOnlyMigration();
});

module.exports = db;