const express = require('express');
const { getMe, login } = require('../controllers/authController');

const router = express.Router();

router.get('/me', getMe);
router.post('/login', login);

module.exports = router;
