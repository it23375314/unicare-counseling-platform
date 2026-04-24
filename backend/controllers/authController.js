const bcrypt = require('bcryptjs');
const Log = require('../models/Log');
const Config = require('../models/Config');
const SystemSession = require('../models/SystemSession');
const User = require('../models/User');
const Counsellor = require('../models/Counsellor');

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, itNumber, specialization } = req.body;

    if (!name || !email || !password || !itNumber) {
      return res.status(400).json({ success: false, msg: 'All fields are required' });
    }

    const itNumberRegex = /^[A-Z]{2}[0-9]{4}[0-9]{4}$/;
    if (!itNumberRegex.test(itNumber)) {
      return res.status(400).json({ success: false, msg: 'Invalid IT number format. Expected: IT23XXXXXX' });
    }

    const allowedRoles = ['student', 'counsellor', 'admin'];
    const userRole = role && allowedRoles.includes(role) ? role : 'student';

    const existingUser = await User.findOne({ $or: [{ email }, { itNumber }] });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: 'User with this email or IT number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Counsellors must wait for admin approval
    const approvalStatus = userRole === 'counsellor' ? 'pending' : 'approved';

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      itNumber,
      specialization: specialization || '',
      approvalStatus,
    });
    await user.save();

    // ─── ADDED: Save log to database ──────────────────────────────────────────
    await Log.create({
      title: `New ${userRole} registration`,
      user: user.name || email,
      type: "Action",
      icon: "👤"
    });
    // ──────────────────────────────────────────────────────────────────────────

    console.log(`✅ New user registered: ${email} (${userRole}) — status: ${approvalStatus}`);

    if (userRole === 'counsellor') {
      return res.status(201).json({
        success: true,
        pending: true,
        msg: 'Registration submitted! Your account is pending admin approval. You will be able to log in once approved.'
      });
    }

    res.status(201).json({ success: true, msg: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error during registration', details: error.message, stack: error.stack });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    // Block pending/rejected counsellors
    if (user.role === 'counsellor' && user.approvalStatus !== 'approved') {
      const msg = user.approvalStatus === 'rejected'
        ? 'Your registration was rejected by the admin. Please contact support.'
        : 'Your account is pending admin approval. Please wait for confirmation.';
      return res.status(403).json({ success: false, pending: true, msg });
    }

    // ─── ADDED: Save log to database ──────────────────────────────────────────
    await Log.create({
      title: `${user.role === 'admin' ? "Admin" : "User"} login successful`,
      user: user.name || user.email,
      type: "Security",
      icon: "🔐"
    });
    // ──────────────────────────────────────────────────────────────────────────

    console.log(`✅ Login successful: ${user.name} (${user.role})`);
    res.status(200).json({
      success: true,
      msg: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        itNumber: user.itNumber,
        approvalStatus: user.approvalStatus,
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    if (error.message.includes('timeout') || error.message.includes('topology') || error.message.includes('connect')) {
      return res.status(503).json({ success: false, msg: 'Database connection timeout. Please check Atlas network whitelist or try again later.' });
    }
    res.status(500).json({ success: false, msg: 'Server error during login' });
  }
};

/**
 * GET /api/auth/me?id=<userId>
 */
exports.getMe = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
       // Return guest for unauthenticated state instead of failing, to support legacy components
       return res.status(200).json({ success: true, data: { name: "Guest User", role: "student", email: "guest@unicare.edu", _id: "guest-id" } });
    }
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
};

/**
 * GET /api/auth/users
 * Optional query: ?role=counsellor&status=pending
 */
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.approvalStatus = req.query.status;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('GetAllUsers Error:', error.message);
    res.status(500).json({ success: false, msg: 'Could not fetch users' });
  }
};

/**
 * DELETE /api/auth/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
    console.log(`✅ User deleted: ${user.email}`);
    res.status(200).json({ success: true, msg: 'User deleted successfully' });
  } catch (error) {
    console.error('DeleteUser Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error during deletion' });
  }
};

/**
 * PATCH /api/auth/users/:id/approve
 * Admin approves or rejects a counsellor registration.
 * body: { action: 'approve' | 'reject' }
 */
exports.approveUser = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
    if (user.role !== 'counsellor') return res.status(400).json({ success: false, msg: 'Only counsellor accounts require approval' });

    if (action === 'approve') {
      user.approvalStatus = 'approved';
      await user.save();

      // Create Counsellor profile so they appear on the website
      const existing = await Counsellor.findOne({ email: user.email });
      if (!existing) {
        await Counsellor.create({
          name: user.name,
          email: user.email,
          specialization: user.specialization || 'General Counselling',
          experience: '1',
          bio: '',
          image: '',
          price: 40,
        });
      }

      console.log(`✅ Counsellor approved: ${user.email}`);
      res.json({ success: true, msg: `${user.name} has been approved and can now log in.` });

    } else if (action === 'reject') {
      user.approvalStatus = 'rejected';
      await user.save();
      console.log(`❌ Counsellor rejected: ${user.email}`);
      res.json({ success: true, msg: `${user.name}'s registration has been rejected.` });
    } else {
      res.status(400).json({ success: false, msg: 'Invalid action. Use "approve" or "reject".' });
    }
  } catch (error) {
    console.error('ApproveUser Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error during approval' });
  }
};

// ─── Profile & Password ────────────────────────────────────────────────────────

/**
 * PUT /api/auth/update-profile
 * body: { email, name }
 */
exports.updateProfile = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ success: false, msg: 'Email and name are required' });
    const updated = await User.findOneAndUpdate({ email }, { name }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ success: false, msg: 'User not found' });
    res.json({ success: true, msg: 'Profile updated', data: updated });
  } catch (error) {
    console.error('UpdateProfile Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error during profile update' });
  }
};

/**
 * PUT /api/auth/update-password
 * body: { email, currentPassword, newPassword }
 */
exports.updatePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) return res.status(400).json({ success: false, msg: 'All fields are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, msg: 'Current password is incorrect' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, msg: 'Password updated successfully' });
  } catch (error) {
    console.error('UpdatePassword Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error during password update' });
  }
};

// ─── Platform Logs ─────────────────────────────────────────────────────────────

/**
 * GET /api/auth/logs
 */
exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('GetLogs Error:', error.message);
    res.status(500).json({ success: false, msg: 'Could not fetch logs' });
  }
};

/**
 * DELETE /api/auth/logs/purge
 */
exports.purgeLogs = async (req, res) => {
  try {
    await Log.deleteMany({});
    res.json({ success: true, msg: 'All logs purged successfully' });
  } catch (error) {
    console.error('PurgeLogs Error:', error.message);
    res.status(500).json({ success: false, msg: 'Error purging logs' });
  }
};

// ─── System Config ─────────────────────────────────────────────────────────────

/**
 * GET /api/auth/config
 */
exports.getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) { config = new Config(); await config.save(); }
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('GetConfig Error:', error.message);
    res.status(500).json({ success: false, msg: 'Could not load config' });
  }
};

/**
 * PUT /api/auth/config
 */
exports.updateConfig = async (req, res) => {
  try {
    const updated = await Config.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, msg: 'System config saved', data: updated });
  } catch (error) {
    console.error('UpdateConfig Error:', error.message);
    res.status(500).json({ success: false, msg: 'Could not save config' });
  }
};

// ─── Device Sessions ───────────────────────────────────────────────────────────

/**
 * GET /api/auth/sessions/:email
 */
exports.getSessions = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.json({ success: true, data: [] });
    const sessions = await SystemSession.find({ userId: user._id }).sort({ lastSeen: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('GetSessions Error:', error.message);
    res.status(500).json({ success: false, msg: 'Error fetching sessions' });
  }
};

/**
 * DELETE /api/auth/sessions/:id
 */
exports.deleteSession = async (req, res) => {
  try {
    await SystemSession.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: 'Session removed' });
  } catch (error) {
    console.error('DeleteSession Error:', error.message);
    res.status(500).json({ success: false, msg: 'Error removing session' });
  }
};