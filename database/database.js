const path = require('path');
const Database = require('better-sqlite3');

// Resolve path to database/drone_deck.db
const dbPath = path.join(__dirname, 'drone_deck.db');

// Initialize database connection
const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Initialize tables if they do not exist
const initTables = () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS pilots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS drones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      class TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pilot_id INTEGER NOT NULL,
      drone_id INTEGER NOT NULL,
      assigned_date TEXT NOT NULL,
      FOREIGN KEY (pilot_id) REFERENCES pilots (id) ON DELETE RESTRICT,
      FOREIGN KEY (drone_id) REFERENCES drones (id) ON DELETE RESTRICT
    );
  `;

  db.exec(schema);
  console.log('Database initialized successfully: drone_deck.db');
};

initTables();

module.exports = db;

