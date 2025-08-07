const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Note = require('../models/Note');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/comments/:noteId
// @desc    Get all comments for a note
// @access  Public
router.get('/:noteId', async (req, res) => {
  try {
    const comments = await Comment.find({ note: req.params.noteId })
      .populate('author.id', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/comments/:noteId
// @desc    Add a comment to a note
// @access  Private
router.post('/:noteId', auth, async (req, res) => {
  const { content } = req.body;

  try {
    // Check if note exists
    const note = await Note.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Get user info
    const user = await User.findById(req.user.id).select('-password');
    
    const newComment = new Comment({
      note: req.params.noteId,
      content,
      author: {
        id: req.user.id,
        name: user.name,
        avatar: user.avatar
      }
    });

    const comment = await newComment.save();

    // Update comment count on the note
    note.comments += 1;
    await note.save();

    // Populate author info for response
    await comment.populate('author.id', 'name avatar');

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author
    if (comment.author.id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update comment count on the note
    const note = await Note.findById(comment.note);
    if (note) {
      note.comments = Math.max(0, note.comments - 1);
      await note.save();
    }
    
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 