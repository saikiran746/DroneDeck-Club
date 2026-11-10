const db = require('../database/database');

// Create a new pilot
const createPilot = (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPhone = String(phone).trim();

    const insertStmt = db.prepare('INSERT INTO pilots (name, email, phone) VALUES (?, ?, ?)');
    const result = insertStmt.run(trimmedName, trimmedEmail, trimmedPhone);

    const createdPilot = db.prepare('SELECT * FROM pilots WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(createdPilot);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'A pilot with this email already exists.'
      });
    }
    return res.status(500).json({
      error: 'Failed to create pilot.',
      details: err.message
    });
  }
};

// Retrieve all pilots
const getAllPilots = (req, res) => {
  try {
    const pilots = db.prepare('SELECT * FROM pilots').all();
    return res.status(200).json(pilots);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to retrieve pilots.',
      details: err.message
    });
  }
};

// Retrieve a single pilot by ID
const getPilotById = (req, res) => {
  try {
    const { id } = req.params;
    const pilot = db.prepare('SELECT * FROM pilots WHERE id = ?').get(id);

    if (!pilot) {
      return res.status(404).json({
        error: `Pilot with ID ${id} not found.`
      });
    }

    return res.status(200).json(pilot);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to retrieve pilot.',
      details: err.message
    });
  }
};

// Update an existing pilot
const updatePilot = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const existingPilot = db.prepare('SELECT * FROM pilots WHERE id = ?').get(id);
    if (!existingPilot) {
      return res.status(404).json({
        error: `Pilot with ID ${id} not found.`
      });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPhone = String(phone).trim();

    db.prepare('UPDATE pilots SET name = ?, email = ?, phone = ? WHERE id = ?').run(
      trimmedName,
      trimmedEmail,
      trimmedPhone,
      id
    );

    const updatedPilot = db.prepare('SELECT * FROM pilots WHERE id = ?').get(id);
    return res.status(200).json(updatedPilot);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'A pilot with this email already exists.'
      });
    }
    return res.status(500).json({
      error: 'Failed to update pilot.',
      details: err.message
    });
  }
};

// Delete a pilot by ID
const deletePilot = (req, res) => {
  try {
    const { id } = req.params;

    const existingPilot = db.prepare('SELECT * FROM pilots WHERE id = ?').get(id);
    if (!existingPilot) {
      return res.status(404).json({
        error: `Pilot with ID ${id} not found.`
      });
    }

    db.prepare('DELETE FROM pilots WHERE id = ?').run(id);

    return res.status(200).json({
      message: `Pilot with ID ${id} deleted successfully.`
    });
  } catch (err) {
    if (
      err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
      (err.message && err.message.includes('FOREIGN KEY constraint failed'))
    ) {
      return res.status(409).json({
        error: 'Cannot delete pilot: Active assignment records still reference this pilot.'
      });
    }
    return res.status(500).json({
      error: 'Failed to delete pilot.',
      details: err.message
    });
  }
};

module.exports = {
  createPilot,
  getAllPilots,
  getPilotById,
  updatePilot,
  deletePilot
};
