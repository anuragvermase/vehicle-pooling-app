// backend/routes/admin.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { AdminService } from '../services/adminService.js';

const router = express.Router();

// All admin routes require admin or superadmin
router.use(protect, requireRole('admin','superadmin'));

// Users
router.get('/users', async (req,res) => {
  const { q, page, limit } = req.query;
  const data = await AdminService.listUsers({
    q, page: Number(page)||1, limit: Number(limit)||20
  });
  res.json({ success: true, ...data });
});

router.post('/users/:id/role', async (req,res) => {
  try {
    const { role } = req.body;
    const user = await AdminService.setRole(req.user._id, req.params.id, role);
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Failed to change role' });
  }
});

router.post('/users/:id/ban', async (req,res) => {
  try {
    const user = await AdminService.banUser(req.user._id, req.params.id, true, req.body.reason);
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Failed to ban user' });
  }
});

router.post('/users/:id/unban', async (req,res) => {
  try {
    const user = await AdminService.banUser(req.user._id, req.params.id, false, req.body.reason);
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Failed to unban user' });
  }
});

// KYC
router.get('/kyc', async (req,res) => {
  const { status='pending', page, limit } = req.query;
  const data = await AdminService.listKyc({
    status, page: Number(page)||1, limit: Number(limit)||20
  });
  res.json({ success: true, ...data });
});

router.post('/kyc/:id/review', async (req,res) => {
  try {
    const { status, note } = req.body; // 'approved' | 'rejected'
    const kyc = await AdminService.reviewKyc(req.user._id, req.params.id, status, note);
    res.json({ success: true, kyc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Failed to review KYC' });
  }
});

// Rides
router.get('/rides', async (req,res) => {
  const { q, page, limit } = req.query;
  const data = await AdminService.listRides({
    q, page: Number(page)||1, limit: Number(limit)||20
  });
  res.json({ success: true, ...data });
});

router.post('/rides/:id/cancel', async (req,res) => {
  try {
    const ride = await AdminService.cancelRide(req.user._id, req.params.id, req.body.reason);
    res.json({ success: true, ride });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Failed to cancel ride' });
  }
});

// Payouts
router.get('/payouts', async (req,res) => {
  const { status, page, limit } = req.query;
  const data = await AdminService.listPayouts({
    status, page: Number(page)||1, limit: Number(limit)||20
  });
  res.json({ success: true, ...data });
});

router.post('/payouts/:id/mark', async (req,res) => {
  try {
    const { status, note } = req.body; // 'paid' | 'failed' | 'approved'
    const payout = await AdminService.markPayout(req.user._id, req.params.id, status, note);
    res.json({ success: true, payout });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Failed to update payout' });
  }
});

export default router;
