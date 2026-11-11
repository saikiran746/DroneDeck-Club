const db = require('./database');

/**
 * Safe, idempotent database seeder.
 *
 * By default, seeding is skipped if any records already exist in pilots, drones,
 * or assignments so production data is never overwritten or deleted.
 *
 * WARNING: Passing `--force` explicitly deletes ALL existing records in
 * assignments, drones, and pilots before re-seeding sample data.
 * Example: `node database/seed.js --force`
 */
const forceReset = process.argv.includes('--force');

const seedDatabase = () => {
  const pilotsCount = db.prepare('SELECT COUNT(*) AS count FROM pilots').get().count;
  const dronesCount = db.prepare('SELECT COUNT(*) AS count FROM drones').get().count;
  const assignmentsCount = db.prepare('SELECT COUNT(*) AS count FROM assignments').get().count;

  const hasExistingData = pilotsCount > 0 || dronesCount > 0 || assignmentsCount > 0;

  if (hasExistingData && !forceReset) {
    console.log(
      `Skipping seed: existing records detected (pilots: ${pilotsCount}, drones: ${dronesCount}, assignments: ${assignmentsCount}). Pass --force to delete existing data and re-seed.`
    );
    return;
  }

  console.log('Seeding DroneDeck Club database...');

  const runSeed = db.transaction(() => {
    if (forceReset) {
      // WARNING: --force explicitly wipes all existing records before seeding
      db.prepare('DELETE FROM assignments').run();
      db.prepare('DELETE FROM drones').run();
      db.prepare('DELETE FROM pilots').run();
    }

    // Seed Pilots
    const insertPilot = db.prepare('INSERT INTO pilots (name, email, phone) VALUES (?, ?, ?)');
    const p1 = insertPilot.run('Pete Mitchell', 'pete.mitchell@topgun.org', '+1-555-0101');
    const p2 = insertPilot.run('Sarah Connor', 'sarah.connor@resistance.net', '+1-555-0102');
    const p3 = insertPilot.run('James Holden', 'james.holden@roci.io', '+1-555-0103');

    // Seed Drones
    const insertDrone = db.prepare('INSERT INTO drones (name, class) VALUES (?, ?)');
    const d1 = insertDrone.run('AeroScout Explorer', 'Professional');
    const d2 = insertDrone.run('Falcon Heavy 4X', 'Enterprise');
    const d3 = insertDrone.run('Phantom Glide', 'Consumer');
    const d4 = insertDrone.run('Zephyr Survey Pro', 'Professional');

    // Seed Assignments
    const insertAssignment = db.prepare(
      'INSERT INTO assignments (pilot_id, drone_id, assigned_date) VALUES (?, ?, ?)'
    );
    insertAssignment.run(p1.lastInsertRowid, d1.lastInsertRowid, '2026-11-01');
    insertAssignment.run(p2.lastInsertRowid, d2.lastInsertRowid, '2026-11-05');
    insertAssignment.run(p3.lastInsertRowid, d4.lastInsertRowid, '2026-11-10');
  });

  runSeed();
  console.log('Inserted 3 pilots, 4 drones, and 3 assignments.');
  console.log('Database seeding completed successfully.');
};

seedDatabase();
