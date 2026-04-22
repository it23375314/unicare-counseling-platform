const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['student', 'counsellor'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexing for faster lookups per session
messageSchema.index({ appointmentId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
