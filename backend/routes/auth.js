// backend/routes/auth.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import { protect, generateToken } from '../middleware/auth.js';
import { validateRegistration, validateLogin, handleValidationErrors } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

/* ---------- helpers ---------- */
function normalizeUser(u) {
  // Convert mongoose doc -> plain object via your safe serializer, then normalize avatar
  const obj = typeof u.toSafeObject === 'function' ? u.toSafeObject() : u.toObject?.() ?? u;
  const url = obj.avatarUrl || obj.profilePicture || obj.avatar || null;

  return {
    ...obj,
    avatarUrl: url,                     // always present if any
    profilePicture: obj.profilePicture ?? url,
    avatar: obj.avatar ?? url,
  };
}

/* ---------- avatar upload: disk storage ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AVATAR_DIR = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const orig = file?.originalname || 'avatar.jpg';
    const ext = path.extname(orig) || '.jpg';
    const uid = req.user?.id || req.user?._id || 'user';
    cb(null, `${uid}-${Date.now()}${ext}`);
  },
});
const fileFilter = (_req, file, cb) => {
  if (!file?.mimetype?.startsWith('image/')) return cb(new Error('Only image files are allowed'));
  cb(null, true);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/* ---------- REGISTER ---------- */
router.post('/register', validateRegistration, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    logger.info(`Registration attempt for email: ${email}`);

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      const conflictField = existingUser.email === email.toLowerCase() ? 'email' : 'phone';
      logger.warn(`Registration failed - ${conflictField} already exists: ${email}`);
      return res.status(400).json({
        success: false,
        message: `User already exists with this ${conflictField}`,
        field: conflictField,
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
    });

    // last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: normalizeUser(user),
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

/* ---------- LOGIN ---------- */
router.post('/login', validateLogin, handleValidationErrors, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +loginAttempts +lockUntil +isActive');

    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      logger.warn(`Login failed - account deactivated: ${email}`);
      return res.status(401).json({ success: false, message: 'Account has been deactivated. Please contact support.' });
    }
    if (user.isLocked) {
      logger.warn(`Login failed - account locked: ${email}`);
      return res.status(401).json({ success: false, message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      logger.warn(`Login failed - invalid password: ${email}`);
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.loginAttempts > 0) await user.resetLoginAttempts();

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: normalizeUser(user),
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

/* ---------- CURRENT USER ---------- */
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.set('Cache-Control', 'no-store');   // <- add this
    res.json({ success: true, user: normalizeUser(user) });
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
});

/* ---------- UPDATE PROFILE (JSON) ---------- */
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, profilePicture, avatarUrl, avatar } = req.body;

    const update = {};
    if (name) update.name = name.trim();
    if (phone) update.phone = phone.trim();

    // accept any of these fields from client
    const url = avatarUrl || profilePicture || avatar;
    if (url !== undefined) {
      update.profilePicture = url;
      update.avatarUrl = url;
      update.avatar = url;
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    logger.info(`Profile updated for user: ${user.email}`);
    res.json({ success: true, message: 'Profile updated successfully', user: normalizeUser(user) });
  } catch (error) {
    logger.error('Profile update error:', error);
    next(error);
  }
});

/* ---------- AVATAR UPLOAD (multipart/form-data) ---------- */
router.post('/avatar', protect, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: fileUrl, avatarUrl: fileUrl, avatar: fileUrl }, // set all three
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, url: fileUrl, user: normalizeUser(user) });
  } catch (error) {
    logger.error('Avatar upload error:', error);
    next(error);
  }
});

/* ---------- LOGOUT ---------- */
router.post('/logout', protect, (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);
  res.json({ success: true, message: 'Logged out successfully' });
});

/* ---------- GOOGLE SIGN-IN ---------- */
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
    const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });

    const payload = ticket.getPayload();
    const email = (payload.email || '').toLowerCase();
    const emailVerified = payload.email_verified;
    const googleId = payload.sub;
    const name = payload.name || email.split('@')[0];
    const picture = payload.picture || null;

    if (!email || !emailVerified) {
      return res.status(401).json({ success: false, message: 'Google account email not verified.' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        provider: 'google',
        googleId,
        profilePicture: picture || undefined,
        avatarUrl: picture || undefined,
        avatar: picture || undefined,
      });
    } else {
      let changed = false;
      if (!user.googleId) { user.googleId = googleId; changed = true; }
      if (!user.provider) { user.provider = 'google'; changed = true; }
      if (!user.profilePicture && picture) { user.profilePicture = picture; changed = true; }
      if (!user.avatarUrl && picture) { user.avatarUrl = picture; changed = true; }
      if (!user.avatar && picture) { user.avatar = picture; changed = true; }
      if (changed) await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    return res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: normalizeUser(user),
    });
  } catch (err) {
    logger.error('Google auth error:', err);
    return res.status(401).json({ success: false, message: 'Invalid Google token.' });
  }
});

export default router;