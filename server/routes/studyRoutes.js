const express = require('express');
const router = express.Router();
const StudySession = require('../models/StudySession');
const auth = require('../middleware/auth');

// @route   GET api/study-sessions
// @desc    Get all study sessions for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const studySessions = await StudySession.find({ user: req.user.id }).sort({ date: -1 });
    res.json(studySessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/study-sessions
// @desc    Create a new study session
// @access  Private
router.post('/', auth, async (req, res) => {
  const { subject, date, startTime, duration, notes } = req.body;

  try {
    const newStudySession = new StudySession({
      user: req.user.id,
      subject,
      date: date ? new Date(date) : new Date(),
      startTime,
      duration,
      notes
    });

    const studySession = await newStudySession.save();
    res.json(studySession);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/study-sessions/:id
// @desc    Update a study session
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const studySession = await StudySession.findById(req.params.id);
    
    if (!studySession) {
      return res.status(404).json({ message: 'Study session not found' });
    }
    
    // Check if user owns the study session
    if (studySession.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    const { subject, date, startTime, duration, notes } = req.body;
    
    // Update fields
    if (subject !== undefined) studySession.subject = subject;
    if (date !== undefined) studySession.date = new Date(date);
    if (startTime !== undefined) studySession.startTime = startTime;
    if (duration !== undefined) studySession.duration = duration;
    if (notes !== undefined) studySession.notes = notes;
    
    await studySession.save();
    res.json(studySession);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Study session not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/study-sessions/:id
// @desc    Delete a study session
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const studySession = await StudySession.findById(req.params.id);
    
    if (!studySession) {
      return res.status(404).json({ message: 'Study session not found' });
    }
    
    // Check if user owns the study session
    if (studySession.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await studySession.remove();
    res.json({ message: 'Study session removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Study session not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 