const express = require('express');
const router = express.Router();
const assignmentsController = require('../controllers/assignmentsController');
const { validateAssignment } = require('../middleware/validation');

// Assignments CRUD routes with input validation
router.post('/', validateAssignment, assignmentsController.createAssignment);
router.get('/', assignmentsController.getAllAssignments);
router.get('/:id', assignmentsController.getAssignmentById);
router.put('/:id', validateAssignment, assignmentsController.updateAssignment);
router.delete('/:id', assignmentsController.deleteAssignment);

module.exports = router;
