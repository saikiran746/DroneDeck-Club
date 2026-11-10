const db = require('../database/database');

// Create a new assignment
const createAssignment = (req, res) => {
  try {
    const { pilot_id, drone_id, assigned_date } = req.body;

    if (!pilot_id || !drone_id || !assigned_date) {
      return res.status(400).json({
        error: 'Missing required fields: pilot_id, drone_id, and assigned_date are required.'
      });
    }

    const insertStmt = db.prepare(
      'INSERT INTO assignments (pilot_id, drone_id, assigned_date) VALUES (?, ?, ?)'
    );
    const result = insertStmt.run(pilot_id, drone_id, assigned_date);

    const createdAssignment = db
      .prepare(
        `SELECT 
          assignments.id,
          assignments.pilot_id,
          assignments.drone_id,
          assignments.assigned_date,
          pilots.name AS pilot_name,
          drones.name AS drone_name
        FROM assignments
        JOIN pilots ON assignments.pilot_id = pilots.id
        JOIN drones ON assignments.drone_id = drones.id
        WHERE assignments.id = ?`
      )
      .get(result.lastInsertRowid);

    return res.status(201).json(createdAssignment);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || (err.message && err.message.includes('FOREIGN KEY constraint failed'))) {
      return res.status(400).json({
        error: 'Invalid foreign key: Referenced pilot or drone does not exist.'
      });
    }
    return res.status(500).json({
      error: 'Failed to create assignment.',
      details: err.message
    });
  }
};

// Retrieve all assignments with SQL JOIN for pilot_name and drone_name
const getAllAssignments = (req, res) => {
  try {
    const query = `
      SELECT 
        assignments.id,
        assignments.pilot_id,
        assignments.drone_id,
        assignments.assigned_date,
        pilots.name AS pilot_name,
        drones.name AS drone_name
      FROM assignments
      JOIN pilots ON assignments.pilot_id = pilots.id
      JOIN drones ON assignments.drone_id = drones.id
      ORDER BY assignments.id ASC
    `;
    const assignments = db.prepare(query).all();
    return res.status(200).json(assignments);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to retrieve assignments.',
      details: err.message
    });
  }
};

// Retrieve a single assignment by ID with SQL JOIN
const getAssignmentById = (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        assignments.id,
        assignments.pilot_id,
        assignments.drone_id,
        assignments.assigned_date,
        pilots.name AS pilot_name,
        drones.name AS drone_name
      FROM assignments
      JOIN pilots ON assignments.pilot_id = pilots.id
      JOIN drones ON assignments.drone_id = drones.id
      WHERE assignments.id = ?
    `;
    const assignment = db.prepare(query).get(id);

    if (!assignment) {
      return res.status(404).json({
        error: `Assignment with ID ${id} not found.`
      });
    }

    return res.status(200).json(assignment);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to retrieve assignment.',
      details: err.message
    });
  }
};

// Update an existing assignment
const updateAssignment = (req, res) => {
  try {
    const { id } = req.params;
    const { pilot_id, drone_id, assigned_date } = req.body;

    const existingAssignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
    if (!existingAssignment) {
      return res.status(404).json({
        error: `Assignment with ID ${id} not found.`
      });
    }

    if (!pilot_id || !drone_id || !assigned_date) {
      return res.status(400).json({
        error: 'Missing required fields: pilot_id, drone_id, and assigned_date are required.'
      });
    }

    db.prepare(
      'UPDATE assignments SET pilot_id = ?, drone_id = ?, assigned_date = ? WHERE id = ?'
    ).run(pilot_id, drone_id, assigned_date, id);

    const updatedAssignment = db
      .prepare(
        `SELECT 
          assignments.id,
          assignments.pilot_id,
          assignments.drone_id,
          assignments.assigned_date,
          pilots.name AS pilot_name,
          drones.name AS drone_name
        FROM assignments
        JOIN pilots ON assignments.pilot_id = pilots.id
        JOIN drones ON assignments.drone_id = drones.id
        WHERE assignments.id = ?`
      )
      .get(id);

    return res.status(200).json(updatedAssignment);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || (err.message && err.message.includes('FOREIGN KEY constraint failed'))) {
      return res.status(400).json({
        error: 'Invalid foreign key: Referenced pilot or drone does not exist.'
      });
    }
    return res.status(500).json({
      error: 'Failed to update assignment.',
      details: err.message
    });
  }
};

// Delete an assignment by ID
const deleteAssignment = (req, res) => {
  try {
    const { id } = req.params;

    const existingAssignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
    if (!existingAssignment) {
      return res.status(404).json({
        error: `Assignment with ID ${id} not found.`
      });
    }

    db.prepare('DELETE FROM assignments WHERE id = ?').run(id);

    return res.status(200).json({
      message: `Assignment with ID ${id} deleted successfully.`
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to delete assignment.',
      details: err.message
    });
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
};

