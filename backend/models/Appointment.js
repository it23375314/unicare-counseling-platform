const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: false
  },
  studentId: {
    type: String,
  },
  studentPhone: {
    type: String,
    required: false
  },
  emergencyContact: {
    type: String, // Name + Relation
    required: false
  },
  reasonDescription: {
    type: String,
    required: false
  },
  counsellorId: {
    type: String, // Changed from ObjectId to support universal seeding
    required: true
  },
  counsellorName: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // HH:MM AM/PM
    required: true
  },
  sessionType: {
    type: String,
    enum: ['Individual', 'Group'],
    required: true
  },
  issueCategory: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid'
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    default: 'Video Session'
  },
  refundStatus: {
    type: String,
    enum: ['None', 'Eligible', 'Not Eligible', 'Processing', 'Refunded'],
    default: 'None'
  },
  cancelReason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
