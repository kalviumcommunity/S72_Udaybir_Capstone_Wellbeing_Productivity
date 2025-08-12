import mongoose from 'mongoose';

const MoodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    enum: ['terrible', 'bad', 'neutral', 'good', 'excellent'],
    required: true
  },
  note: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('MoodEntry', MoodEntrySchema); 