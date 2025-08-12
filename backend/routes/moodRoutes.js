import express from 'express';
const router = express.Router();
import MoodEntry from '../models/MoodEntry.js';
import auth from '../middleware/auth.js';

// @route   GET api/mood
// @desc    Get all mood entries for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const moodEntries = await MoodEntry.find({ user: req.user.id }).sort({ date: -1 });
    res.json(moodEntries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/mood
// @desc    Create a new mood entry
// @access  Private
router.post('/', auth, async (req, res) => {
  const { mood, note, date } = req.body;

  try {
    const newMoodEntry = new MoodEntry({
      user: req.user.id,
      mood,
      note,
      date: date ? new Date(date) : new Date()
    });

    const moodEntry = await newMoodEntry.save();
    res.json(moodEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/mood/:id
// @desc    Delete a mood entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const moodEntry = await MoodEntry.findById(req.params.id);
    
    if (!moodEntry) {
      return res.status(404).json({ message: 'Mood entry not found' });
    }
    
    // Check if user owns the mood entry
    if (moodEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await MoodEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mood entry removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Mood entry not found' });
    }
    res.status(500).send('Server error');
  }
});

export default router; 