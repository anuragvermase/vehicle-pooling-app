import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  type: {
    type: String,
    enum: ['panic', 'accident', 'breakdown', 'harassment', 'medical', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false_alarm'],
    default: 'active'
  },
  location: {
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String,
    landmark: String
  },
  description: {
    type: String,
    maxLength: 1000
  },
  // Contact information
  contacts: {
    emergencyContacts: [{
      name: String,
      phone: String,
      notified: { type: Boolean, default: false },
      notifiedAt: Date
    }],
    policeNotified: { type: Boolean, default: false },
    ambulanceNotified: { type: Boolean, default: false }
  },
  // Response tracking
  response: {
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date,
    respondedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      respondedAt: Date,
      response: String
    }],
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolution: String
  },
  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // System tracking
  systemInfo: {
    userAgent: String,
    deviceInfo: String,
    appVersion: String,
    batteryLevel: Number,
    networkType: String
  },
  // Follow-up
  followUp: {
    required: { type: Boolean, default: false },
    completedAt: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes
emergencySchema.index({ user: 1 });
emergencySchema.index({ ride: 1 });
emergencySchema.index({ type: 1 });
emergencySchema.index({ severity: 1 });
emergencySchema.index({ status: 1 });
emergencySchema.index({ 'location.coordinates': '2dsphere' });
emergencySchema.index({ createdAt: -1 });

// Virtual for response time
emergencySchema.virtual('responseTime').get(function() {
  if (this.response.acknowledgedAt) {
    return this.response.acknowledgedAt - this.createdAt;
  }
  return null;
});

// Virtual for resolution time
emergencySchema.virtual('resolutionTime').get(function() {
  if (this.response.resolvedAt) {
    return this.response.resolvedAt - this.createdAt;
  }
  return null;
});

// Method to acknowledge emergency
emergencySchema.methods.acknowledge = function(userId) {
  this.status = 'acknowledged';
  this.response.acknowledgedBy = userId;
  this.response.acknowledgedAt = new Date();
  return this.save();
};

// Method to resolve emergency
emergencySchema.methods.resolve = function(userId, resolution) {
  this.status = 'resolved';
  this.response.resolvedBy = userId;
  this.response.resolvedAt = new Date();
  this.response.resolution = resolution;
  return this.save();
};

// Method to add response
emergencySchema.methods.addResponse = function(userId, responseText) {
  this.response.respondedBy.push({
    user: userId,
    respondedAt: new Date(),
    response: responseText
  });
  return this.save();
};

const Emergency = mongoose.model('Emergency', emergencySchema);
export default Emergency;