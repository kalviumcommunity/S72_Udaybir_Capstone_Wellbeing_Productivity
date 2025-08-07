const express = require('express');
const router = express.Router();
const FocusSession = require('../models/FocusSession');
const auth = require('../middleware/auth');

// @route   GET api/focus-sessions
// @desc    Get all focus sessions for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const focusSessions = await FocusSession.find({ user: req.user.id }).sort({ date: -1 });
    res.json(focusSessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/focus-sessions
// @desc    Create a new focus session
// @access  Private
router.post('/', auth, async (req, res) => {
  const { date, duration, type } = req.body;

  try {
    const newFocusSession = new FocusSession({
      user: req.user.id,
      date: date ? new Date(date) : new Date(),
      duration,
      type
    });

    const focusSession = await newFocusSession.save();
    res.json(focusSession);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/focus-sessions/:id
// @desc    Delete a focus session
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const focusSession = await FocusSession.findById(req.params.id);
    
    if (!focusSession) {
      return res.status(404).json({ message: 'Focus session not found' });
    }
    
    // Check if user owns the focus session
    if (focusSession.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await focusSession.remove();
    res.json({ message: 'Focus session removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Focus session not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 