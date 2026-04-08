const express = require('express');
const router = express.Router();
const counsellorController = require('../controllers/counsellorController');

// GET all counsellors
router.get('/', counsellorController.getAllCounsellors);

// GET counsellor by ID
router.get('/:id', counsellorController.getCounsellorById);

// POST new counsellor (Admin)
router.post('/', counsellorController.createCounsellor);

// PATCH counsellor availability
router.patch('/:id/availability', counsellorController.updateAvailability);

module.exports = router;
