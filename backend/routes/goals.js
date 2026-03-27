const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// 1. CREATE GOAL
router.post('/', async (req, res) => {
  try {
    const { 
      userId, title, targetDate, category, priority, description, 
      frequency, customFrequency, progressType, targetValue, reward, 
      reminderEnabled, reminderTime 
    } = req.body;
    
    const newGoal = new Goal({ 
      userId, 
      title, 
      targetDate, 
      category, 
      priority,
      description,
      frequency,
      // Ensure numerical values are parsed correctly, fallback to 0
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
    console.error("Error saving goal:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. GET ARCHIVED GOALS (MUST BE TOP)
router.get('/archive/:userId', async (req, res) => {
  try {
    const goals = await Goal.find({ 
      userId: req.params.userId, 
      isCompleted: true 
    }).sort({ updatedAt: -1 }).lean({ defaults: true });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: "Archive Fetch Failed" });
  }
});

// 3. GET ALL GOALS FOR USER
router.get('/:userId', async (req, res) => {
  try {
    // Safety check: Prevent 'archive' from being treated as a userId
    if (req.params.userId === 'archive') return;

    const goals = await Goal.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean({ defaults: true });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: "Goals Fetch Failed" });
  }
});

// 4. MARK COMPLETE & RECORD MOOD
router.put('/complete/:goalId', async (req, res) => {
  try {
    // Extract mood if passed from the frontend verification modal
    const { mood } = req.body; 

    const goal = await Goal.findById(req.params.goalId);
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    
    // Increment streak and mark as completed
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
    res.status(500).json({ error: "Update Failed" });
  }
});

// 5. DELETE GOAL
router.delete('/:goalId', async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.goalId);
    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete Failed" });
  }
});

module.exports = router;