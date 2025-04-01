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

module.exports = router;