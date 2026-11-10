const express = require('express');
const router = express.Router();
const pilotsController = require('../controllers/pilotsController');
const { validatePilot } = require('../middleware/validation');

// Pilots CRUD routes with input validation
router.post('/', validatePilot, pilotsController.createPilot);
router.get('/', pilotsController.getAllPilots);
router.get('/:id', pilotsController.getPilotById);
router.put('/:id', validatePilot, pilotsController.updatePilot);
router.delete('/:id', pilotsController.deletePilot);

module.exports = router;
