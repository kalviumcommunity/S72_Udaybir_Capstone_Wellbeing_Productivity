
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { csrfProtection, csrfErrorHandler, generateToken } = require('./middleware/csrf');
require('dotenv').config();

const app = express();

// Trust proxy (Render/Cloudflare) so rate limiter can use X-Forwarded-For
// We are typically behind Cloudflare and Render → ~2 proxy hops
app.set('trust proxy', 2);

const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Add CSRF protection to all routes (temporarily disabled for stability)
// app.use('/api/', csrfProtection);

// Add session tracking middleware
app.use('/api/', (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (token) {
    // Track active sessions
    req.sessionId = token;
  }
  next();
});

// Add CSRF error handler (temporarily disabled)
// app.use(csrfErrorHandler);

// CORS middleware
const allowedOrigins = [
  'https://sentiencehub.netlify.app',
  'http://localhost:3000',
  'http://localhost:4173'
];
const allowedOriginRegexes = [
  /^https:\/\/deploy-preview-\d+--sentiencehub\.netlify\.app$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin
    if (allowedOrigins.includes(origin) || allowedOriginRegexes.some((re) => re.test(origin))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Add preflight handler for all routes
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

// Environment validation
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://uday:uday@cluster0.n2vzkur.mongodb.net/student-sentience?retryWrites=true&w=majority';
console.log('Connecting to MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected Successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
});

// Connect with better error handling
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 1,
})
.catch(err => {
  console.error('❌ MongoDB Connection Failed:', err.message);
  console.log('⚠️  Server will start but database operations may fail');
});

// Import Route Files
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const commentRoutes = require('./routes/commentRoutes');
const taskRoutes = require('./routes/taskRoutes');
const moodRoutes = require('./routes/moodRoutes');
const studyRoutes = require('./routes/studyRoutes');
const focusRoutes = require('./routes/focusRoutes');

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/study-sessions', studyRoutes);
app.use('/api/focus-sessions', focusRoutes);

// CSRF Token Generation
app.get('/api/csrf-token', generateToken);

// Server Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
