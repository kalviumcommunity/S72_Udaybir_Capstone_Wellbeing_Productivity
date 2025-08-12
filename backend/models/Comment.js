import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    avatar: String
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Comment', CommentSchema); 