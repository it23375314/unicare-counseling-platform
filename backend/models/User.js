const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  itNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^[A-Z]{2}[0-9]{4}[0-9]{4}$/ 
  },
  // NEW: Store bookmarked resource IDs
  bookmarks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Resource',
    default: []
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);