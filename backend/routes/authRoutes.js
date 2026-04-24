const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getAllUsers,
  deleteUser,
  approveUser,
  updateProfile,
  updatePassword,
  getLogs,
  purgeLogs,
  getConfig,
  updateConfig,
  getSessions,
  deleteSession
} = require('../controllers/authController');

// ─── Existing Auth Routes (unchanged) ─────────────────────────────────────────
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

// ─── New Admin Panel Routes ────────────────────────────────────────────────────

// PUT /api/auth/update-profile  (Settings: update name)
router.put('/update-profile', updateProfile);

// PUT /api/auth/update-password  (Settings: change password)
router.put('/update-password', updatePassword);

// GET  /api/auth/logs            (PlatformLogs: fetch all activity logs)
router.get('/logs', getLogs);

// DELETE /api/auth/logs/purge    (SystemConfig: delete all logs — danger zone)
router.delete('/logs/purge', purgeLogs);

// GET /api/auth/config           (SystemConfig: get current settings)
router.get('/config', getConfig);

// PUT /api/auth/config           (SystemConfig: save settings)
router.put('/config', updateConfig);

// GET /api/auth/sessions/:email  (Settings → Devices: sessions for a user)
router.get('/sessions/:email', getSessions);

// DELETE /api/auth/sessions/:id  (Settings → Devices: remote logout)
router.delete('/sessions/:id', deleteSession);

module.exports = router;

