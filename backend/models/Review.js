import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  type: {
    type: String,
    enum: ['driver_to_passenger', 'passenger_to_driver'],
    required: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    driving: {
      type: Number,
      min: 1,
      max: 5
    }, // Only for driver reviews
    behavior: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  comment: {
    type: String,
    maxLength: 500
  },
  tags: [{
    type: String,
    enum: [
      'punctual', 'late', 'clean', 'dirty', 'friendly', 'rude', 
      'good_driver', 'reckless', 'quiet', 'talkative', 'helpful',
      'professional', 'unprofessional', 'safe', 'unsafe'
    ]
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  isHidden: {
    type: Boolean,
    default: false
  },
  // Response from reviewee
  response: {
    comment: String,
    respondedAt: Date
  },
  // Helpful votes
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Verification
  isVerified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ booking: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ ride: 1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ createdAt: -1 });

// Ensure one review per booking per type
reviewSchema.index({ booking: 1, type: 1 }, { unique: true });

// Virtual for helpful votes count
reviewSchema.virtual('helpfulVotesCount').get(function() {
  return this.helpfulVotes.length;
});

// Method to add helpful vote
reviewSchema.methods.addHelpfulVote = function(userId) {
  if (!this.helpfulVotes.some(vote => vote.user.toString() === userId.toString())) {
    this.helpfulVotes.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(userId) {
  const result = await this.aggregate([
    { $match: { reviewee: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating.overall' },
        totalReviews: { $sum: 1 },
        punctuality: { $avg: '$rating.punctuality' },
        cleanliness: { $avg: '$rating.cleanliness' },
        communication: { $avg: '$rating.communication' },
        driving: { $avg: '$rating.driving' },
        behavior: { $avg: '$rating.behavior' }
      }
    }
  ]);

  return result[0] || {
    averageRating: 0,
    totalReviews: 0,
    punctuality: 0,
    cleanliness: 0,
    communication: 0,
    driving: 0,
    behavior: 0
  };
};

const Review = mongoose.model('Review', reviewSchema);
export default Review;