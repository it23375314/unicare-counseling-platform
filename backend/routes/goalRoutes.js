const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// 1. CREATE GOAL
router.post('/', async (req, res) => {
  try {
    const {
      userId, title, targetDate, deadline, category, priority, description,
      frequency, customFrequency, progressType, targetValue, reward,
      reminderEnabled, reminderTime
    } = req.body;
    const normalizedDeadline = deadline || targetDate;

    const newGoal = new Goal({
      userId,
      title,
      targetDate: targetDate || normalizedDeadline,
      deadline: normalizedDeadline,
      category,
      priority,
      description,
      frequency,
      customFrequency: customFrequency ? Number(customFrequency) : 0,
      progressType,
      targetValue: targetValue ? Number(targetValue) : 0,
      reward,
      reminderEnabled,
      reminderTime,
      isCompleted: false,
      streak: 0
    });

    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    console.error('Error saving goal:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. GET ARCHIVED GOALS (completed) — must be above /:userId
router.get('/archive/:userId', async (req, res) => {
  try {
    const goals = await Goal.find({
      userId: req.params.userId,
      isCompleted: true
    }).sort({ updatedAt: -1 }).lean({ defaults: true });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Archive Fetch Failed' });
  }
});

// 3. GET ALL ACTIVE GOALS FOR A USER
router.get('/:userId', async (req, res) => {
  try {
    if (req.params.userId === 'archive') return;

    const goals = await Goal.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean({ defaults: true });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Goals Fetch Failed' });
  }
});

// 4. MARK GOAL AS COMPLETE & RECORD MOOD
router.put('/complete/:goalId', async (req, res) => {
  try {
    const { mood } = req.body;

    const goal = await Goal.findById(req.params.goalId);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.goalId,
      {
        isCompleted: true,
        streak: (goal.streak || 0) + 1,
        lastCompletionMood: mood || goal.lastCompletionMood
      },
      { new: true }
    );
    res.json(updatedGoal);
  } catch (err) {
    res.status(500).json({ error: 'Update Failed' });
  }
});

// 5. DELETE GOAL
router.delete('/:goalId', async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.goalId);
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete Failed' });
  }
});

module.exports = router;
