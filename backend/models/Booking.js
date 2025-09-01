// models/Booking.js
import mongoose from 'mongoose';

/* ---------------------------------------------------------------------------
   Helpers: normalize legacy {lat,lng} / {coordinates:{lat,lng}} into GeoJSON
--------------------------------------------------------------------------- */
function normalizeGeoTarget(loc) {
  if (!loc) return;

  const lat =
    loc?.lat ??
    loc?.coordinates?.lat ??
    (Array.isArray(loc?.coordinates) ? loc.coordinates[1] : undefined);
  const lng =
    loc?.lng ??
    loc?.coordinates?.lng ??
    (Array.isArray(loc?.coordinates) ? loc.coordinates[0] : undefined);

  if (
    typeof lat === 'number' && Number.isFinite(lat) &&
    typeof lng === 'number' && Number.isFinite(lng)
  ) {
    // keep convenient copies for UI
    loc.lat = lat;
    loc.lng = lng;
    // GeoJSON Point (order: [lng, lat])
    loc.coordinates = { type: 'Point', coordinates: [lng, lat] };
  }
}

/* ---------------------------------------------------------------------------
   Subschemas
--------------------------------------------------------------------------- */
const PointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    // GeoJSON order: [lng, lat]
    coordinates: {
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

// NOTE: fields are NOT required to preserve legacy/create flows;
// if provided, they will be normalized to Point + lat/lng via pre('validate')
const AddressSchema = new mongoose.Schema(
  {
    name: String,
    coordinates: { type: PointSchema }, // optional container
    // convenience copies for app/UI (optional, but filled by normalizer)
    lat: Number,
    lng: Number,
    address: String,
    placeId: String,
  },
  { _id: false }
);

/* ---------------------------------------------------------------------------
   Booking Schema (merged)
--------------------------------------------------------------------------- */
const bookingSchema = new mongoose.Schema(
  {
    ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    seatsBooked: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'wallet'], default: 'cash' },

    // Enhanced payment details
    payment: {
      transactionId: String,
      gateway: String,
      gatewayTransactionId: String,
      paidAt: Date,
      refundId: String,
      refundedAt: Date,
      refundAmount: Number,
    },

    // LOCATIONS (backward compatible + GeoJSON)
    pickupLocation: { type: AddressSchema },
    dropoffLocation: { type: AddressSchema },

    specialRequests: String,

    // Enhanced passenger details
    passengerDetails: [
      {
        name: String,
        age: Number,
        gender: String,
      },
    ],

    // Trip tracking
    tripTracking: {
      startTime: Date,
      endTime: Date,
      actualPickupTime: Date,
      actualDropoffTime: Date,
      distance: Number,
      route: [{ lat: Number, lng: Number, timestamp: Date }],
    },

    rating: {
      driverRating: {
        score: { type: Number, min: 1, max: 5 },
        comment: String,
        ratedAt: Date,
      },
      passengerRating: {
        score: { type: Number, min: 1, max: 5 },
        comment: String,
        ratedAt: Date,
      },
    },

    // Cancellation details
    cancellation: {
      reason: String,
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      cancelledAt: Date,
      refundEligible: { type: Boolean, default: true },
    },

    notifications: [
      {
        type: {
          type: String,
          enum: ['booking_confirmed', 'ride_started', 'ride_completed', 'ride_cancelled', 'payment_reminder'],
        },
        sentAt: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
        channel: { type: String, enum: ['push', 'email', 'sms'], default: 'push' },
      },
    ],
  },
  { timestamps: true }
);

/* ---------------------------------------------------------------------------
   Indexes
--------------------------------------------------------------------------- */
bookingSchema.index({ ride: 1 });
bookingSchema.index({ passenger: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// Geospatial (works when coordinates are present)
bookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
bookingSchema.index({ 'dropoffLocation.coordinates': '2dsphere' });

/* ---------------------------------------------------------------------------
   Virtuals
--------------------------------------------------------------------------- */
bookingSchema.virtual('tripDuration').get(function () {
  if (this.tripTracking?.startTime && this.tripTracking?.endTime) {
    return this.tripTracking.endTime - this.tripTracking.startTime;
  }
  return null;
});

bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

/* ---------------------------------------------------------------------------
   Methods
--------------------------------------------------------------------------- */
bookingSchema.methods.canCancel = function () {
  const rideTime = this.ride?.departureTime instanceof Date ? this.ride.departureTime : null;
  if (!rideTime) return false; // requires populated ride or embedded departureTime date
  const hoursUntilRide = (rideTime - new Date()) / (1000 * 60 * 60);
  // Can cancel if more than 2 hours before ride and status allows
  return hoursUntilRide > 2 && ['pending', 'confirmed'].includes(this.status);
};

bookingSchema.methods.calculateRefund = function () {
  const rideTime = this.ride?.departureTime instanceof Date ? this.ride.departureTime : null;
  if (!rideTime) return 0;
  const hoursUntilRide = (rideTime - new Date()) / (1000 * 60 * 60);

  if (hoursUntilRide > 24) return this.totalAmount;
  if (hoursUntilRide > 6) return this.totalAmount * 0.5;
  if (hoursUntilRide > 2) return this.totalAmount * 0.25;
  return 0;
};

/* ---------------------------------------------------------------------------
   Middleware: normalize legacy location payloads before validation
--------------------------------------------------------------------------- */
bookingSchema.pre('validate', function (next) {
  try {
    if (this.pickupLocation) normalizeGeoTarget(this.pickupLocation);
    if (this.dropoffLocation) normalizeGeoTarget(this.dropoffLocation);
    next();
  } catch (e) {
    next(e);
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
