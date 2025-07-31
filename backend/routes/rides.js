import express from 'express';
import { protect } from '../middleware/auth.js';
import Ride from '../models/Ride.js';
import Booking from '../models/Booking.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   POST /api/rides/create
// @desc    Create a new ride
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    const {
      startLocation,
      endLocation,
      departureTime,
      availableSeats,
      pricePerSeat,
      distance,
      duration,
      preferences,
      vehicle,
      description
    } = req.body;

    const ride = new Ride({
      driver: req.user.id,
      startLocation,
      endLocation,
      departureTime,
      availableSeats,
      totalSeats: availableSeats,
      pricePerSeat,
      distance,
      duration,
      preferences,
      vehicle,
      description
    });

    await ride.save();

    logger.info(`New ride created by user ${req.user.id}: ${ride._id}`);

    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      ride
    });

  } catch (error) {
    logger.error('Create ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ride'
    });
  }
});

// @route   GET /api/rides/search
// @desc    Search for available rides
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const {
      from,
      to,
      date,
      passengers = 1,
      maxPrice,
      departure_time_start,
      departure_time_end
    } = req.query;

    let query = {
      status: 'active',
      availableSeats: { $gte: parseInt(passengers) },
      driver: { $ne: req.user.id } // Exclude user's own rides
    };

    // Location-based search (implement with proper geocoding)
    if (from) {
      query['startLocation.name'] = { $regex: from, $options: 'i' };
    }
    if (to) {
      query['endLocation.name'] = { $regex: to, $options: 'i' };
    }

    // Date filter
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.departureTime = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    // Price filter
    if (maxPrice) {
      query.pricePerSeat = { $lte: parseInt(maxPrice) };
    }

    // Time range filter
    if (departure_time_start && departure_time_end) {
      query.departureTime = {
        ...query.departureTime,
        $gte: new Date(departure_time_start),
        $lte: new Date(departure_time_end)
      };
    }

    const rides = await Ride.find(query)
      .populate('driver', 'name rating phone')
      .sort({ departureTime: 1 })
      .limit(50);

    res.json({
      success: true,
      rides: rides.map(ride => ({
        ...ride.toObject(),
        canBook: ride.availableSeats >= parseInt(passengers)
      }))
    });

  } catch (error) {
    logger.error('Search rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search rides'
    });
  }
});

// @route   POST /api/rides/:rideId/book
// @desc    Book a ride
// @access  Private
router.post('/:rideId/book', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { seatsToBook, pickupLocation, dropoffLocation, specialRequests } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driver.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own ride'
      });
    }

    if (ride.availableSeats < seatsToBook) {
      return res.status(400).json({
        success: false,
        message: 'Not enough available seats'
      });
    }

    const totalAmount = seatsToBook * ride.pricePerSeat;

    const booking = new Booking({
      ride: rideId,
      passenger: req.user.id,
      seatsBooked: seatsToBook,
      totalAmount,
      pickupLocation,
      dropoffLocation,
      specialRequests,
      status: 'confirmed' // Auto-confirm for now
    });

    await booking.save();

    // Update ride availability
    ride.availableSeats -= seatsToBook;
    ride.bookings.push(booking._id);
    await ride.save();

    logger.info(`Ride booked: ${booking._id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully',
      booking
    });

  } catch (error) {
    logger.error('Book ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book ride'
    });
  }
});

export default router;