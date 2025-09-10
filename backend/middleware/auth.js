import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

/** Extract JWT from common places (headers, cookies, query) */
function extractToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (auth && typeof auth === 'string') {
    const parts = auth.trim().split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
    if (parts.length === 1) return parts[0];
  }
  if (req.headers['x-auth-token']) return req.headers['x-auth-token'];
  if (req.headers['x-access-token']) return req.headers['x-access-token'];
  if (req.cookies?.token) return req.cookies.token;
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const decodedId = decoded?.id || decoded?._id || decoded?.sub || decoded?.userId;
      if (!decodedId) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. No subject.',
        });
      }

      // include role/isBanned in selection so Admin guard works
      const user = await User.findById(decodedId).select('+isActive +isLocked role isBanned');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.',
        });
      }

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

      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          message: 'Your account is banned. Contact support.',
        });
      }

      req.user = user;
      req.userId = String(user._id);
      req.auth = { token, decoded };

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

export default protect;
