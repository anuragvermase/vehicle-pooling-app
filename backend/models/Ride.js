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

  // ✅ Added: GeoJSON mirrors for proper 2dsphere queries (keeps your existing fields intact)
  startLocationGeo: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    // Note: GeoJSON uses [lng, lat]
    coordinates: {
      type: [Number],
      default: undefined
    }
  },
  endLocationGeo: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
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
    maxWaitTime: { type: Number, default: 5 }, // minutes

    // ✅ Added: optional GeoJSON mirror per via point
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined
      }
    }
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
  timestamps: true,
  // ✅ Ensure virtuals are returned to clients
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes (kept yours, added geo indexes on the new GeoJSON fields)
rideSchema.index({ 'startLocation.coordinates': '2dsphere' });
rideSchema.index({ 'endLocation.coordinates': '2dsphere' });
rideSchema.index({ 'viaLocations.coordinates': '2dsphere' });

rideSchema.index({ startLocationGeo: '2dsphere' });   // ✅ added
rideSchema.index({ endLocationGeo: '2dsphere' });     // ✅ added
rideSchema.index({ 'viaLocations.geo': '2dsphere' }); // ✅ added

rideSchema.index({ departureTime: 1 });
rideSchema.index({ driver: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ pricePerSeat: 1 });
rideSchema.index({ createdAt: -1 });

// Virtual properties (kept yours)
rideSchema.virtual('totalEarnings').get(function() {
  const bookedSeats = this.totalSeats - this.availableSeats;
  return bookedSeats * this.pricePerSeat;
});

rideSchema.virtual('occupancyRate').get(function() {
  const bookedSeats = this.totalSeats - this.availableSeats;
  return (bookedSeats / this.totalSeats) * 100;
});

// ✅ Added: compatibility virtuals for mobile UI (non-breaking)
rideSchema.virtual('from').get(function () {
  if (!this.startLocation) return undefined;
  return {
    text: this.startLocation.name,
    lat: this.startLocation.coordinates?.lat,
    lng: this.startLocation.coordinates?.lng
  };
});

rideSchema.virtual('to').get(function () {
  if (!this.endLocation) return undefined;
  return {
    text: this.endLocation.name,
    lat: this.endLocation.coordinates?.lat,
    lng: this.endLocation.coordinates?.lng
  };
});

// Methods (kept yours)
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

// Pre-save middleware (kept yours, added geo mirror population)
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

  // ✅ Populate GeoJSON mirrors from lat/lng so 2dsphere indexes work properly
  if (this.startLocation?.coordinates) {
    const { lat, lng } = this.startLocation.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') {
      this.startLocationGeo = { type: 'Point', coordinates: [lng, lat] };
    }
  }
  if (this.endLocation?.coordinates) {
    const { lat, lng } = this.endLocation.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') {
      this.endLocationGeo = { type: 'Point', coordinates: [lng, lat] };
    }
  }
  if (Array.isArray(this.viaLocations)) {
    this.viaLocations = this.viaLocations.map(v => {
      if (v?.coordinates && typeof v.coordinates.lat === 'number' && typeof v.coordinates.lng === 'number') {
        return {
          ...v,
          geo: { type: 'Point', coordinates: [v.coordinates.lng, v.coordinates.lat] }
        };
      }
      return v;
    });
  }
  
  next();
});

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;
