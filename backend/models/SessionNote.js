const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema({
  counsellorId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  appointmentId: {
    type: String,
    required: true
  },
  sessionDate: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Severe'],
    required: true
  },
  followUpRecommendation: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Completed'],
    default: 'Draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
