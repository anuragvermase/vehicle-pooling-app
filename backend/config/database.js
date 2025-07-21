import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  try {
    // Mongoose connection options (updated for newer versions)
    const options = {
      // Basic connection options
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Connection pool settings
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      
      // Remove deprecated options
      // bufferCommands: false, // Remove this line
      // bufferMaxEntries: 0 // Remove this line
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('Mongoose connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing mongoose connection:', error);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    
    // More specific error handling
    if (error.message.includes('ECONNREFUSED')) {
      logger.error('MongoDB server is not running. Please start MongoDB first.');
      logger.info('To start MongoDB locally, run: mongod');
    } else if (error.message.includes('authentication failed')) {
      logger.error('MongoDB authentication failed. Check your credentials.');
    } else if (error.message.includes('network timeout')) {
      logger.error('Network timeout. Check your MongoDB URI and network connection.');
    }
    
    process.exit(1);
  }
};

export default connectDB;