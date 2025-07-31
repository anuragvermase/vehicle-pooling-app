import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    ridesOffered: { type: Number, default: 0 },
    ridesTaken: { type: Number, default: 0 },
    ridesCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    distanceTraveled: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    fuelSaved: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 } // in minutes
  },
  monthly: {
    type: Map,
    of: {
      ridesOffered: Number,
      ridesTaken: Number,
      earnings: Number,
      spent: Number,
      distance: Number
    }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
analyticsSchema.index({ user: 1, date: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;