import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
      keepAlive: true,
      keepAliveInitialDelay: 300000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Set strict query to false to suppress deprecation warnings
    mongoose.set('strictQuery', false);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB; 