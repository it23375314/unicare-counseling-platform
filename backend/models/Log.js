const mongoose = require('mongoose');

/**
 * Log Model — tracks platform activity events (logins, registrations, warnings, system events)
 * Used by the Admin → Platform Logs page
 */
const LogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    default: ''
  },
  user: {
    type: String,
    default: 'System'
  },
  type: {
    type: String,
    enum: ['Action', 'Security', 'Warning', 'System'],
    default: 'Action'
  },
  icon: {
    type: String,
    default: '📄'
  }
}, { timestamps: true });

// Virtual alias so frontend can read log.timestamp from createdAt
LogSchema.virtual('timestamp').get(function () {
  return this.createdAt;
});

LogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Log', LogSchema);
