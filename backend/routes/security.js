// backend/routes/security.js
import express from 'express';
import speakeasy from 'speakeasy';                 // npm i speakeasy
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

const router = express.Router();

/* ============================= 2FA (TOTP) ============================= */

// GET /api/security/2fa  → current 2FA state
router.get('/2fa', protect, async (req, res) => {
  try {
    const u = await User.findById(req.user.id).lean();
    const twoFA = u?.twoFA || {};
    return res.json({
      success: true,
      enabled: !!twoFA.enabled,
      // Only expose secret/otpauthUrl when not enabled (during setup)
      secret: twoFA.enabled ? undefined : (twoFA.secret || ''),
      otpauthUrl: twoFA.enabled ? undefined : (twoFA.otpauthUrl || ''),
      issuer: 'CarPool',
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to load 2FA state' });
  }
});

// POST /api/security/2fa/provision  → create secret (do not enable yet)
router.post('/2fa/provision', protect, async (req, res) => {
  try {
    const u = await User.findById(req.user.id);
    const secret = speakeasy.generateSecret({ name: `CarPool (${u.email})` });

    u.twoFA = {
      enabled: false,
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
    await u.save();

    return res.json({
      success: true,
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      issuer: 'CarPool',
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to provision 2FA' });
  }
});

// POST /api/security/2fa/verify  → verify TOTP, then enable
router.post('/2fa/verify', protect, async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ success: false, message: 'Code required' });

    const u = await User.findById(req.user.id);
    const secret = u?.twoFA?.secret;
    if (!secret) return res.status(400).json({ success: false, message: '2FA not provisioned' });

    const ok = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid code' });

    u.twoFA.enabled = true;
    await u.save();

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to verify 2FA' });
  }
});

// POST /api/security/2fa  → toggle on/off (fallback/direct)
router.post('/2fa', protect, async (req, res) => {
  try {
    const { enabled } = req.body || {};
    const u = await User.findById(req.user.id);
    if (!u.twoFA) u.twoFA = {};
    u.twoFA.enabled = !!enabled;

    // When disabling, clear secrets (optional but recommended)
    if (!enabled) {
      u.twoFA.secret = '';
      u.twoFA.otpauthUrl = '';
    }
    await u.save();
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to toggle 2FA' });
  }
});

/* ======================== Login devices / sessions ===================== */

// GET /api/security/sessions  → list my sessions
router.get('/sessions', protect, async (req, res) => {
  try {
    const list = await Session.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ success: true, sessions: list });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to load sessions' });
  }
});

// POST /api/security/sessions/:sessionId/revoke  → force logout/disconnect
router.post('/sessions/:sessionId/revoke', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const s = await Session.findOne({ user: req.user.id, sessionId });
    if (!s) return res.status(404).json({ success: false, message: 'Session not found' });

    s.current = false;
    s.lastActive = new Date();
    await s.save();

    // Attempt to disconnect that live socket
    const io = req.app.get('socketio');
    if (io) {
      const sock = io.sockets.sockets.get(sessionId);
      if (sock) sock.disconnect(true);

      // optional: notify the owner (you)
      io.to(`user_${req.user.id}`).emit('session:revoked', { sessionId });
    }

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message || 'Failed to revoke session' });
  }
});

export default router;