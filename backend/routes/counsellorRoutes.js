const express = require('express');
<<<<<<< HEAD
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
=======
const { getAllCounsellors, getCounsellorById, createCounsellor, updateCounsellor, deleteCounsellor, updateAvailability } = require('../controllers/counsellorController');

const router = express.Router();

router.route('/')
    .get(getAllCounsellors)
    .post(createCounsellor);

router.route('/:id')
    .get(getCounsellorById)
    .put(updateCounsellor)
    .delete(deleteCounsellor);

router.patch('/:id/availability', updateAvailability);
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc

module.exports = router;
