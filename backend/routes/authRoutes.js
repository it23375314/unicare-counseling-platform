const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getAllUsers,
  deleteUser
} = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET  /api/auth/me?id=<userId>
router.get('/me', getMe);

// GET  /api/auth/users  (admin: list all users)
router.get('/users', getAllUsers);

// DELETE /api/auth/users/:id (admin: delete user)
router.delete('/users/:id', deleteUser);

module.exports = router;
