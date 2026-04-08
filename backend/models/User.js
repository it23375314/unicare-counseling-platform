const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['student', 'counsellor', 'admin'],
    default: 'student'
  },
  password: {
    type: String,
    default: 'password123'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
