const bcrypt = require('bcryptjs');
const User = require('../models/User');

<<<<<<< HEAD
exports.getMe = async (req, res) => {
    try {
        const id = req.query.id; 
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(200).json({ success: true, data: { name: "Guest User", role: "student", email: "guest@unicare.edu", _id: "guest-id" } });
        }
        
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
=======
/**
 * POST /api/auth/register
 * Register a new user (student, counsellor, or admin)
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, itNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password || !itNumber) {
      return res.status(400).json({ success: false, msg: 'All fields are required' });
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
    }

    // Validate IT number format (e.g., IT23375314)
    const itNumberRegex = /^[A-Z]{2}[0-9]{4}[0-9]{4}$/;
    if (!itNumberRegex.test(itNumber)) {
      return res.status(400).json({ success: false, msg: 'Invalid IT number format. Expected: IT23XXXXXX' });
    }

    // Validate role
    const allowedRoles = ['student', 'counsellor', 'admin'];
    const userRole = role && allowedRoles.includes(role) ? role : 'student';

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { itNumber }] });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: 'User with this email or IT number already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      itNumber
    });
    await user.save();

    console.log(`✅ New user registered: ${email} (${userRole})`);
    res.status(201).json({ success: true, msg: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error during registration' });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user with email + password
 */
exports.login = async (req, res) => {
<<<<<<< HEAD
    try {
        const { role, name } = req.body;
        // Mock login returning the user 
        const users = await User.find({ role });
        let user = users.length > 0 ? users[0] : null;
        
        if (!user) {
           user = new User({ 
             role, 
             name: name || "New User", 
             email: `${(name || "user").toLowerCase().replace(/\s+/g, '.')}@unicare.edu` 
           });
           await user.save();
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
=======
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, msg: 'Email and password are required' });
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    console.log(`✅ Login successful: ${user.name} (${user.role})`);
    res.status(200).json({
      success: true,
      msg: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        itNumber: user.itNumber
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error during login' });
  }
};

/**
 * GET /api/auth/me?id=<userId>
 * Fetch the current user by ID (used by UniCare frontend on load)
 */
exports.getMe = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ success: false, msg: 'User ID is required' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
};

/**
 * GET /api/auth/users
 * Fetch all users (admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('GetAllUsers Error:', error.message);
    res.status(500).json({ success: false, msg: 'Could not fetch users' });
  }
};

/**
 * DELETE /api/auth/users/:id
 * Delete a user by ID (admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    console.log(`✅ User deleted: ${user.email}`);
    res.status(200).json({ success: true, msg: 'User deleted successfully' });
  } catch (error) {
    console.error('DeleteUser Error:', error.message);
    res.status(500).json({ success: false, msg: 'Server error during deletion' });
  }
};
