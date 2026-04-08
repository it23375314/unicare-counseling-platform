const mongoose = require('mongoose');

<<<<<<< HEAD
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
=======
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
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
  },
  email: {
    type: String,
    required: true,
<<<<<<< HEAD
    unique: true
=======
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
  },
  role: {
    type: String,
    enum: ['student', 'counsellor', 'admin'],
    default: 'student'
  },
<<<<<<< HEAD
  password: {
    type: String,
    default: 'password123'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
=======
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
>>>>>>> 8fb9068df7e128346a2da11006239f32da7d6dcc
