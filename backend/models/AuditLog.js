import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // admin
  action: { type: String, required: true }, // e.g., 'USER_BAN', 'KYC_APPROVE'
  targetType: { type: String, enum: ['User','Ride','Kyc','VehicleDoc','Payout','Refund'], required: true },
  targetId: { type: String, required: true, index: true },
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: true });

AuditLogSchema.index({ action: 1, targetType: 1, createdAt: -1 });

export default mongoose.model('AuditLog', AuditLogSchema);
