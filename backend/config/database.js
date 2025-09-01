// backend/config/database.js
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

mongoose.set('strictQuery', true); // safe default for newer Mongoose

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set');
    }

    // Keep your original shape; tuned for Atlas
    const options = {
      // These are fine to keep; ignored in Mongoose 7+ but harmless
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // Pool & timeouts
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // a bit higher for first connect to Atlas
      socketTimeoutMS: 45000,
      family: 4, // stick to IPv4 to avoid odd DNS/IPv6 issues on Windows

      // Friendly defaults
      autoIndex: process.env.NODE_ENV !== 'production', // speed up prod startup
      appName: 'CarPool', // shows up in Atlas connection logs
    };

    const conn = await mongoose.connect(uri, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database Name: ${conn.connection.name}`);

    // --- events (kept as-is) ---
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // graceful shutdown (added SIGTERM in addition to your SIGINT)
    const cleanExit = async (signal) => {
      try {
        await mongoose.connection.close();
        logger.info(`Mongoose connection closed on ${signal}`);
        process.exit(0);
      } catch (error) {
        logger.error('Error closing mongoose connection:', error);
        process.exit(1);
      }
    };
    process.on('SIGINT', () => cleanExit('SIGINT'));
    process.on('SIGTERM', () => cleanExit('SIGTERM'));

    return conn;
  } catch (error) {
    logger.error('Database connection failed:', error.message);

    // keep your granular hints; add one for DNS/SRV issues
    if (error.message.includes('ECONNREFUSED')) {
      logger.error('MongoDB server is not running (for local). For Atlas, check your URI/Network Access.');
    } else if (error.message.toLowerCase().includes('authentication')) {
      logger.error('MongoDB authentication failed. Check Atlas DB user & password (URL-encode special chars).');
    } else if (error.message.toLowerCase().includes('timed out') || error.message.includes('server selection')) {
      logger.error('Timeout / server selection failed. In Atlas → Network Access, allow your IP (or 0.0.0.0/0 for testing).');
    } else if (error.message.toLowerCase().includes('querysrv') || error.message.toLowerCase().includes('dns')) {
      logger.error('DNS/SRV error. Ensure you are online and using the mongodb+srv URI from Atlas.');
    }

    process.exit(1);
  }
};

export default connectDB;