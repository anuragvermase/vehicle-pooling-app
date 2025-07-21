import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('+isActive');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated. Please contact support.'
        });
      }

      // Check if user account is locked
      if (user.isLocked) {
        return res.status(401).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts.'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (jwtError) {
      logger.error('JWT verification failed:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }

  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Generate JWT Token
export const generateToken = (id) => {
  if (!id) {
    throw new Error('User ID is required to generate token');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Verify token utility
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};