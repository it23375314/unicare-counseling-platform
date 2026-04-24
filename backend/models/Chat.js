const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderId: {
    type: String, // Can be user ID or student ID
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  role: {
    type: String,
    enum: ['student', 'counsellor'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexing for faster lookups
chatSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);
