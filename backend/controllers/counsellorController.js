const Counsellor = require('../models/Counsellor');

<<<<<<< HEAD
// Get all counsellors
exports.getAllCounsellors = async (req, res) => {
  try {
    const counsellors = await Counsellor.find();
    res.status(200).json({ success: true, data: counsellors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get counsellor by ID
exports.getCounsellorById = async (req, res) => {
  try {
    const counsellor = await Counsellor.findById(req.params.id);
    if (!counsellor) return res.status(404).json({ success: false, message: 'Counsellor not found' });
    res.status(200).json({ success: true, data: counsellor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new counsellor
exports.createCounsellor = async (req, res) => {
  const counsellor = new Counsellor({
    name: req.body.name,
    email: req.body.email,
    specialization: req.body.specialization,
    experience: req.body.experience,
    bio: req.body.bio,
    image: req.body.image,
    price: req.body.price,
    availability: req.body.availability || []
  });

  try {
    const newCounsellor = await counsellor.save();
    res.status(201).json({ success: true, data: newCounsellor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update availability for a counsellor
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

// Update counsellor details
exports.updateCounsellor = async (req, res) => {
    try {
        const counsellor = await Counsellor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!counsellor) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: counsellor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete counsellor
exports.deleteCounsellor = async (req, res) => {
    try {
        const counsellor = await Counsellor.findByIdAndDelete(req.params.id);
        if (!counsellor) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
=======
exports.getAllCounsellors = async (req, res) => {
    try {
        const counsellors = await Counsellor.find();
        res.status(200).json({ success: true, data: counsellors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCounsellorById = async (req, res) => {
    try {
        const counsellor = await Counsellor.findById(req.params.id);
        if (!counsellor) return res.status(404).json({ success: false, message: 'Counsellor not found' });
        res.status(200).json({ success: true, data: counsellor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCounsellor = async (req, res) => {
    try {
        const existing = await Counsellor.findOne({ email: req.body.email });
        if (existing && existing.id !== req.body.id) {
             return res.status(400).json({ success: false, message: "A counsellor with this email already exists." });
        }
        const counsellor = new Counsellor(req.body);
        const saved = await counsellor.save();
        res.status(201).json({ success: true, data: saved });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateCounsellor = async (req, res) => {
    try {
        if(req.body.email) {
             const existing = await Counsellor.findOne({ email: req.body.email });
             if (existing && existing._id !== req.params.id) {
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

exports.deleteCounsellor = async (req, res) => {
    try {
        const counsellor = await Counsellor.findByIdAndDelete(req.params.id);
        if (!counsellor) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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
    
        res.status(200).json({ success: true, data: counsellor });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
};
