const mongoose = require('mongoose');

/**
 * Config Model — single-document system configuration
 * Used by the Admin → System Config page
 */
const ConfigSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  publicFeedback: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Config', ConfigSchema);
