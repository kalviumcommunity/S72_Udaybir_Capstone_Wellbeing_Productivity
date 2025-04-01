const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  mood: {
    type: Number, // 1-5 rating
    required: true,
    min: 1,
    max: 5
  },
  notes: {
    type: String
  },
  activities: [{
    type: String
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mood', MoodSchema);