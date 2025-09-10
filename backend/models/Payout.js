import mongoose from 'mongoose';

const PayoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['requested','approved','paid','failed'], default: 'requested', index: true },
  txnRef: String,
  failureReason: String
}, { timestamps: true });

export default mongoose.model('Payout', PayoutSchema);
