const Counsellor = require('../models/Counsellor');

// Get all counsellors
exports.getAllCounsellors = async (req, res) => {
  try {
    const counsellors = await Counsellor.find();
    res.json(counsellors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get counsellor by ID
exports.getCounsellorById = async (req, res) => {
  try {
    const counsellor = await Counsellor.findById(req.params.id);
    if (!counsellor) return res.status(404).json({ message: 'Counsellor not found' });
    res.json(counsellor);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(201).json(newCounsellor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update availability for a counsellor
exports.updateAvailability = async (req, res) => {
  try {
    const { date, slots } = req.body;
    const counsellor = await Counsellor.findById(req.params.id);
    if (!counsellor) return res.status(404).json({ message: 'Counsellor not found' });

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
    res.json(counsellor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
