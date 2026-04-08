const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    user: { type: String, default: "System" },
    type: { type: String, enum: ['Security', 'Action', 'Warning', 'System'], default: 'Action' },
    icon: { type: String, default: "📝" },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);