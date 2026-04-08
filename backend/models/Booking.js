const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  counsellor: { type: String, required: true },
  counsellorName: { type: String },
  studentName: { type: String, required: true },
  studentId: { type: String },
  studentEmail: { type: String },
  studentContact: { type: String },
  studentProfile: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  sessionType: { type: String },
  status: { type: String, default: 'Pending' },
  paymentStatus: { type: String },
  refundStatus: { type: String },
  rejectReason: { type: String },
  notes: { type: String }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
    }
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
