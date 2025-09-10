import express from 'express';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

dotenv.config();
const router = express.Router();

/**
 * Enable by setting ALLOW_ADMIN_RECOVERY=1 and provide RECOVERY_TOKEN in .env.
 * GET /api/_recovery/unban?email=...&token=... [&promote=1]
 */
router.get('/unban', async (req, res) => {
  try {
    if (process.env.ALLOW_ADMIN_RECOVERY !== '1') {
      return res.status(403).json({ success: false, message: 'Recovery disabled' });
    }
    const { email = '', token = '', promote = '0' } = req.query;
    if (!email || token !== (process.env.RECOVERY_TOKEN || '')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let changed = false;
    if (user.isBanned) { user.isBanned = false; changed = true; }
    if (promote === '1' && user.role !== 'superadmin') { user.role = 'superadmin'; changed = true; }

    if (changed) await user.save();
    logger.info('[recovery] unban', { email: user.email, changed });
    res.json({ success: true, email: user.email, role: user.role, isBanned: user.isBanned });
  } catch (e) {
    logger.error('Recovery unban failed', e);
    res.status(500).json({ success: false, message: 'Recovery error' });
  }
});

export default router;
