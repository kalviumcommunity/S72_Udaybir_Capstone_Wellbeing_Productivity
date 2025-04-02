
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // Create and sign JWT
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'sentience-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      userId: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create and sign JWT
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'sentience-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      userId: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // Authentication middleware would attach user to req object
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
