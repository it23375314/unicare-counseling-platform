const express = require('express');
<<<<<<< HEAD
const { getAllCounsellors, getCounsellorById, createCounsellor, updateCounsellor, deleteCounsellor } = require('../controllers/counsellorController');

const router = express.Router();

router.route('/')
    .get(getAllCounsellors)
    .post(createCounsellor);

router.route('/:id')
    .get(getCounsellorById)
    .put(updateCounsellor)
    .delete(deleteCounsellor);
=======
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
>>>>>>> 4ccf38913c13d612b5f36df71f8c1efaa2b43708

module.exports = router;
