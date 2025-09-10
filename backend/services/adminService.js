// backend/services/adminService.js
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import Kyc from '../models/Kyc.js';
import VehicleDoc from '../models/VehicleDoc.js';
import Payout from '../models/Payout.js';
import RefundRequest from '../models/RefundRequest.js';
import AuditLog from '../models/AuditLog.js';

async function logAction(actorId, action, targetType, targetId, meta) {
  try {
    await AuditLog.create({ actor: actorId, action, targetType, targetId, meta });
  } catch { /* non-blocking */ }
}

function asId(x) {
  try { return String(x); } catch { return null; }
}

export const AdminService = {
  async listUsers({ q='', page=1, limit=20 }) {
    const filter = q
      ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] }
      : {};
    const docs = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page-1)*limit)
      .limit(limit);
    const total = await User.countDocuments(filter);
    return { docs, total, page, limit };
  },

  async setRole(actorId, userId, role) {
    const actor = await User.findById(actorId);
    const target = await User.findById(userId);
    if (!target) throw new Error('User not found');

    // prevent role changes on superadmin by non-superadmin
    if (target.role === 'superadmin' && actor.role !== 'superadmin') {
      throw new Error('You cannot change role of a superadmin');
    }
    // prevent demoting yourself from superadmin to non-admin accidentally
    if (asId(actorId) === asId(userId) && actor.role === 'superadmin' && role !== 'superadmin') {
      throw new Error('Cannot demote yourself from superadmin');
    }

    target.role = role;
    await target.save();
    await logAction(actorId, 'USER_SET_ROLE', 'User', userId, { role });
    return target;
  },

  async banUser(actorId, userId, isBanned, reason) {
    const actor = await User.findById(actorId);
    const target = await User.findById(userId);
    if (!target) throw new Error('User not found');

    // safety rails
    if (asId(actorId) === asId(userId) && isBanned) {
      throw new Error('You cannot ban your own account');
    }
    if (target.role === 'superadmin' && isBanned) {
      throw new Error('You cannot ban a superadmin');
    }

    target.isBanned = !!isBanned;
    await target.save();
    await logAction(actorId, isBanned ? 'USER_BAN' : 'USER_UNBAN', 'User', userId, { reason });
    return target;
  },

  async listKyc({ status='pending', page=1, limit=20 }) {
    const docs = await Kyc.find({ status })
      .populate('user','name email')
      .sort({ createdAt: 1 })
      .skip((page-1)*limit)
      .limit(limit);
    const total = await Kyc.countDocuments({ status });
    return { docs, total, page, limit };
  },

  async reviewKyc(actorId, kycId, status, note) {
    const kyc = await Kyc.findByIdAndUpdate(
      kycId, { status, note, reviewer: actorId }, { new: true }
    );
    if (kyc?.user) {
      await User.findByIdAndUpdate(kyc.user, {
        kycStatus: status === 'approved' ? 'approved' : (status === 'rejected' ? 'rejected' : 'pending'),
        kycNote: note
      });
    }
    await logAction(actorId, `KYC_${status?.toUpperCase?.()}`, 'Kyc', kycId, { note });
    return kyc;
  },

  async listRides({ q='', page=1, limit=20 }) {
    const filter = q
      ? { $or: [{ 'startLocation.name': new RegExp(q,'i') }, { 'endLocation.name': new RegExp(q,'i') }] }
      : {};
    const docs = await Ride.find(filter)
      .sort({ createdAt: -1 })
      .skip((page-1)*limit)
      .limit(limit);
    const total = await Ride.countDocuments(filter);
    return { docs, total, page, limit };
  },

  async cancelRide(actorId, rideId, reason) {
    const r = await Ride.findByIdAndUpdate(
      rideId, { status: 'cancelled', adminCancelReason: reason }, { new: true }
    );
    await logAction(actorId, 'RIDE_CANCEL', 'Ride', rideId, { reason });
    return r;
  },

  async listPayouts({ status, page=1, limit=20 }) {
    const filter = status ? { status } : {};
    const docs = await Payout.find(filter)
      .populate('user','name email')
      .sort({ createdAt: -1 })
      .skip((page-1)*limit)
      .limit(limit);
    const total = await Payout.countDocuments(filter);
    return { docs, total, page, limit };
  },

  async markPayout(actorId, payoutId, status, note) {
    const p = await Payout.findByIdAndUpdate(
      payoutId, { status, failureReason: status==='failed'?note:undefined }, { new: true }
    );
    await logAction(actorId, `PAYOUT_${status?.toUpperCase?.()}`, 'Payout', payoutId, { note });
    return p;
  }
};
