
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
// Add a new mood entry
router.post('/', async (req, res) => {
  const mood = new Mood(req.body);
  
  try {
    const newMood = await mood.save();
    res.status(201).json(newMood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a mood entry
router.put('/:id', async (req, res) => {
  try {
    const updatedMood = await Mood.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMood) return res.status(404).json({ message: 'Mood entry not found' });
    res.json(updatedMood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a mood entry
router.delete('/:id', async (req, res) => {
  try {
    const mood = await Mood.findByIdAndDelete(req.params.id);
    if (!mood) return res.status(404).json({ message: 'Mood entry not found' });
    res.json({ message: 'Mood entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mood statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const { timeframe } = req.query;
    let startDate;
    
    // Calculate the start date based on the timeframe
    const now = new Date();
    if (timeframe === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (timeframe === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (timeframe === 'year') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else {
      startDate = new Date(0); // Default to all time
    }
    
    const moods = await Mood.find({
      userId: req.params.userId,
      date: { $gte: startDate }
    });
    
    // Calculate average mood
    let moodSum = 0;
    moods.forEach(mood => {
      moodSum += mood.mood;
    });
    
    const averageMood = moods.length > 0 ? moodSum / moods.length : 0;
    
    // Count occurrence of each mood level
    const moodCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    moods.forEach(mood => {
      moodCounts[mood.mood]++;
    });
    
    res.json({
      total: moods.length,
      average: averageMood,
      counts: moodCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;