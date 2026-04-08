const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Log = require('../models/Log');
const Config = require('../models/Config');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');

// --- 1. REGISTER ---
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered" });

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
        
        const newUser = new User({ 
            ...req.body, 
            password: hashedPassword, 
            otp: generatedOTP 
        });
        await newUser.save();

        // LOG: New Registration
        const regLog = new Log({
            title: "New user registration initiated",
            user: email,
            type: "Action",
            icon: "👤"
        });
        await regLog.save();

        console.log(`📩 OTP for ${email}: ${generatedOTP}`);
        res.status(201).json({ message: "Registration successful!", email: newUser.email });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --- 2. VERIFY OTP ---
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.otp === otp) {
            user.otp = null; 
            await user.save();

            const verifyLog = new Log({
                title: "Email verification successful",
                user: user.fullName || email,
                type: "Security",
                icon: "✅"
            });
            await verifyLog.save();

            res.status(200).json({ message: "Verification successful", role: user.role });
        } else {
            res.status(400).json({ error: "Invalid OTP code" });
        }
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --- 3. LOGIN (Returns sessionId for tracking) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ error: "Account not found." });

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect password" });

        // --- CREATE SESSION ---
        const newSession = new Session({
            userId: user._id,
            device: "Windows PC - Chrome", 
            location: "Colombo, Sri Lanka", 
            lastSeen: new Date()
        });
        
        // IMPORTANT: We save the session and return the ID to the frontend
        const savedSession = await newSession.save();

        // LOG: Successful Login
        const newLog = new Log({
            title: user.role === 'ADMIN' ? "Admin login successful" : "User login successful",
            user: user.fullName,
            type: "Security",
            icon: "🔐"
        });
        await newLog.save();

        res.status(200).json({
            message: "Login successful",
            role: user.role,
            fullName: user.fullName,
            email: user.email,
            sessionId: savedSession._id // Frontend stores this in localStorage
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --- 4. ADMIN: USER & LOG MANAGEMENT ---
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); 
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user list" });
    }
});

router.get('/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

// --- 5. SETTINGS: PROFILE & PASSWORD ---
router.put('/update-profile', async (req, res) => {
    try {
        const { email, name } = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { email }, 
            { fullName: name }, 
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ message: "Profile updated", fullName: updatedUser.fullName });
    } catch (err) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});

router.put('/update-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Current password incorrect" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- 6. SETTINGS: DEVICE SESSIONS ---
router.get('/sessions/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json([]);
        
        const sessions = await Session.find({ userId: user._id });
        res.json(sessions);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// Delete specific session (Used for logout or remote logout)
router.delete('/sessions/:id', async (req, res) => {
    try {
        await Session.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).send("Error logging out");
    }
});

// --- 7. CONFIGURATION ---
router.get('/config', async (req, res) => {
    try {
        let config = await Config.findOne();
        if (!config) {
            config = new Config();
            await config.save();
        }
        res.status(200).json(config);
    } catch (err) {
        res.status(500).json({ error: "Failed to load config" });
    }
});

router.put('/config', async (req, res) => {
    try {
        const updatedConfig = await Config.findOneAndUpdate({}, req.body, { 
            new: true, upsert: true 
        });
        res.status(200).json(updatedConfig);
    } catch (err) {
        res.status(500).json({ error: "Failed to update config" });
    }
});

module.exports = router;