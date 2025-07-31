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
    address: String
  },
  endLocation: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String
  },
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
  distance: {
    type: Number, // in kilometers
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'full'],
    default: 'active'
  },
  preferences: {
    smokingAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    musicAllowed: { type: Boolean, default: true },
    femaleOnly: { type: Boolean, default: false }
  },
  vehicle: {
    model: String,
    color: String,
    plateNumber: String
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  route: [{
    lat: Number,
    lng: Number
  }],
  description: String,
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    endDate: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
rideSchema.index({ 'startLocation.coordinates': '2dsphere' });
rideSchema.index({ 'endLocation.coordinates': '2dsphere' });
rideSchema.index({ departureTime: 1 });
rideSchema.index({ driver: 1 });
rideSchema.index({ status: 1 });

// Virtual for earnings calculation
rideSchema.virtual('totalEarnings').get(function() {
  const bookedSeats = this.totalSeats - this.availableSeats;
  return bookedSeats * this.pricePerSeat;
});

rideSchema.virtual('occupancyRate').get(function() {
  const bookedSeats = this.totalSeats - this.availableSeats;
  return (bookedSeats / this.totalSeats) * 100;
});

// Pre-save middleware
rideSchema.pre('save', function(next) {
  if (this.availableSeats === 0 && this.status === 'active') {
    this.status = 'full';
  }
  next();
});

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;