const express = require('express');
const router = express.Router();
const dronesController = require('../controllers/dronesController');
const { validateDrone } = require('../middleware/validation');

// Drones CRUD routes with input validation
router.post('/', validateDrone, dronesController.createDrone);
router.get('/', dronesController.getAllDrones);
router.get('/:id', dronesController.getDroneById);
router.put('/:id', validateDrone, dronesController.updateDrone);
router.delete('/:id', dronesController.deleteDrone);

module.exports = router;
