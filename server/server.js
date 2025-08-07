
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: [
    'https://sentiencehub.netlify.app',
    'https://student-sentience.vercel.app',
    'https://your-app-name.vercel.app', // Replace with your actual Vercel domain
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Capstone';
console.log('Connecting to MongoDB:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log('Database URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('Error details:', err);
  
  // Don't exit the process, let it continue but log the error
  console.log('⚠️  Server will start but database operations may fail');
});

// Import Route Files
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const taskRoutes = require('./routes/taskRoutes');
const moodRoutes = require('./routes/moodRoutes');
const studyRoutes = require('./routes/studyRoutes');
const focusRoutes = require('./routes/focusRoutes');

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/study-sessions', studyRoutes);
app.use('/api/focus-sessions', focusRoutes);

// Server Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
