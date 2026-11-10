const db = require('../database/database');

const ALLOWED_SORT_FIELDS = ['name'];
const ALLOWED_ORDER_VALUES = ['asc', 'desc'];

// Create a new drone
const createDrone = (req, res) => {
  try {
    const { name, class: droneClass } = req.body;

    const insertStmt = db.prepare('INSERT INTO drones (name, class) VALUES (?, ?)');
    const result = insertStmt.run(name.trim(), droneClass.trim());

    const createdDrone = db.prepare('SELECT * FROM drones WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(createdDrone);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to create drone.',
      details: err.message
    });
  }
};

// Retrieve all drones, with optional class search and sorting
const getAllDrones = (req, res) => {
  try {
    const { class: droneClass, sort, order } = req.query;

    let sortClause = '';

    // Validate sort field if provided
    if (sort !== undefined && sort !== null) {
      const normalizedSort = String(sort).trim().toLowerCase();
      if (!ALLOWED_SORT_FIELDS.includes(normalizedSort)) {
        return res.status(400).json({
          error: 'Cannot sort by that field'
        });
      }

      let orderDirection = 'ASC';
      if (order !== undefined && order !== null) {
        const normalizedOrder = String(order).trim().toLowerCase();
        if (!ALLOWED_ORDER_VALUES.includes(normalizedOrder)) {
          return res.status(400).json({
            error: 'Invalid order value. Allowed values: asc, desc.'
          });
        }
        orderDirection = normalizedOrder.toUpperCase();
      }

      sortClause = ` ORDER BY ${normalizedSort} COLLATE NOCASE ${orderDirection}`;
    } else if (order !== undefined && order !== null) {
      // If order is passed without sort, validate the order parameter
      const normalizedOrder = String(order).trim().toLowerCase();
      if (!ALLOWED_ORDER_VALUES.includes(normalizedOrder)) {
        return res.status(400).json({
          error: 'Invalid order value. Allowed values: asc, desc.'
        });
      }
    }

    if (droneClass !== undefined && droneClass !== null) {
      const sql = `SELECT * FROM drones WHERE LOWER(class) = LOWER(?)${sortClause}`;
      const stmt = db.prepare(sql);
      const drones = stmt.all(String(droneClass).trim());
      return res.status(200).json(drones);
    }

    const sql = `SELECT * FROM drones${sortClause}`;
    const drones = db.prepare(sql).all();
    return res.status(200).json(drones);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to retrieve drones.',
      details: err.message
    });
  }
};

// Retrieve a single drone by ID
const getDroneById = (req, res) => {
  try {
    const { id } = req.params;
    const drone = db.prepare('SELECT * FROM drones WHERE id = ?').get(id);

    if (!drone) {
      return res.status(404).json({
        error: `Drone with ID ${id} not found.`
      });
    }

    return res.status(200).json(drone);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to retrieve drone.',
      details: err.message
    });
  }
};

// Update an existing drone
const updateDrone = (req, res) => {
  try {
    const { id } = req.params;
    const { name, class: droneClass } = req.body;

    const existingDrone = db.prepare('SELECT * FROM drones WHERE id = ?').get(id);
    if (!existingDrone) {
      return res.status(404).json({
        error: `Drone with ID ${id} not found.`
      });
    }

    db.prepare('UPDATE drones SET name = ?, class = ? WHERE id = ?').run(
      name.trim(),
      droneClass.trim(),
      id
    );

    const updatedDrone = db.prepare('SELECT * FROM drones WHERE id = ?').get(id);
    return res.status(200).json(updatedDrone);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to update drone.',
      details: err.message
    });
  }
};

// Delete a drone by ID
const deleteDrone = (req, res) => {
  try {
    const { id } = req.params;

    const existingDrone = db.prepare('SELECT * FROM drones WHERE id = ?').get(id);
    if (!existingDrone) {
      return res.status(404).json({
        error: `Drone with ID ${id} not found.`
      });
    }

    db.prepare('DELETE FROM drones WHERE id = ?').run(id);

    return res.status(200).json({
      message: `Drone with ID ${id} deleted successfully.`
    });
  } catch (err) {
    if (
      err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
      (err.message && err.message.includes('FOREIGN KEY constraint failed'))
    ) {
      return res.status(409).json({
        error: 'Cannot delete drone: Active assignment records still reference this drone.'
      });
    }
    return res.status(500).json({
      error: 'Failed to delete drone.',
      details: err.message
    });
  }
};

module.exports = {
  createDrone,
  getAllDrones,
  getDroneById,
  updateDrone,
  deleteDrone
};
