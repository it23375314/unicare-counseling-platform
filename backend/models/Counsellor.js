const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  slots: [{
    type: String // HH:MM AM/PM
  }]
});

const counsellorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
  },
  price: {
    type: Number,
    default: 40
  },
  availability: [availabilitySchema]
}, { timestamps: true });

module.exports = mongoose.model('Counsellor', counsellorSchema);
