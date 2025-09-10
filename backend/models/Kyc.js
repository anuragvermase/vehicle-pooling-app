import mongoose from 'mongoose';

const KycSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  documents: [{ label: String, url: String }],
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String
}, { timestamps: true });

export default mongoose.model('Kyc', KycSchema);
