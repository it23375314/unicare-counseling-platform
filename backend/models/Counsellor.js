const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  slots: [{ type: String }]
}, { _id: false });

const counsellorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  displayName: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, default: "" },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  bio: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  price: { type: Number, default: 40 },
  status: { type: String, enum: ['online', 'offline'], default: 'online' },
  counsellingType: { type: String, enum: ['online', 'in-person', 'both'], default: 'both' },
  availability: [availabilitySchema]
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
    }
  }
});

module.exports = mongoose.model('Counsellor', counsellorSchema);
