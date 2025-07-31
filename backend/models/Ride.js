import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startLocation: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String,
    placeId: String
  },
  endLocation: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String,
    placeId: String
  },
  // NEW: Via locations support
  viaLocations: [{
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String,
    placeId: String,
    order: { type: Number, required: true },
    estimatedArrival: Date,
    maxWaitTime: { type: Number, default: 5 } // minutes
  }],
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  totalSeats: {
    type: Number,
    required: true
  },
  pricePerSeat: {
    type: Number,
    required: true,
    min: 0
  },
  // Dynamic pricing
  dynamicPricing: {
    enabled: { type: Boolean, default: false },
    basePrice: Number,
    currentMultiplier: { type: Number, default: 1 },
    surgeReason: String
  },
  distance: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'in_progress', 'completed', 'cancelled', 'full'],
    default: 'active'
  },
  // Real-time tracking
  realTimeTracking: {
    enabled: { type: Boolean, default: false },
    currentLocation: {
      lat: Number,
      lng: Number,
      timestamp: Date
    },
    estimatedArrival: Date,
    routeProgress: { type: Number, default: 0 }
  },
  preferences: {
    smokingAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    musicAllowed: { type: Boolean, default: true },
    femaleOnly: { type: Boolean, default: false },
    maxAge: { type: Number, default: 100 },
    minAge: { type: Number, default: 18 },
    verifiedUsersOnly: { type: Boolean, default: false }
  },
  vehicle: {
    model: String,
    color: String,
    plateNumber: String,
    type: {
      type: String,
      enum: ['sedan', 'hatchback', 'suv', 'luxury', 'electric'],
      default: 'sedan'
    },
    amenities: [{
      type: String,
      enum: ['ac', 'music', 'charging', 'wifi', 'water', 'snacks', 'sanitizer', 'newspapers']
    }]
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  // Enhanced route with polyline
  route: {
    polyline: String,
    waypoints: [{
      lat: Number,
      lng: Number,
      address: String
    }],
    totalDistance: Number,
    totalDuration: Number
  },
  description: String,
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    endDate: Date
  },
  // Payment and booking options
  paymentOptions: {
    cash: { type: Boolean, default: true },
    upi: { type: Boolean, default: true },
    card: { type: Boolean, default: false },
    wallet: { type: Boolean, default: false }
  },
  bookingPolicy: {
    instantBooking: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    }
  },
  // Rating and feedback
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
rideSchema.index({ 'startLocation.coordinates': '2dsphere' });
rideSchema.index({ 'endLocation.coordinates': '2dsphere' });
rideSchema.index({ 'viaLocations.coordinates': '2dsphere' });
rideSchema.index({ departureTime: 1 });
rideSchema.index({ driver: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ pricePerSeat: 1 });
rideSchema.index({ createdAt: -1 });

// Virtual properties
rideSchema.virtual('totalEarnings').get(function() {
  const bookedSeats = this.totalSeats - this.availableSeats;
  return bookedSeats * this.pricePerSeat;
});

rideSchema.virtual('occupancyRate').get(function() {
  const bookedSeats = this.totalSeats - this.availableSeats;
  return (bookedSeats / this.totalSeats) * 100;
});

// Methods
rideSchema.methods.calculateDynamicPrice = function() {
  if (!this.dynamicPricing.enabled) return this.pricePerSeat;
  
  const basePrice = this.dynamicPricing.basePrice || this.pricePerSeat;
  return Math.round(basePrice * this.dynamicPricing.currentMultiplier);
};

rideSchema.methods.updateLocation = function(lat, lng) {
  this.realTimeTracking.currentLocation = {
    lat,
    lng,
    timestamp: new Date()
  };
  return this.save();
};

// Pre-save middleware
rideSchema.pre('save', function(next) {
  if (this.availableSeats === 0 && this.status === 'active') {
    this.status = 'full';
  }
  
  // Update dynamic pricing based on availability
  if (this.dynamicPricing.enabled) {
    const occupancyRate = this.occupancyRate;
    if (occupancyRate > 80) {
      this.dynamicPricing.currentMultiplier = 1.5;
      this.dynamicPricing.surgeReason = 'High demand';
    } else if (occupancyRate > 60) {
      this.dynamicPricing.currentMultiplier = 1.2;
      this.dynamicPricing.surgeReason = 'Moderate demand';
    } else {
      this.dynamicPricing.currentMultiplier = 1;
      this.dynamicPricing.surgeReason = null;
    }
  }
  
  next();
});

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;