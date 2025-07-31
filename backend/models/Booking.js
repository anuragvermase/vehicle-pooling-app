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
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
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
  pickupLocation: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  dropoffLocation: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  specialRequests: String,
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
  notifications: [{
    type: {
      type: String,
      enum: ['booking_confirmed', 'ride_started', 'ride_completed', 'ride_cancelled']
    },
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ ride: 1 });
bookingSchema.index({ passenger: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;