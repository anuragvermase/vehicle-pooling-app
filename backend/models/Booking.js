import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seatsBooked: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'wallet'],
    default: 'cash'
  },
  // Enhanced payment details
  payment: {
    transactionId: String,
    gateway: String,
    gatewayTransactionId: String,
    paidAt: Date,
    refundId: String,
    refundedAt: Date,
    refundAmount: Number
  },
  pickupLocation: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    address: String,
    placeId: String
  },
  dropoffLocation: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    address: String,
    placeId: String
  },
  specialRequests: String,
  // Enhanced passenger details
  passengerDetails: [{
    name: String,
    age: Number,
    gender: String
  }],
  // Trip tracking
  tripTracking: {
    startTime: Date,
    endTime: Date,
    actualPickupTime: Date,
    actualDropoffTime: Date,
    distance: Number,
    route: [{ lat: Number, lng: Number, timestamp: Date }]
  },
  rating: {
    driverRating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String,
      ratedAt: Date
    },
    passengerRating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String,
      ratedAt: Date
    }
  },
  // Cancellation details
  cancellation: {
    reason: String,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: Date,
    refundEligible: { type: Boolean, default: true }
  },
  notifications: [{
    type: {
      type: String,
      enum: ['booking_confirmed', 'ride_started', 'ride_completed', 'ride_cancelled', 'payment_reminder']
    },
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    channel: { type: String, enum: ['push', 'email', 'sms'], default: 'push' }
  }]
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ ride: 1 });
bookingSchema.index({ passenger: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for trip duration
bookingSchema.virtual('tripDuration').get(function() {
  if (this.tripTracking.startTime && this.tripTracking.endTime) {
    return this.tripTracking.endTime - this.tripTracking.startTime;
  }
  return null;
});

// Methods
bookingSchema.methods.canCancel = function() {
  const now = new Date();
  const rideTime = this.ride.departureTime;
  const hoursUntilRide = (rideTime - now) / (1000 * 60 * 60);
  
  // Can cancel if more than 2 hours before ride
  return hoursUntilRide > 2 && ['pending', 'confirmed'].includes(this.status);
};

bookingSchema.methods.calculateRefund = function() {
  if (!this.canCancel()) return 0;
  
  const now = new Date();
  const rideTime = this.ride.departureTime;
  const hoursUntilRide = (rideTime - now) / (1000 * 60 * 60);
  
  // Full refund if more than 24 hours
  if (hoursUntilRide > 24) return this.totalAmount;
  
  // 50% refund if more than 6 hours
  if (hoursUntilRide > 6) return this.totalAmount * 0.5;
  
  // 25% refund if more than 2 hours
  if (hoursUntilRide > 2) return this.totalAmount * 0.25;
  
  return 0;
};

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;