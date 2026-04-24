const express = require('express');
const { 
  getAllCounsellors, 
  getCounsellorById, 
  createCounsellor, 
  updateCounsellor, 
  deleteCounsellor, 
  updateAvailability 
} = require('../controllers/counsellorController');

const router = express.Router();

/**
 * Expert Directory Routes
 * GET /    - Retrieve all experts
 * POST /   - Create a new expert record
 */
router.route('/')
    .get(getAllCounsellors)
    .post(createCounsellor);

/**
 * Individual Expert Management
 * GET /:id    - Fetch expert details
 * PUT /:id    - Update expert profile
 * DELETE /:id - Remove expert record
 */
router.route('/:id')
    .get(getCounsellorById)
    .put(updateCounsellor)
    .delete(deleteCounsellor);

/**
 * Temporal Management
 * PATCH /:id/availability - Synchronize expert session slots
 */
router.patch('/:id/availability', updateAvailability);

module.exports = router;
