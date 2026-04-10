const Counsellor = require('../models/Counsellor');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer Configuration for Profile Pictures ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit per requirement
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
}).single('image');


/**
 * GET /api/counsellors
 * Retrieve all clinical experts
 */
exports.getAllCounsellors = async (req, res) => {
  try {
    const counsellors = await Counsellor.find();
    res.status(200).json({ success: true, data: counsellors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/counsellors/:id
 * Retrieve a specific expert by ID
 */
exports.getCounsellorById = async (req, res) => {
  try {
    const counsellor = await Counsellor.findById(req.params.id);
    if (!counsellor) return res.status(404).json({ success: false, message: 'Counsellor not found' });
    res.status(200).json({ success: true, data: counsellor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/counsellors
 * Register a new clinical expert
 */
exports.createCounsellor = async (req, res) => {
  try {
    const existing = await Counsellor.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ success: false, message: "A counsellor with this email already exists." });
    }

    const counsellor = new Counsellor(req.body);
    const newCounsellor = await counsellor.save();
    res.status(201).json({ success: true, data: newCounsellor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/counsellors/:id
 * Update expert details
 */
exports.updateCounsellor = async (req, res) => {
  try {
    if (req.body.email) {
      const existing = await Counsellor.findOne({ email: req.body.email });
      if (existing && existing._id.toString() !== req.params.id) {
        return res.status(400).json({ success: false, message: "Another counsellor has this email." });
      }
    }

    const counsellor = await Counsellor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!counsellor) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: counsellor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/counsellors/:id
 * Remove an expert from the platform
 */
exports.deleteCounsellor = async (req, res) => {
  try {
    const counsellor = await Counsellor.findByIdAndDelete(req.params.id);
    if (!counsellor) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/counsellors/:id/availability
 * Update session slot availability
 */
exports.updateAvailability = async (req, res) => {
  try {
    const { date, slots } = req.body;
    const counsellor = await Counsellor.findById(req.params.id);
    if (!counsellor) return res.status(404).json({ success: false, message: 'Counsellor not found' });

    // Check if date already exists in availability
    const dateIndex = counsellor.availability.findIndex(a => a.date === date);
    if (dateIndex >= 0) {
      if (slots.length === 0) {
        counsellor.availability.splice(dateIndex, 1);
      } else {
        counsellor.availability[dateIndex].slots = slots;
      }
    } else if (slots.length > 0) {
      counsellor.availability.push({ date, slots });
    }

    await counsellor.save();
    res.status(200).json({ success: true, data: counsellor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/counsellors/profile/me?email=...
 * Fetch profile for the current logged-in counsellor
 */
exports.getMyProfile = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const counsellor = await Counsellor.findOne({ email });
    if (!counsellor) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.status(200).json({ success: true, data: counsellor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/counsellors/profile/me
 * Update own profile details and sync with User model
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const { currentEmail, ...updateData } = req.body;
    if (!currentEmail) return res.status(400).json({ success: false, message: 'Current email is required for identification' });

    // 1. Update User model (name/email sync)
    const user = await User.findOne({ email: currentEmail });
    if (user) {
      if (updateData.name) user.name = updateData.name;
      if (updateData.email) user.email = updateData.email;
      await user.save();
    }

    // 2. Update Counsellor model
    const counsellor = await Counsellor.findOneAndUpdate(
      { email: currentEmail },
      updateData,
      { new: true, runValidators: true }
    );

    if (!counsellor) return res.status(404).json({ success: false, message: 'Counsellor profile not found' });

    res.status(200).json({ success: true, data: counsellor, msg: 'Profile updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/counsellors/profile/upload
 * Handle profile image upload
 */
exports.uploadProfileImage = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, message: 'Email required to link image' });

      const imagePath = `/uploads/profiles/${req.file.filename}`;
      const counsellor = await Counsellor.findOneAndUpdate(
        { email },
        { profileImage: imagePath },
        { new: true }
      );

      res.status(200).json({ success: true, data: counsellor, imagePath });
    } catch (dbErr) {
      res.status(500).json({ success: false, message: dbErr.message });
    }
  });
};

