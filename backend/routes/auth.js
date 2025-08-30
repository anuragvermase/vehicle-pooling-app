// backend/routes/auth.js
import express from 'express';
import User from '../models/User.js';
import { protect, generateToken } from '../middleware/auth.js';
import { validateRegistration, validateLogin, handleValidationErrors } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegistration, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    logger.info(`Registration attempt for email: ${email}`);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: phone }
      ]
    });

    if (existingUser) {
      const conflictField = existingUser.email === email.toLowerCase() ? 'email' : 'phone';
      logger.warn(`Registration failed - ${conflictField} already exists: ${email}`);
      
      return res.status(400).json({
        success: false,
        message: `User already exists with this ${conflictField}`,
        field: conflictField
      });
    }

    // Create user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim()
    };

    const user = await User.create(userData);
    logger.info(`User registered successfully: ${user.email}`);

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    // Get user with password and login attempts
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +loginAttempts +lockUntil +isActive');

    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      logger.warn(`Login failed - account deactivated: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      logger.warn(`Login failed - account locked: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn(`Login failed - invalid password: ${email}`);
      
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`Login successful for user: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toSafeObject()
    });

  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, profilePicture } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject()
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    next(error);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ---------- GOOGLE SIGN-IN (ID TOKEN) ----------
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'GOOGLE_CLIENT_ID not configured on server.' });
    }
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required.' });
    }

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // Fields: sub (google user id), email, email_verified, name, picture
    const email = (payload.email || '').toLowerCase();
    const emailVerified = payload.email_verified;
    const googleId = payload.sub;
    const name = payload.name || email.split('@')[0];
    const avatar = payload.picture || null;

    if (!email || !emailVerified) {
      return res.status(401).json({ success: false, message: 'Google account email not verified.' });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar,
        provider: 'google',
        googleId,
        // password and phone are optional for Google users
      });
    } else {
      // If existing local user, attach googleId/provider/avatar when missing
      let changed = false;
      if (!user.googleId) { user.googleId = googleId; changed = true; }
      if (!user.provider) { user.provider = 'google'; changed = true; }
      if (!user.avatar && avatar) { user.avatar = avatar; changed = true; }
      if (changed) await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Issue JWT
    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    logger.error('Google auth error:', err);
    return res.status(401).json({ success: false, message: 'Invalid Google token.' });
  }
});

export default router;