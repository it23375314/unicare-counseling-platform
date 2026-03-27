const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetDate: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ['Personal', 'Academic', 'Health', 'Fitness', 'Career'], 
    default: 'Personal' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  
  // Frequency Tracking
  frequency: { 
    type: String, 
    enum: ['Daily', 'Weekdays', 'Weekly', 'Custom'],
    default: 'Daily' 
  },
  customFrequency: { type: Number, default: 0 },
  
  // Progress Tracking
  progressType: { 
    type: String, 
    enum: ['Binary', 'Numeric', 'Timer-based'],
    default: 'Binary' 
  },
  targetValue: { type: Number, default: 0 },
  
  // Motivation & Reminders
  reward: { type: String, default: '' },
  reminderEnabled: { type: Boolean, default: false },
  reminderTime: { type: String, default: '' },
  
  // Status & Gamification
  isCompleted: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  lastCompletionMood: { 
    type: String, 
    enum: ['Sad', 'Neutral', 'Happy', null], 
    default: null 
  }

}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);