const express = require('express');
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

module.exports = router;
