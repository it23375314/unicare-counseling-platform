const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');

// POST /api/moods — save a new mood entry (one per day per user)
router.post('/', async (req, res) => {
  try {
    const {
      userId, entryDate, moodText, moodScore,
      aiResponse, suggestedResources, counselingRecommended, displayName
    } = req.body;

    if (!userId || !entryDate || !moodText) {
      return res.status(400).json({ msg: 'userId, entryDate, and moodText are required.' });
    }

    const existing = await MoodEntry.findOne({ userId, entryDate });
    if (existing) {
      return res.status(409).json({ msg: 'Only one mood entry is allowed per day.' });
    }

    const entry = new MoodEntry({
      userId,
      entryDate,
      moodText,
      moodScore: moodScore || undefined,
      aiResponse: aiResponse || '',
      suggestedResources: Array.isArray(suggestedResources) ? suggestedResources : [],
      counselingRecommended: Boolean(counselingRecommended),
      displayName: displayName || ''
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Mood Save Error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'Only one mood entry is allowed per day.' });
    }
    res.status(500).json({ msg: 'Server error.' });
  }
});

// GET /api/moods/:userId — fetch mood history for a user
router.get('/:userId', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 0);
    let query = MoodEntry.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    if (limit > 0) query = query.limit(limit);
    const entries = await query.lean();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: 'Mood history fetch failed.' });
  }
});

module.exports = router;
