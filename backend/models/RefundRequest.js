import mongoose from 'mongoose';

const RefundRequestSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  thresholdBand: { type: String, enum: ['low','mid','high'], default: 'low' },
  status: { type: String, enum: ['requested','approved','rejected','processed'], default: 'requested', index: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String
}, { timestamps: true });

export default mongoose.model('RefundRequest', RefundRequestSchema);
