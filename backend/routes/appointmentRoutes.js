const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// POST a new appointment
router.post('/', appointmentController.createAppointment);

// GET appointments for a specific student's email
router.get('/student/:email', appointmentController.getStudentAppointments);

// GET all appointments (Admin/Counsellor)
router.get('/', appointmentController.getAllAppointments);

// PATCH appointment status or payment
router.patch('/:id/status', appointmentController.updateStatus);


module.exports = router;
