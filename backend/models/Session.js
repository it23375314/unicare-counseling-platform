const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    device: String,
    location: String,
    lastSeen: { type: Date, default: Date.now },
    token: String
});

module.exports = mongoose.model('Session', sessionSchema);