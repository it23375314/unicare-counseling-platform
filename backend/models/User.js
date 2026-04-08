const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ['student', 'counsellor', 'admin'], default: 'student' },
  phone: String,
  age: Number,
  religion: String,
  
  // --- NEW SECURITY FIELDS ---
  otp: { type: String }, // Stores the 4-digit code temporarily
  isVerified: { type: Boolean, default: false }, // Tracks if email is confirmed

  // These only fill if role === 'counsellor'
  specialization: String,
  experience: Number,
  licenseNumber: String,
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);