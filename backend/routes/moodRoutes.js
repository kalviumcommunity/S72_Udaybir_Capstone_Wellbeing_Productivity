
const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');

// Get all mood entries for a user
router.get('/:userId', async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mood entries for a specific date range
router.get('/:userId/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { 
      userId: req.params.userId,
      date: {}
    };
    
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
    
    const moods = await Mood.find(query).sort({ date: -1 });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;