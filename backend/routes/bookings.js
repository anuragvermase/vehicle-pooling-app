import express from 'express';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Ride from '../models/Ride.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 10, type = 'all' } = req.query;

    let query = {};
    
    // Filter by type (as passenger or driver)
    if (type === 'passenger') {
      query.passenger = req.user.id;
    } else if (type === 'driver') {
      // Get rides where user is driver, then get bookings for those rides
      const userRides = await Ride.find({ driver: req.user.id }).select('_id');
      const rideIds = userRides.map(ride => ride._id);
      query.ride = { $in: rideIds };
    } else {
      // Both passenger and driver bookings
      const userRides = await Ride.find({ driver: req.user.id }).select('_id');
      const rideIds = userRides.map(ride => ride._id);
      query.$or = [
        { passenger: req.user.id },
        { ride: { $in: rideIds } }
      ];
    }

    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate({
        path: 'ride',
        populate: {
          path: 'driver',
          select: 'name rating phone profilePicture'
        }
      })
      .populate('passenger', 'name rating phone profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings'
    });
  }
});

// @route   GET /api/bookings/:bookingId
// @desc    Get booking details
// @access  Private
router.get('/:bookingId', protect, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'ride',
        populate: {
          path: 'driver',
          select: 'name rating phone profilePicture vehicle'
        }
      })
      .populate('passenger', 'name rating phone profilePicture');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    const hasAccess = booking.passenger._id.toString() === req.user.id ||
                     booking.ride.driver._id.toString() === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add additional computed fields
    const enrichedBooking = {
      ...booking.toObject(),
      canCancel: booking.canCancel(),
      refundAmount: booking.calculateRefund(),
      tripDuration: booking.tripDuration
    };

    res.json({
      success: true,
      booking: enrichedBooking
    });
  } catch (error) {
    logger.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking details'
    });
  }
});

// @route   PUT /api/bookings/:bookingId/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:bookingId/cancel', protect, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('ride')
      .populate('passenger', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can cancel
    const canCancel = booking.passenger._id.toString() === req.user.id ||
                     booking.ride.driver.toString() === req.user.id;

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (!booking.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled at this time'
      });
    }

    // Calculate refund amount
    const refundAmount = booking.calculateRefund();

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      reason: reason || 'Cancelled by user',
      cancelledBy: req.user.id,
      cancelledAt: new Date(),
      refundEligible: refundAmount > 0
    };

    // Update payment status if refund is due
    if (refundAmount > 0) {
      booking.paymentStatus = 'refunded';
      // Process actual refund here
      // await processRefund(booking, refundAmount);
    }

    await booking.save();

    // Update ride availability
    const ride = await Ride.findById(booking.ride._id);
    ride.availableSeats += booking.seatsBooked;
    await ride.save();

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      const otherParty = booking.passenger._id.toString() === req.user.id ? 
                        booking.ride.driver : booking.passenger._id;
      
      io.to(`user_${otherParty}`).emit('booking_cancelled', {
        bookingId,
        reason: reason || 'Cancelled by user',
        refundAmount,
        cancelledBy: req.user.name
      });
    }

    logger.info(`Booking cancelled: ${bookingId} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount
    });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

// @route   POST /api/bookings/:bookingId/rate
// @desc    Rate a ride (driver or passenger)
// @access  Private
router.post('/:bookingId/rate', protect, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment, tags } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('ride')
      .populate('passenger');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if ride is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed rides'
      });
    }

    // Determine if user is rating driver or passenger
    const isPassengerRating = booking.passenger._id.toString() === req.user.id;
    const isDriverRating = booking.ride.driver.toString() === req.user.id;

    if (!isPassengerRating && !isDriverRating) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this booking'
      });
    }

    // Check if already rated
    if (isPassengerRating && booking.rating.driverRating.score) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this ride'
      });
    }

    if (isDriverRating && booking.rating.passengerRating.score) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this passenger'
      });
    }

    // Update rating
    if (isPassengerRating) {
      booking.rating.driverRating = {
        score: rating,
        comment: comment || '',
        ratedAt: new Date()
      };
      
      // Update driver's overall rating
      await User.updateRating(booking.ride.driver, rating);
    } else {
      booking.rating.passengerRating = {
        score: rating,
        comment: comment || '',
        ratedAt: new Date()
      };
      
      // Update passenger's overall rating
      await User.updateRating(booking.passenger._id, rating);
    }

    await booking.save();

    // Create review record
    // const review = new Review({...});
    // await review.save();

    logger.info(`Rating submitted for booking ${bookingId} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    logger.error('Rate booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
});

// @route   POST /api/bookings/:bookingId/start-trip
// @desc    Start trip tracking
// @access  Private
router.post('/:bookingId/start-trip', protect, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only driver can start trip
    if (booking.ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only driver can start trip'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be confirmed to start trip'
      });
    }

    // Update booking status
    booking.status = 'active';
    booking.tripTracking.startTime = new Date();
    await booking.save();

    // Update ride status
    booking.ride.status = 'in_progress';
    await booking.ride.save();

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${booking.passenger}`).emit('trip_started', {
        bookingId,
        startTime: booking.tripTracking.startTime
      });
    }

    res.json({
      success: true,
      message: 'Trip started successfully'
    });
  } catch (error) {
    logger.error('Start trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start trip'
    });
  }
});

// @route   POST /api/bookings/:bookingId/complete-trip
// @desc    Complete trip
// @access  Private
router.post('/:bookingId/complete-trip', protect, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { endLocation, distance } = req.body;

    const booking = await Booking.findById(bookingId).populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only driver can complete trip
    if (booking.ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only driver can complete trip'
      });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Trip must be active to complete'
      });
    }

    // Update booking
    booking.status = 'completed';
    booking.tripTracking.endTime = new Date();
    if (distance) booking.tripTracking.distance = distance;
    await booking.save();

    // Check if all bookings for this ride are completed
    const remainingBookings = await Booking.find({
      ride: booking.ride._id,
      status: { $in: ['confirmed', 'active'] }
    });

    if (remainingBookings.length === 0) {
      booking.ride.status = 'completed';
      await booking.ride.save();
    }

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${booking.passenger}`).emit('trip_completed', {
        bookingId,
        endTime: booking.tripTracking.endTime,
        duration: booking.tripDuration
      });
    }

    res.json({
      success: true,
      message: 'Trip completed successfully'
    });
  } catch (error) {
    logger.error('Complete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete trip'
    });
  }
});

export default router;