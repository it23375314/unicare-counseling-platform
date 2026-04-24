const Counsellor = require('../models/Counsellor');

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

    counsellor.markModified('availability');
    await counsellor.save();
    res.status(200).json({ success: true, data: counsellor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
