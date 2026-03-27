const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// --- 1. REGISTRATION ROUTE ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, itNumber } = req.body;

    console.log("Registration Payload:", req.body); // Log the registration payload

    // Validate IT number format
    const itNumberRegex = /^[A-Z]{2}[0-9]{4}[0-9]{4}$/;
    if (!itNumberRegex.test(itNumber)) {
      return res.status(400).json({ msg: "Invalid IT number format" });
    }

    let user = await User.findOne({ $or: [{ email }, { itNumber }] });
    if (user) {
      console.log(`Registration failed: ${email} or ${itNumber} already exists`);
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({ name, email, password, role, itNumber });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    console.log(`✅ New user registered: ${email} (${role})`);
    res.status(201).json({ msg: "User registered successfully!" });
  } catch (err) {
    console.error("Reg Error:", err.message);
    res.status(500).json({ error: "Server Error during registration" });
  }
});

// --- 2. LOGIN ROUTE (Updated to send email and ID) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Attempting login for: ${email}`);

    let user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Login failed: Email not found");
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Login failed: Incorrect password");
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    console.log(`✅ Login successful: ${user.name} (${user.role})`);
    
    // We send name, role, email, and ID back to the frontend
    res.json({
      msg: "Login successful",
      role: user.role,
      name: user.name,
      email: user.email,
      userId: user._id,
      itNumber: user.itNumber
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server Error during login" });
  }
});

// --- 3. FETCH ALL USERS ---
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// --- 4. DELETE USER ---
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ msg: "User not found" });

    console.log(`✅ User deleted: ${user.email}`);
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ error: "Server Error during deletion" });
  }
});

module.exports = router;