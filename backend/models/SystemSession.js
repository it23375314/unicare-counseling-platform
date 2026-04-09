const mongoose = require('mongoose');

/**
 * SystemSession Model — tracks active device sessions per user
 * Used by the Settings page → "Logged-in Devices" section
 * Named SystemSession to avoid conflict with any existing Session model
 */
const SystemSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  device: {
    type: String,
    default: 'Unknown Device'
  },
  location: {
    type: String,
    default: 'Unknown Location'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSession', SystemSessionSchema);
