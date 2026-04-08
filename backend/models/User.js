const mongoose = require('mongoose');

/**
 * Unified User Model for UniCare Counseling Platform
 * Supports roles: student, counsellor, admin
 * Includes bcrypt-ready password field, IT number validation,
 * and resource bookmarks from the Wellness module.
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'counsellor', 'admin'],
    default: 'student'
  },
  itNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^[A-Z]{2}[0-9]{4}[0-9]{4}$/, 'IT number must be in format: IT23XXXXXX']
  },
  // Counsellor-specific fields (populated if role === 'counsellor')
  specialization: {
    type: String,
    default: ''
  },
  // Bookmarked resource IDs (for Wellness Resource Library)
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    default: []
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
