import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minLength: [2, 'Name must be at least 2 characters long'],
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  // Password is OPTIONAL to support OAuth users
  password: {
    type: String,
    minLength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  // Phone is OPTIONAL to support OAuth users without phone
  phone: {
    type: String,
    match: [/^(\+91|91|0)?[6789]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  profilePicture: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  avatarUrl: {                 // ✅ persists uploaded avatar URL
    type: String,
    default: null
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    index: true,
    sparse: true
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  /* ------------------------ ✅ Admin/RBAC additions ------------------------ */
  role: {
    type: String,
    enum: ['user', 'driver', 'admin', 'superadmin'],
    default: 'user',
    index: true
  },
  isBanned: {
    type: Boolean,
    default: false,
    index: true
  },
  kycStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
    index: true
  },
  kycNote: { type: String },

  // Security fields
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  // Enhanced verification
  verification: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    identity: { type: Boolean, default: false },
    driving: { type: Boolean, default: false }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  // Enhanced preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    privacy: {
      showPhone: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      publicProfile: { type: Boolean, default: true },
      shareLocation: { type: Boolean, default: true }
    },
    ride: {
      autoApprove: { type: Boolean, default: false },
      instantBooking: { type: Boolean, default: true },
      femaleOnly: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
      musicPreference: { type: String, enum: ['any', 'no-music', 'soft', 'no-calls'], default: 'any' }
    },
    payment: {
      preferredMethod: { type: String, enum: ['cash', 'upi', 'card', 'wallet'], default: 'cash' },
      autoPayment: { type: Boolean, default: false }
    }
  },
  // Enhanced vehicle information
  vehicle: {
    make: String,
    model: String,
    year: Number,
    color: String,
    plateNumber: String,
    type: { type: String, enum: ['sedan', 'hatchback', 'suv', 'luxury', 'electric'] },
    verified: { type: Boolean, default: false },
    amenities: [{
      type: String,
      enum: ['ac', 'music', 'charging', 'wifi', 'water', 'snacks', 'sanitizer', 'newspapers']
    }],
    insurance: {
      company: String,
      policyNumber: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
    }
  },
  // Enhanced statistics
  stats: {
    totalRidesOffered: { type: Number, default: 0 },
    totalRidesTaken: { type: Number, default: 0 },
    totalRidesCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }
  },
  // Emergency contacts
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true }
  }],
  // Location tracking
  location: {
    current: {
      lat: Number,
      lng: Number,
      address: String,
      timestamp: Date
    },
    home: {
      lat: Number,
      lng: Number,
      address: String
    },
    work: {
      lat: Number,
      lng: Number,
      address: String
    }
  },
  // Subscription and payments
  subscription: {
    plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
    expiryDate: Date,
    features: [String]
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ kycStatus: 1 });
userSchema.index({ 'rating.average': -1 });
userSchema.index({ 'location.current': '2dsphere' });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password (only if present)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false; // OAuth-only users don't have a password
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if ((this.loginAttempts || 0) + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000
    };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

// Static methods
userSchema.statics.updateRating = async function(userId, newRating) {
  const user = await this.findById(userId);
  if (!user) throw new Error('User not found');

  const totalRating = (user.rating.average * user.rating.count) + newRating;
  user.rating.count += 1;
  user.rating.average = totalRating / user.rating.count;

  await user.save();
  return user.rating;
};

userSchema.methods.updateLocation = function(lat, lng, address) {
  this.location.current = {
    lat,
    lng,
    address,
    timestamp: new Date()
  };
  return this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
