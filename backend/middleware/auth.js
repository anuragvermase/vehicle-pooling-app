// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

/** Extract JWT from common places (headers, cookies, query) */
function extractToken(req) {
  // Standard Authorization header: "Bearer <token>" or just "<token>"
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth && typeof auth === 'string') {
    const parts = auth.trim().split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
    if (parts.length === 1) return parts[0]; // allow raw token
  }
  // Alt headers some clients use
  if (req.headers['x-auth-token']) return req.headers['x-auth-token'];
  if (req.headers['x-access-token']) return req.headers['x-access-token'];

  // Optional cookie (if you ever set it)
  if (req.cookies?.token) return req.cookies.token;

  // Optional query param (useful for webviews/sockets if needed)
  if (req.query?.token) return req.query.token;

  return null;
}

export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Support multiple claim names for the user id
      const decodedId = decoded?.id || decoded?._id || decoded?.sub || decoded?.userId;
      if (!decodedId) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. No subject.',
        });
      }

      // Load user; include flags if they’re excluded by default
      const user = await User.findById(decodedId).select('+isActive +isLocked');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.',
        });
      }

      // Business rules you already had
      if (user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated. Please contact support.',
        });
      }

      if (user.isLocked) {
        return res.status(401).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts.',
        });
      }

      // Attach to request (more convenient for routes)
      req.user = user;                    // full user doc
      req.userId = String(user._id);      // plain id
      req.auth = { token, decoded };      // optional useful context

      return next();
    } catch (jwtError) {
      logger.error('JWT verification failed:', jwtError);

      if (jwtError?.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Token is not valid.',
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};

// Generate JWT Token (unchanged)
export const generateToken = (id) => {
  if (!id) {
    throw new Error('User ID is required to generate token');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Verify token utility (unchanged)
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};

// Also export default for convenience: `import auth from './middleware/auth.js'`
export default protect;
