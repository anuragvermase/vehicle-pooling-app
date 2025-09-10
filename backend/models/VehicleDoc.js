import mongoose from 'mongoose';

const VehicleDocSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vehicleNumber: String,
  rcUrl: String,
  insuranceUrl: String,
  permitUrl: String,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String
}, { timestamps: true });

export default mongoose.model('VehicleDoc', VehicleDocSchema);
