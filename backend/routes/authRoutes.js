const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getAllUsers,
  deleteUser,
  approveUser
} = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET  /api/auth/me?id=<userId>
router.get('/me', getMe);

// GET  /api/auth/users  (admin: list all users, supports ?role=counsellor&status=pending)
router.get('/users', getAllUsers);

// DELETE /api/auth/users/:id (admin: delete user)
router.delete('/users/:id', deleteUser);

// PATCH /api/auth/users/:id/approve  (admin: approve or reject counsellor)
router.patch('/users/:id/approve', approveUser);

module.exports = router;
