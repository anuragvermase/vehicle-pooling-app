// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import { createServer } from 'http';
import { Server } from 'socket.io';

// ✨ NEW: small additions for uploads & current-user
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import auth from './middleware/auth.js';
import User from './models/User.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ✨ END NEW

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import rideRoutes from './routes/rides.js';
import bookingRoutes from './routes/bookings.js';
import chatRoutes from './routes/chat.js';
import { initializeSocket } from './Socket/socketHandlers.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

const isProd = process.env.NODE_ENV === 'production';

// ---- Minimal hardening (does not change functionality)
app.disable('x-powered-by');

// Quick env sanity checks (log-only; does NOT crash)
const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    logger.warn(`[env] ${key} is not set. Some features may not work as expected.`);
  }
}

/**
 * Resolve allowed origins
 * - In development: allow all (so Expo Go on your phone can call the API)
 * - In production: use comma-separated FRONTEND_URLS env (e.g. https://web.example.com,https://app.example.com)
 */
const frontends =
  process.env.FRONTEND_URLS?.split(',').map(s => s.trim()).filter(Boolean) ||
  (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []);

const expressCorsOrigin = isProd ? frontends : true; // true == reflect request origin
const socketCorsOrigin = isProd ? frontends : true;

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: socketCorsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize socket handlers
initializeSocket(io);

// Make io available to routes
app.set('socketio', io);

// ---- Middleware
app.use(
  cors({
    origin: expressCorsOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✨ NEW: serve static uploads (so avatar URLs work)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Root ping (quality of life)
app.get('/', (_req, res) => {
  res.status(200).send('OK. See /api/health');
});

// ---- Health & status
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    websocket: 'Connected',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'Online',
      database: 'Connected',
      websocket: 'Active',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// ✨ NEW: minimal avatar upload setup (disk storage under /uploads/avatars)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const orig = file?.originalname || 'avatar.jpg';
    const ext = path.extname(orig) || '.jpg';
    const uid = req.user?.id || req.user?._id || 'user';
    cb(null, `${uid}-${Date.now()}${ext}`);
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

// ---- API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);

// ✨ NEW: Current user endpoint (so the app can show name/avatar after login)
app.get('/api/auth/me', auth, async (req, res, next) => {
  try {
    const uid = req.user?.id || req.user?._id;
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(uid).select(
      'name fullName username firstName lastName email avatarUrl profilePicture'
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

// ✨ NEW: Avatar upload endpoint (persist avatar and return its URL)
app.post('/api/auth/avatar', auth, uploadAvatar.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    const uid = req.user?.id || req.user?._id;

    const user = await User.findByIdAndUpdate(
      uid,
      { avatarUrl: fileUrl, profilePicture: fileUrl },
      { new: true }
    ).select('name email avatarUrl profilePicture');

    res.json({ url: fileUrl, user });
  } catch (e) {
    next(e);
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  const message = isProd ? 'Internal server error' : error.message;
  res.status(error.status || 500).json({
    success: false,
    message,
    ...(!isProd && { stack: error.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// helper to get a LAN IP for quick testing on phone
function getLanIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // IMPORTANT: bind to 0.0.0.0 so phones on your LAN can reach it
    server.listen(PORT, '0.0.0.0', () => {
      const ip = getLanIPv4();
      logger.info(`🚗 RideShare Pro Server running on port ${PORT}`);
      logger.info(`🔗 Local Health:  http://localhost:${PORT}/api/health`);
      logger.info(`📱 Phone Health:  http://${ip}:${PORT}/api/health`);
      logger.info(
        `🌐 Allowed origins: ${expressCorsOrigin === true ? '(any - dev)' : JSON.stringify(frontends)}`
      );
      logger.info(`🔌 WebSocket: Active`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
