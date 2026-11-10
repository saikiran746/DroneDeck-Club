const db = require('../database/database');

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate pilot input for POST and PUT
const validatePilot = (req, res, next) => {
  const { name, email, phone } = req.body;

  if (name === undefined || name === null || String(name).trim() === '') {
    return res.status(400).json({
      error: 'Name is required and cannot be empty.'
    });
  }

  if (email === undefined || email === null || String(email).trim() === '') {
    return res.status(400).json({
      error: 'Email is required and cannot be empty.'
    });
  }

  const trimmedEmail = String(email).trim();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({
      error: 'Email must have a valid email format.'
    });
  }

  if (phone === undefined || phone === null || String(phone).trim() === '') {
    return res.status(400).json({
      error: 'Phone is required and cannot be empty.'
    });
  }

  next();
};

// Validate drone input for POST and PUT
const validateDrone = (req, res, next) => {
  const { name, class: droneClass } = req.body;

  if (name === undefined || name === null || String(name).trim() === '') {
    return res.status(400).json({
      error: 'Name is required and cannot be empty.'
    });
  }

  if (droneClass === undefined || droneClass === null || String(droneClass).trim() === '') {
    return res.status(400).json({
      error: 'Class is required and cannot be empty.'
    });
  }

  next();
};

// Validate assignment input for POST and PUT
const validateAssignment = (req, res, next) => {
  const { pilot_id, drone_id, assigned_date } = req.body;

  // Validate pilot_id is a positive integer
  if (pilot_id === undefined || pilot_id === null || pilot_id === '') {
    return res.status(400).json({
      error: 'pilot_id is required.'
    });
  }

  const pilotIdNum = Number(pilot_id);
  if (!Number.isInteger(pilotIdNum) || pilotIdNum <= 0) {
    return res.status(400).json({
      error: 'Pilot ID must be a valid positive integer.'
    });
  }

  // Validate drone_id is a positive integer
  if (drone_id === undefined || drone_id === null || drone_id === '') {
    return res.status(400).json({
      error: 'drone_id is required.'
    });
  }

  const droneIdNum = Number(drone_id);
  if (!Number.isInteger(droneIdNum) || droneIdNum <= 0) {
    return res.status(400).json({
      error: 'Drone ID must be a valid positive integer.'
    });
  }

  // Validate assigned_date
  if (
    assigned_date === undefined ||
    assigned_date === null ||
    String(assigned_date).trim() === '' ||
    isNaN(Date.parse(String(assigned_date).trim()))
  ) {
    return res.status(400).json({
      error: 'Assigned date is required and must be a valid date.'
    });
  }

  // Verify referenced pilot exists
  const pilot = db.prepare('SELECT id FROM pilots WHERE id = ?').get(pilotIdNum);
  if (!pilot) {
    return res.status(400).json({
      error: `Referenced pilot with ID ${pilotIdNum} does not exist.`
    });
  }

  // Verify referenced drone exists
  const drone = db.prepare('SELECT id FROM drones WHERE id = ?').get(droneIdNum);
  if (!drone) {
    return res.status(400).json({
      error: `Referenced drone with ID ${droneIdNum} does not exist.`
    });
  }

  next();
};

module.exports = {
  validatePilot,
  validateDrone,
  validateAssignment
};

