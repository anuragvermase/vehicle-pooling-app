import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  method: {
    type: String,
    enum: ['cash', 'upi', 'card', 'wallet', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  // Gateway details
  gateway: {
    provider: {
      type: String,
      enum: ['razorpay', 'stripe', 'paytm', 'phonepe', 'gpay']
    },
    transactionId: String,
    orderId: String,
    paymentId: String,
    signature: String
  },
  // UPI details
  upi: {
    vpa: String,
    transactionRef: String
  },
  // Card details (never store sensitive info)
  card: {
    last4: String,
    brand: String,
    network: String
  },
  // Fees and charges
  fees: {
    platformFee: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  // Net amounts
  netAmount: {
    type: Number,
    required: true
  },
  // Refund details
  refund: {
    amount: Number,
    reason: String,
    refundId: String,
    processedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  },
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  failedAt: Date,
  // Failure details
  failure: {
    code: String,
    message: String,
    gatewayError: String
  },
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceInfo: String
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ payer: 1 });
paymentSchema.index({ receiver: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'gateway.transactionId': 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for is successful
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Methods
paymentSchema.methods.markAsCompleted = function(gatewayResponse) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (gatewayResponse) {
    this.gateway = { ...this.gateway, ...gatewayResponse };
  }
  return this.save();
};

paymentSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failure = {
    code: error.code,
    message: error.message,
    gatewayError: error.gatewayError
  };
  return this.save();
};

paymentSchema.methods.processRefund = function(amount, reason) {
  this.refund = {
    amount,
    reason,
    processedAt: new Date(),
    status: 'pending'
  };
  this.status = 'refunded';
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;