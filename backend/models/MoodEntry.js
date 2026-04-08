const mongoose = require('mongoose');

const MoodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entryDate: { type: String, required: true }, // YYYY-MM-DD (client local date)
  moodText: { type: String, required: true },
  moodScore: { type: Number, min: 1, max: 5 },
  aiResponse: { type: String, default: '' },
  suggestedResources: { type: [String], default: [] },
  counselingRecommended: { type: Boolean, default: false },
  displayName: { type: String, default: '' }
}, { timestamps: true });

MoodEntrySchema.index({ userId: 1, entryDate: 1 }, { unique: true });

module.exports = mongoose.model('MoodEntry', MoodEntrySchema);
