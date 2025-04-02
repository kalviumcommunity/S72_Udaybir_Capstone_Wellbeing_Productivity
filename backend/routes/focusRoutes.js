const express = require('express');
const router = express.Router();
const FocusSession = require('../models/FocusSession');

router.get('/:userId', async (req, res) => {
  try {
    const sessions = await FocusSession.find({ userId: req.params.userId })
      .sort({ completedAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//create a new focus session record
router.post('/', async (req, res) => {
  const session = new FocusSession(req.body);
  
  try {
    const newSession = await session.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:userId/stats', async (req, res) => {
  try {
    const { timeframe } = req.query;
    let startDate;
    
    // Calculate the start date based on the timeframe
    const now = new Date();
    if (timeframe === 'day') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (timeframe === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (timeframe === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startDate = new Date(0); // Default to all time
    }
    
    const sessions = await FocusSession.find({
      userId: req.params.userId,
      completedAt: { $gte: startDate }
    });
    
    // Calculate total focus time in seconds
    let totalFocusTime = 0;
    let focusSessionCount = 0;
    let breakSessionCount = 0;
    
    sessions.forEach(session => {
      totalFocusTime += session.duration;
      
      if (session.mode === 'focus') {
        focusSessionCount++;
      } else {
        breakSessionCount++;
      }
    });
    
    res.json({
      totalSessions: sessions.length,
      totalFocusTime,
      averageSessionLength: sessions.length > 0 ? totalFocusTime / sessions.length : 0,
      focusSessionCount,
      breakSessionCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;