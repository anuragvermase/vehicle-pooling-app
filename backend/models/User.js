import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    maxlength: [128, 'Password cannot exceed 128 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[0-9]{10,15}$/, 'Please enter a valid phone number (10-15 digits)']
  },
  profilePicture: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'Profile picture must be a valid image URL'
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rides: {
    offered: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride'
    }],
    taken: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride'
    }]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Constants for account locking
userSchema.statics.maxLoginAttempts = 5;
userSchema.statics.lockTime = 2 * 60 * 60 * 1000; // 2 hours

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    logger.info(`Password hashed for user: ${this.email}`);
    next();
  } catch (error) {
    logger.error('Error hashing password:', error);
    next(error);
  }
});

// Pre-save middleware to handle email uniqueness
userSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('email')) {
    try {
      const existingUser = await this.constructor.findOne({ 
        email: this.email,
        _id: { $ne: this._id }
      });
      
      if (existingUser) {
        const error = new Error('Email already exists');
        error.code = 11000;
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!candidatePassword || !this.password) {
      return false;
    }
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    logger.info(`Password comparison result for ${this.email}: ${isMatch}`);
    return isMatch;
  } catch (error) {
    logger.error('Error comparing password:', error);
    return false;
  }
};

// Handle failed login attempts
userSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= this.constructor.maxLoginAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + this.constructor.lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.__v;
  return user;
};

// Create safe user object for responses
userSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    profilePicture: this.profilePicture,
    isEmailVerified: this.isEmailVerified,
    isPhoneVerified: this.isPhoneVerified,
    isActive: this.isActive,
    rating: this.rating,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export default mongoose.model('User', userSchema);