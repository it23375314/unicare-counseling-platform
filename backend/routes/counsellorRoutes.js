const express = require('express');
const { 
  getAllCounsellors, 
  getCounsellorById, 
  createCounsellor, 
  updateCounsellor, 
  deleteCounsellor, 
  updateAvailability,
  getMyProfile,
  updateMyProfile,
  uploadProfileImage
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
 * Own Profile Management (for logged-in counsellor)
 * GET /profile/me    - Fetch current counsellor profile
 * PUT /profile/me    - Update current counsellor profile
 * POST /profile/upload - Upload profile image
 */
router.get('/profile/me', getMyProfile);
router.put('/profile/me', updateMyProfile);
router.post('/profile/upload', uploadProfileImage);

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
