import mongoose from 'mongoose';

const FocusSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  type: {
    type: String,
    enum: ['work', 'break'],
    required: true
  }
});

export default mongoose.model('FocusSession', FocusSessionSchema); 