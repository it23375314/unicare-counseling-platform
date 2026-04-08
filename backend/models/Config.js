const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    // Match these exactly to your SystemConfig.jsx state
    maintenanceMode: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    publicFeedback: { type: Boolean, default: true }, // Changed from registrationEnabled
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Config', ConfigSchema);