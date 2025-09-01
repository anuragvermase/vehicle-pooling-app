// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/user.js';
import dashboardRoutes from './routes/dashboard.js';
import rideRoutes from './routes/rides.js';       // includes POST /api/rides/create and POST /api/rides
import bookingRoutes from './routes/bookings.js';
import chatRoutes from './routes/chat.js';
import auth from './middleware/auth.js';
import { initializeSocket } from './Socket/socketHandlers.js';
import { logger } from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

/* ------------------------------- Hardening ------------------------------- */
app.disable('x-powered-by');

/* -------------------------- Env sanity (log-only) ------------------------- */
for (const key of ['JWT_SECRET', 'MONGODB_URI']) {
  if (!process.env[key]) {
    logger.warn(`[env] ${key} is not set. Some features may not work as expected.`);
  }
}

/* ------------------------- CORS origin resolution ------------------------- */
/**
 * - If FRONTEND_URLS is set: comma-separated list of origins
 * - Else if FRONTEND_URL is set: single origin
 * - Dev: allow all (true) so Expo/localhost variants work
 */
const frontends =
  process.env.FRONTEND_URLS?.split(',').map(s => s.trim()).filter(Boolean) ||
  (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []);

const expressCorsOrigin = isProd ? frontends : true; // true = reflect request origin (dev)
const socketCorsOrigin = isProd ? frontends : true;

/* -------------------------------- Socket.IO ------------------------------ */
const io = new Server(server, {
  cors: {
    origin: socketCorsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});
initializeSocket(io);
app.set('socketio', io);

/* --------------------------------- CORS ---------------------------------- */
app.use(
  cors({
    origin: expressCorsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Explicit preflight for all routes
app.options('*', cors({ origin: expressCorsOrigin, credentials: true }));

/* ------------------------------- Parsers ---------------------------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* --------------------------- Static file serving -------------------------- */
// serve uploaded avatars: /uploads/avatars/<file>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------------------------- Request logger ------------------------------ */
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

/* ------------------------------- Root ping -------------------------------- */
app.get('/', (_req, res) => {
  res.status(200).send('OK. See /api/health');
});

/* ---------------------------- Health / Status ----------------------------- */
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    websocket: 'Connected',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/status', (_req, res) => {
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

/* -------------------------- Minimal avatar upload ------------------------- */
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

/* --------------------------------- Routes -------------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);

// Current user (profile basics)
app.get('/api/auth/me', auth, async (req, res, next) => {
  try {
    const uid = req.user?.id || req.user?._id;
    if (!uid) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const User = (await import('./models/User.js')).default;
    const user = await User.findById(uid).select(
      'name fullName username firstName lastName email avatarUrl profilePicture'
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

// Avatar upload
app.post('/api/auth/avatar', auth, uploadAvatar.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    const uid = req.user?.id || req.user?._id;

    const User = (await import('./models/User.js')).default;
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

/* ---------------------------------- 404 ---------------------------------- */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/* --------------------------- Global error handler ------------------------- */
app.use((error, _req, res, _next) => {
  logger.error('Unhandled error:', error);
  const message = isProd ? 'Internal server error' : error.message;
  res.status(error.status || 500).json({
    success: false,
    message,
    ...(!isProd && { stack: error.stack }),
  });
});

/* ------------------------------- Utilities -------------------------------- */
function getLanIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

/* ------------------------------- Start up --------------------------------- */
const startServer = async () => {
  try {
    await connectDB();

    // Bind to 0.0.0.0 so phones on your LAN can reach it
    server.listen(PORT, '0.0.0.0', () => {
      const ip = getLanIPv4();
      const origins = expressCorsOrigin === true ? '(any - dev)' : JSON.stringify(frontends);

      logger.info(`🚗 RideShare Pro Server running on port ${PORT}`);
      logger.info(`🔗 Local Health:  http://localhost:${PORT}/api/health`);
      logger.info(`📱 Phone Health:  http://${ip}:${PORT}/api/health`);
      logger.info(`🔌 WebSocket: Active`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 CORS Origins: ${origins}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/* --------------------------- Graceful shutdown ---------------------------- */
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forcing shutdown');
    process.exit(1);
  }, 10_000);
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
