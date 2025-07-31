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
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'daily'
  },
  metrics: {
    // Ride metrics
    ridesOffered: { type: Number, default: 0 },
    ridesTaken: { type: Number, default: 0 },
    ridesCompleted: { type: Number, default: 0 },
    ridesCancelled: { type: Number, default: 0 },
    
    // Financial metrics
    totalEarnings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    avgEarningPerRide: { type: Number, default: 0 },
    avgSpentPerRide: { type: Number, default: 0 },
    
    // Distance and time
    distanceTraveled: { type: Number, default: 0 },
    timeSpentDriving: { type: Number, default: 0 },
    timeSpentAsPassenger: { type: Number, default: 0 },
    
    // Environmental impact
    co2Saved: { type: Number, default: 0 },
    fuelSaved: { type: Number, default: 0 },
    
    // Performance metrics
    avgRating: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 },
    
    // Booking metrics
    bookingsReceived: { type: Number, default: 0 },
    bookingsMade: { type: Number, default: 0 },
    successfulBookings: { type: Number, default: 0 },
    
    // Revenue metrics (for business analytics)
    commission: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    netEarnings: { type: Number, default: 0 }
  },
  
  // Detailed breakdown by categories
  breakdown: {
    byVehicleType: {
      sedan: { rides: { type: Number, default: 0 }, earnings: { type: Number, default: 0 } },
      hatchback: { rides: { type: Number, default: 0 }, earnings: { type: Number, default: 0 } },
      suv: { rides: { type: Number, default: 0 }, earnings: { type: Number, default: 0 } },
      luxury: { rides: { type: Number, default: 0 }, earnings: { type: Number, default: 0 } },
      electric: { rides: { type: Number, default: 0 }, earnings: { type: Number, default: 0 } }
    },
    
    byTimeOfDay: {
      morning: { rides: { type: Number, default: 0 }, earnings: { type: Number, default: 0 } },
      afternoon: { rides: { type: Number, default: 0 }, earnings: { type: Number, default: 0 } },
      evening: { rides: { type: Number, default: 0 }, earnings: { type: Number, default: 0 } },
      night: { rides: { type: Number, default: 0 }, earnings: { type: Number, default: 0 } }
    },
    
    byDayOfWeek: {
      type: Map,
      of: {
        rides: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 }
      }
    },
    
    byRoute: [{
      from: String,
      to: String,
      rides: { type: Number, default: 0 },
      earnings: { type: Number, default: 0 },
      avgPrice: { type: Number, default: 0 }
    }]
  },
  
  // Goals and targets
  goals: {
    monthlyEarningsTarget: { type: Number, default: 0 },
    monthlyRidesTarget: { type: Number, default: 0 },
    co2ReductionTarget: { type: Number, default: 0 }
  },
  
  // Comparative metrics
  comparison: {
    previousPeriod: {
      earnings: { type: Number, default: 0 },
      rides: { type: Number, default: 0 },
      rating: { type: Number, default: 0 }
    },
    percentageChange: {
      earnings: { type: Number, default: 0 },
      rides: { type: Number, default: 0 },
      rating: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
analyticsSchema.index({ user: 1, date: -1 });
analyticsSchema.index({ user: 1, type: 1, date: -1 });
analyticsSchema.index({ date: -1 });

// Static methods for analytics calculations
analyticsSchema.statics.calculateUserAnalytics = async function(userId, period = 'monthly') {
  const startDate = new Date();
  const endDate = new Date();
  
  switch (period) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'yearly':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }
  
  // Aggregate analytics data
  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$metrics.totalEarnings' },
        totalRides: { $sum: '$metrics.ridesOffered' },
        avgRating: { $avg: '$metrics.avgRating' },
        totalDistance: { $sum: '$metrics.distanceTraveled' },
        co2Saved: { $sum: '$metrics.co2Saved' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Method to update analytics
analyticsSchema.statics.updateAnalytics = async function(userId, data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const analytics = await this.findOneAndUpdate(
    { user: userId, date: today, type: 'daily' },
    {
      $inc: {
        'metrics.ridesOffered': data.ridesOffered || 0,
        'metrics.ridesTaken': data.ridesTaken || 0,
        'metrics.totalEarnings': data.earnings || 0,
        'metrics.totalSpent': data.spent || 0,
        'metrics.distanceTraveled': data.distance || 0
      }
    },
    { upsert: true, new: true }
  );
  
  return analytics;
};

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;