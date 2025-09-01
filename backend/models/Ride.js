// models/Ride.js
import mongoose from 'mongoose';

/* ---------------------------------------------------------------------------
   Helper: normalize incoming location into:
     - coordinates: { type:'Point', coordinates:[lng, lat] }
     - lat, lng (denormalized copies for UI)
     - name/address/placeId preserved
   Supports legacy shapes:
     - { lat, lng }
     - { coordinates: { lat, lng } }
     - { coordinates: [lng, lat] }
--------------------------------------------------------------------------- */
function normalizeGeo(loc) {
  if (!loc) return;

  const lat =
    loc?.lat ??
    loc?.coordinates?.lat ??
    (Array.isArray(loc?.coordinates) ? loc.coordinates[1] : undefined);
  const lng =
    loc?.lng ??
    loc?.coordinates?.lng ??
    (Array.isArray(loc?.coordinates) ? loc.coordinates[0] : undefined);

  if (typeof lat === 'number' && Number.isFinite(lat) &&
      typeof lng === 'number' && Number.isFinite(lng)) {
    loc.lat = lat;
    loc.lng = lng;
    loc.coordinates = { type: 'Point', coordinates: [lng, lat] }; // GeoJSON order
  }
}

/* ---------------------------------------------------------------------------
   Subschemas (keep requireds; pre('validate') ensures they get populated)
--------------------------------------------------------------------------- */
const PointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: {
      // [lng, lat]
      type: [Number],
      required: true,
      validate: {
        validator: (v) =>
          Array.isArray(v) &&
          v.length === 2 &&
          v.every((n) => typeof n === 'number' && Number.isFinite(n)),
        message: 'coordinates must be [lng, lat]',
      },
    },
  },
  { _id: false }
);

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    coordinates: { type: PointSchema, required: true }, // normalized before validate
    lat: { type: Number, required: true },              // denormalized copies
    lng: { type: Number, required: true },
    address: String,
    placeId: String,
  },
  { _id: false }
);

const ViaLocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    coordinates: { type: PointSchema, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
    placeId: String,
    order: { type: Number, required: true },
    estimatedArrival: Date,
    maxWaitTime: { type: Number, default: 5 }, // minutes

    // GeoJSON mirror retained for compatibility
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [lng, lat]
    },
  },
  { _id: false }
);

/* ---------------------------------------------------------------------------
   Ride Schema (merged)
--------------------------------------------------------------------------- */
const rideSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    startLocation: { type: LocationSchema, required: true },
    endLocation: { type: LocationSchema, required: true },

    // GeoJSON mirrors preserved from second version
    startLocationGeo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    endLocationGeo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [lng, lat]
    },

    viaLocations: [ViaLocationSchema],

    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date },

    availableSeats: { type: Number, required: true, min: 1, max: 8 },
    totalSeats: { type: Number, required: true },

    pricePerSeat: { type: Number, required: true, min: 0 },

    dynamicPricing: {
      enabled: { type: Boolean, default: false },
      basePrice: Number,
      currentMultiplier: { type: Number, default: 1 },
      surgeReason: String,
    },

    distance: { type: Number, required: true }, // km
    duration: { type: Number, required: true }, // minutes

    status: {
      type: String,
      enum: ['active', 'in_progress', 'completed', 'cancelled', 'full'],
      default: 'active',
    },

    // Real-time tracking
    realTimeTracking: {
      enabled: { type: Boolean, default: false },
      currentLocation: { lat: Number, lng: Number, timestamp: Date },
      estimatedArrival: Date,
      routeProgress: { type: Number, default: 0 },
    },

    preferences: {
      smokingAllowed: { type: Boolean, default: false },
      petsAllowed: { type: Boolean, default: false },
      musicAllowed: { type: Boolean, default: true },
      femaleOnly: { type: Boolean, default: false },
      maxAge: { type: Number, default: 100 },
      minAge: { type: Number, default: 18 },
      verifiedUsersOnly: { type: Boolean, default: false },
    },

    vehicle: {
      model: String,
      color: String,
      plateNumber: String,
      type: {
        type: String,
        enum: ['sedan', 'hatchback', 'suv', 'luxury', 'electric'],
        default: 'sedan',
      },
      amenities: [
        { type: String, enum: ['ac', 'music', 'charging', 'wifi', 'water', 'snacks', 'sanitizer', 'newspapers'] },
      ],
    },

    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],

    // Enhanced route with polyline
    route: {
      polyline: String,
      waypoints: [{ lat: Number, lng: Number, address: String }],
      totalDistance: Number,
      totalDuration: Number,
    },

    description: String,

    recurring: {
      isRecurring: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      daysOfWeek: [{ type: Number, min: 0, max: 6 }],
      endDate: Date,
    },

    // Payment and booking options
    paymentOptions: {
      cash: { type: Boolean, default: true },
      upi: { type: Boolean, default: true },
      card: { type: Boolean, default: false },
      wallet: { type: Boolean, default: false },
    },

    bookingPolicy: {
      instantBooking: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
      cancellationPolicy: { type: String, enum: ['flexible', 'moderate', 'strict'], default: 'moderate' },
    },

    // Rating and feedback
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ------------------------------- Indexes ------------------------------- */
// Primary GeoJSON fields
rideSchema.index({ 'startLocation.coordinates': '2dsphere' });
rideSchema.index({ 'endLocation.coordinates': '2dsphere' });
rideSchema.index({ 'viaLocations.coordinates': '2dsphere' });

// GeoJSON mirrors (back-compat from second version)
rideSchema.index({ startLocationGeo: '2dsphere' });
rideSchema.index({ endLocationGeo: '2dsphere' });
rideSchema.index({ 'viaLocations.geo': '2dsphere' });

rideSchema.index({ departureTime: 1 });
rideSchema.index({ driver: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ pricePerSeat: 1 });
rideSchema.index({ createdAt: -1 });

/* ------------------------- Virtuals (kept/extended) -------------------- */
rideSchema.virtual('totalEarnings').get(function () {
  const bookedSeats = this.totalSeats - this.availableSeats;
  return bookedSeats * this.pricePerSeat;
});

rideSchema.virtual('occupancyRate').get(function () {
  const bookedSeats = this.totalSeats - this.availableSeats;
  return (bookedSeats / this.totalSeats) * 100;
});

// Compatibility virtuals for mobile UI
rideSchema.virtual('from').get(function () {
  if (!this.startLocation) return undefined;
  return { text: this.startLocation.name, lat: this.startLocation.lat, lng: this.startLocation.lng };
});

rideSchema.virtual('to').get(function () {
  if (!this.endLocation) return undefined;
  return { text: this.endLocation.name, lat: this.endLocation.lat, lng: this.endLocation.lng };
});

/* ------------------------------ Methods -------------------------------- */
rideSchema.methods.calculateDynamicPrice = function () {
  if (!this.dynamicPricing?.enabled) return this.pricePerSeat;
  const basePrice = this.dynamicPricing.basePrice || this.pricePerSeat;
  return Math.round(basePrice * (this.dynamicPricing.currentMultiplier || 1));
};

rideSchema.methods.updateLocation = function (lat, lng) {
  this.realTimeTracking.currentLocation = { lat, lng, timestamp: new Date() };
  return this.save();
};

/* --------------------------- Hooks & Normalizers ------------------------ */
/**
 * Accepts incoming docs where start/end/via may have:
 *  - coordinates: { lat, lng }  (legacy)
 *  - lat/lng at top level       (legacy)
 *  - coordinates: GeoJSON Point (new)
 * We normalize to GeoJSON + lat/lng numbers before validation.
 */
rideSchema.pre('validate', function (next) {
  try {
    if (this.startLocation) normalizeGeo(this.startLocation);
    if (this.endLocation) normalizeGeo(this.endLocation);

    if (Array.isArray(this.viaLocations)) {
      this.viaLocations.forEach((v) => normalizeGeo(v));
    }

    // fill route totals from distance/duration if missing
    if (this.route) {
      if (this.route.totalDistance == null && typeof this.distance === 'number') {
        this.route.totalDistance = this.distance;
      }
      if (this.route.totalDuration == null && typeof this.duration === 'number') {
        this.route.totalDuration = this.duration;
      }
    }
    next();
  } catch (e) {
    next(e);
  }
});

/**
 * Keep "full" status + dynamic pricing behavior.
 * Also populate GeoJSON mirror fields so old 2dsphere queries still work.
 */
rideSchema.pre('save', function (next) {
  // mark full when no seats left
  if (this.availableSeats === 0 && this.status === 'active') {
    this.status = 'full';
  }

  // dynamic pricing based on occupancy
  if (this.dynamicPricing?.enabled) {
    const occ = this.occupancyRate;
    if (occ > 80) {
      this.dynamicPricing.currentMultiplier = 1.5;
      this.dynamicPricing.surgeReason = 'High demand';
    } else if (occ > 60) {
      this.dynamicPricing.currentMultiplier = 1.2;
      this.dynamicPricing.surgeReason = 'Moderate demand';
    } else {
      this.dynamicPricing.currentMultiplier = 1;
      this.dynamicPricing.surgeReason = null;
    }
  }

  // Populate GeoJSON mirrors from normalized lat/lng
  if (this.startLocation?.lat != null && this.startLocation?.lng != null) {
    this.startLocationGeo = {
      type: 'Point',
      coordinates: [this.startLocation.lng, this.startLocation.lat],
    };
  }
  if (this.endLocation?.lat != null && this.endLocation?.lng != null) {
    this.endLocationGeo = {
      type: 'Point',
      coordinates: [this.endLocation.lng, this.endLocation.lat],
    };
  }
  if (Array.isArray(this.viaLocations)) {
    this.viaLocations = this.viaLocations.map((v) => {
      if (typeof v?.lat === 'number' && typeof v?.lng === 'number') {
        return { ...v.toObject?.() ?? v, geo: { type: 'Point', coordinates: [v.lng, v.lat] } };
      }
      return v;
    });
  }

  next();
});

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;
