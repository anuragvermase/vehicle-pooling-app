// backend/models/Session.js
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    sessionId: { type: String, index: true, required: true },  // socket.id
    device: { type: String, default: '' },
    ip: { type: String, default: '' },
    current: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SessionSchema.index({ user: 1, sessionId: 1 }, { unique: true });

export default mongoose.model('Session', SessionSchema);