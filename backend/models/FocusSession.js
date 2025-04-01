
const mongoose = require('mongoose');

const FocusSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  mode: {
    type: String,
    enum: ['focus', 'shortBreak', 'longBreak'],
    default: 'focus'
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FocusSession', FocusSessionSchema);
