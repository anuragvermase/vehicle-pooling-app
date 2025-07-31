import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { logger } from '../utils/logger.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createRazorpayOrder = async (bookingId, amount) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId,
        passengerId: booking.passenger.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = new Payment({
      booking: bookingId,
      payer: booking.passenger,
      receiver: booking.ride.driver,
      amount,
      method: 'upi',
      gateway: {
        provider: 'razorpay',
        orderId: order.id
      },
      netAmount: amount
    });

    await payment.save();

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id
    };
  } catch (error) {
    logger.error('Create Razorpay order error:', error);
    throw error;
  }
};

export const verifyRazorpayPayment = async (paymentDetails) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      throw new Error('Invalid payment signature');
    }

    // Find payment record
    const payment = await Payment.findOne({
      'gateway.orderId': razorpay_order_id
    }).populate('booking');

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Update payment status
    await payment.markAsCompleted({
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    // Update booking payment status
    const booking = payment.booking;
    booking.paymentStatus = 'paid';
    booking.payment.transactionId = razorpay_payment_id;
    booking.payment.gateway = 'razorpay';
    booking.payment.paidAt = new Date();
    await booking.save();

    return {
      success: true,
      payment,
      booking
    };
  } catch (error) {
    logger.error('Verify Razorpay payment error:', error);
    throw error;
  }
};

export const processRefund = async (bookingId, amount, reason) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const payment = await Payment.findOne({ booking: bookingId });
    if (!payment || !payment.gateway.paymentId) {
      throw new Error('Original payment not found');
    }

    // Create refund with Razorpay
    const refund = await razorpay.payments.refund(payment.gateway.paymentId, {
      amount: amount * 100, // Convert to paise
      notes: {
        reason,
        bookingId
      }
    });

    // Update payment record
    await payment.processRefund(amount, reason);
    payment.refund.refundId = refund.id;
    payment.refund.status = 'processed';
    await payment.save();

    // Update booking
    booking.paymentStatus = 'refunded';
    booking.payment.refundId = refund.id;
    booking.payment.refundedAt = new Date();
    booking.payment.refundAmount = amount;
    await booking.save();

    return {
      success: true,
      refundId: refund.id,
      amount
    };
  } catch (error) {
    logger.error('Process refund error:', error);
    throw error;
  }
};

export const calculatePlatformFee = (amount) => {
  const feePercentage = 0.05; // 5% platform fee
  const platformFee = amount * feePercentage;
  const processingFee = 2; // Fixed processing fee
  const tax = platformFee * 0.18; // 18% GST on platform fee
  
  return {
    platformFee: Math.round(platformFee * 100) / 100,
    processingFee,
    tax: Math.round(tax * 100) / 100,
    total: Math.round((platformFee + processingFee + tax) * 100) / 100
  };
};

export const createWalletTransaction = async (userId, amount, type, description) => {
  try {
    // Implementation for wallet transactions
    // This would integrate with your wallet system
    
    logger.info(`Wallet transaction: ${type} ${amount} for user ${userId}`);
    
    return {
      success: true,
      transactionId: `wallet_${Date.now()}`,
      amount,
      type
    };
  } catch (error) {
    logger.error('Wallet transaction error:', error);
    throw error;
  }
};