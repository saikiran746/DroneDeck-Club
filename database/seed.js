const db = require('./database');

console.log('Seeding DroneDeck Club database...');

// Clean existing data
db.prepare('DELETE FROM assignments').run();
db.prepare('DELETE FROM drones').run();
db.prepare('DELETE FROM pilots').run();

// Seed Pilots
const insertPilot = db.prepare('INSERT INTO pilots (name, email, phone) VALUES (?, ?, ?)');
const p1 = insertPilot.run('Pete Mitchell', 'pete.mitchell@topgun.org', '+1-555-0101');
const p2 = insertPilot.run('Sarah Connor', 'sarah.connor@resistance.net', '+1-555-0102');
const p3 = insertPilot.run('James Holden', 'james.holden@roci.io', '+1-555-0103');

console.log(`Inserted 3 pilots.`);

// Seed Drones
const insertDrone = db.prepare('INSERT INTO drones (name, class) VALUES (?, ?)');
const d1 = insertDrone.run('AeroScout Explorer', 'Professional');
const d2 = insertDrone.run('Falcon Heavy 4X', 'Enterprise');
const d3 = insertDrone.run('Phantom Glide', 'Consumer');
const d4 = insertDrone.run('Zephyr Survey Pro', 'Professional');

console.log(`Inserted 4 drones.`);

// Seed Assignments
const insertAssignment = db.prepare(
  'INSERT INTO assignments (pilot_id, drone_id, assigned_date) VALUES (?, ?, ?)'
);
insertAssignment.run(p1.lastInsertRowid, d1.lastInsertRowid, '2026-11-01');
insertAssignment.run(p2.lastInsertRowid, d2.lastInsertRowid, '2026-11-05');
insertAssignment.run(p3.lastInsertRowid, d4.lastInsertRowid, '2026-11-10');

console.log(`Inserted 3 assignments.`);
console.log('Database seeding completed successfully.');

