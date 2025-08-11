
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

// Rate limiting with memory leak prevention
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  // Use default keyGenerator to avoid IPv6 issues
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(15 * 60 / 60), // minutes
    });
  },
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Add CSRF protection to all routes
app.use('/api/', csrfProtection);

// Add session tracking middleware with memory cleanup
const activeSessions = new Map();
const SESSION_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [token, timestamp] of activeSessions.entries()) {
    if (now - timestamp > 24 * 60 * 60 * 1000) { // 24 hours
      activeSessions.delete(token);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
  }
}, SESSION_CLEANUP_INTERVAL);

app.use('/api/', (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (token) {
    // Track active sessions with timestamp
    activeSessions.set(token, Date.now());
    req.sessionId = token;
  }
  next();
});

// Add CSRF error handler
app.use(csrfErrorHandler);

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
// Body parsing with limits to prevent memory issues
app.use(express.json({ 
  limit: '5mb', // Reduced from 10mb to prevent large payload attacks
  strict: true,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

// Add request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 second timeout
  res.setTimeout(30000);
  next();
});

// Environment validation
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI is not set in environment variables');
  process.exit(1);
}

// Set Mongoose options to avoid deprecation warnings
mongoose.set('strictQuery', false);

console.log('Connecting to MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

// Add connection event listeners with automatic reconnection
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected Successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
  // Attempt to reconnect after a delay
  setTimeout(() => {
    if (mongoose.connection.readyState === 0) {
      console.log('🔄 Attempting to reconnect to MongoDB...');
      connectWithRetry();
    }
  }, 5000);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
  // Attempt to reconnect after a delay
  setTimeout(() => {
    if (mongoose.connection.readyState === 0) {
      console.log('🔄 Attempting to reconnect to MongoDB...');
      connectWithRetry();
    }
  }, 5000);
});

// Connect with modern connection options and connection pooling
const connectWithRetry = async (retryCount = 0, maxRetries = 5) => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority',
      keepAlive: true,
      keepAliveInitialDelay: 300000,
      heartbeatFrequencyMS: 30000,
      maxIdleTimeMS: 60000,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error(`❌ MongoDB Connection Failed (attempt ${retryCount + 1}/${maxRetries}):`, err.message);
    
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
      console.log(`🔄 Retrying connection in ${delay}ms...`);
      setTimeout(() => connectWithRetry(retryCount + 1, maxRetries), delay);
    } else {
      console.log('⚠️  Max retries reached. Server will start but database operations may fail');
    }
  }
};

// Initial connection attempt
connectWithRetry();

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

// Server Health Check with MongoDB status and memory info
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const mongoReadyState = mongoose.connection.readyState;
  
  // Get memory usage for monitoring
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  res.json({ 
    status: mongoStatus === 'connected' ? 'ok' : 'degraded', 
    message: 'Server is running',
    mongodb: {
      status: mongoStatus,
      readyState: mongoReadyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    },
    memory: memUsageMB,
    activeSessions: activeSessions ? activeSessions.size : 0,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  
  // Start memory monitoring
  startMemoryMonitoring();
  console.log('📊 Memory monitoring started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  
  // Clear memory monitoring interval
  if (memoryUsageInterval) {
    clearInterval(memoryUsageInterval);
    console.log('📊 Memory monitoring stopped');
  }
  
  server.close(() => {
    console.log('✅ Server closed');
    
    // Clear session cleanup interval
    if (activeSessions) {
      activeSessions.clear();
      console.log('🧹 Active sessions cleared');
    }
    
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  
  // Clear memory monitoring interval
  if (memoryUsageInterval) {
    clearInterval(memoryUsageInterval);
    console.log('📊 Memory monitoring stopped');
  }
  
  server.close(() => {
    console.log('✅ Server closed');
    
    // Clear session cleanup interval
    if (activeSessions) {
      activeSessions.clear();
      console.log('🧹 Active sessions cleared');
    }
    
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Memory monitoring
let memoryUsageInterval;
const startMemoryMonitoring = () => {
  memoryUsageInterval = setInterval(() => {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    // Log memory usage every 5 minutes
    console.log(`📊 Memory Usage: RSS: ${memUsageMB.rss}MB, Heap: ${memUsageMB.heapUsed}MB/${memUsageMB.heapTotal}MB, External: ${memUsageMB.external}MB`);
    
    // Force garbage collection if memory usage is high
    if (memUsageMB.heapUsed > 100) { // If heap usage > 100MB
      if (global.gc) {
        global.gc();
        console.log('🧹 Forced garbage collection');
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
};

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
