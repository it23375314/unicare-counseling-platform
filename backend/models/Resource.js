const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  resourceType: {
    type: String,
    enum: ['Article', 'Video', 'PDF', 'Audio', 'Link'],
    required: true
  },
  category: { type: String, required: true }, // e.g. Stress, Anxiety, Depression
  tags: [String],
  content: { type: String },       // Text for articles or URL for videos/links
  fileUrl: { type: String },       // Path for uploaded PDF/Audio
  imageUrl: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  language: {
    type: String,
    enum: ['English', 'Sinhala', 'Tamil'],
    default: 'English'
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Published'
  },

  // Usage tracking (without exposing student personal data)
  viewedBy: [{
    studentId: String, // stores itNumber
    timestamp: { type: Date, default: Date.now }
  }],
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
