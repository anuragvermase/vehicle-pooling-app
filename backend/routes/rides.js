import express from 'express';
import { protect } from '../middleware/auth.js';
import Ride from '../models/Ride.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import { geocodeAddress, calculateRoute, getLocationSuggestions } from '../services/googleMapsService.js';

const router = express.Router();

// @route   POST /api/rides/create
// @desc    Create a new ride with Google Maps integration
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    const {
      startLocation,
      endLocation,
      viaLocations = [],
      departureTime,
      availableSeats,
      pricePerSeat,
      preferences,
      vehicle,
      description,
      paymentOptions,
      bookingPolicy,
      dynamicPricing,
      amenities
    } = req.body;

    // Geocode start location
    const startGeocode = await geocodeAddress(startLocation.name || startLocation);
    
    // Geocode end location
    const endGeocode = await geocodeAddress(endLocation.name || endLocation);
    
    // Geocode via locations
    const processedViaLocations = [];
    for (let i = 0; i < viaLocations.length; i++) {
      const viaGeocode = await geocodeAddress(viaLocations[i].name || viaLocations[i]);
      processedViaLocations.push({
        ...viaGeocode,
        name: viaLocations[i].name || viaLocations[i],
        order: i + 1,
        maxWaitTime: viaLocations[i].maxWaitTime || 5
      });
    }

    // Calculate route with via points
    const routeInfo = await calculateRoute(startGeocode, endGeocode, processedViaLocations);

    const ride = new Ride({
      driver: req.user.id,
      startLocation: {
        name: startLocation.name || startLocation,
        ...startGeocode
      },
      endLocation: {
        name: endLocation.name || endLocation,
        ...endGeocode
      },
      viaLocations: processedViaLocations,
      departureTime: new Date(departureTime),
      availableSeats,
      totalSeats: availableSeats,
      pricePerSeat,
      distance: routeInfo.distance,
      duration: routeInfo.duration,
      route: {
        polyline: routeInfo.polyline,
        waypoints: routeInfo.waypoints,
        totalDistance: routeInfo.distance,
        totalDuration: routeInfo.duration
      },
      preferences: preferences || {},
      vehicle: {
        ...vehicle,
        amenities: amenities || []
      },
      description,
      paymentOptions: paymentOptions || { cash: true, upi: true },
      bookingPolicy: bookingPolicy || { instantBooking: true },
      dynamicPricing: dynamicPricing || { enabled: false },
      realTimeTracking: {
        enabled: true,
        currentLocation: startGeocode.coordinates
      }
    });

    await ride.save();
    
    // Populate driver info for response
    await ride.populate('driver', 'name email phone rating vehicle');

    // Emit socket event for new ride
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_ride_available', {
        rideId: ride._id,
        from: ride.startLocation.name,
        to: ride.endLocation.name,
        price: ride.pricePerSeat,
        departureTime: ride.departureTime
      });
    }

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
      message: error.message || 'Failed to create ride'
    });
  }
});

// @route   GET /api/rides/search
// @desc    Advanced search with Google Maps integration
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const {
      from,
      to,
      via,
      date,
      passengers = 1,
      maxPrice,
      departure_time_start,
      departure_time_end,
      radius = 10, // km
      amenities,
      vehicleType,
      instantBooking,
      sortBy = 'price'
    } = req.query;

    let query = {
      status: 'active',
      availableSeats: { $gte: parseInt(passengers) },
      driver: { $ne: req.user.id }
    };

    // Geocode search locations for proximity search
    if (from) {
      try {
        const fromGeocode = await geocodeAddress(from);
        query['startLocation.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [fromGeocode.coordinates.lng, fromGeocode.coordinates.lat]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        };
      } catch (error) {
        // Fallback to text search if geocoding fails
        query['startLocation.name'] = { $regex: from, $options: 'i' };
      }
    }

    if (to) {
      try {
        const toGeocode = await geocodeAddress(to);
        query['endLocation.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [toGeocode.coordinates.lng, toGeocode.coordinates.lat]
            },
            $maxDistance: radius * 1000
          }
        };
      } catch (error) {
        query['endLocation.name'] = { $regex: to, $options: 'i' };
      }
    }

    // Via location search
    if (via) {
      try {
        const viaGeocode = await geocodeAddress(via);
        query['viaLocations.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [viaGeocode.coordinates.lng, viaGeocode.coordinates.lat]
            },
            $maxDistance: radius * 1000
          }
        };
      } catch (error) {
        query['viaLocations.name'] = { $regex: via, $options: 'i' };
      }
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

    // Additional filters
    if (maxPrice) {
      query.pricePerSeat = { $lte: parseInt(maxPrice) };
    }

    if (departure_time_start && departure_time_end) {
      query.departureTime = {
        ...query.departureTime,
        $gte: new Date(departure_time_start),
        $lte: new Date(departure_time_end)
      };
    }

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      query['vehicle.amenities'] = { $all: amenitiesArray };
    }

    if (vehicleType) {
      query['vehicle.type'] = vehicleType;
    }

    if (instantBooking === 'true') {
      query['bookingPolicy.instantBooking'] = true;
    }

    // Sorting
    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions = { pricePerSeat: 1 };
        break;
      case 'rating':
        sortOptions = { 'rating.average': -1 };
        break;
      case 'time':
        sortOptions = { departureTime: 1 };
        break;
      case 'duration':
        sortOptions = { duration: 1 };
        break;
      case 'distance':
        sortOptions = { distance: 1 };
        break;
      default:
        sortOptions = { departureTime: 1 };
    }

    const rides = await Ride.find(query)
      .populate('driver', 'name rating phone profilePicture vehicle stats')
      .sort(sortOptions)
      .limit(50);

    // Calculate additional info for each ride
    const enrichedRides = rides.map(ride => {
      const rideObj = ride.toObject();
      return {
        ...rideObj,
        canBook: ride.availableSeats >= parseInt(passengers),
        currentPrice: ride.calculateDynamicPrice(),
        estimatedArrival: new Date(ride.departureTime.getTime() + ride.duration * 60000),
        totalCost: ride.calculateDynamicPrice() * parseInt(passengers)
      };
    });

    res.json({
      success: true,
      count: enrichedRides.length,
      rides: enrichedRides
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
// @desc    Book a ride with enhanced features
// @access  Private
router.post('/:rideId/book', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { 
      seatsToBook, 
      pickupLocation, 
      dropoffLocation, 
      specialRequests,
      paymentMethod,
      passengerDetails 
    } = req.body;

    const ride = await Ride.findById(rideId).populate('driver', 'name phone email');
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driver._id.toString() === req.user.id) {
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

    // Process pickup and dropoff locations
    let processedPickup = pickupLocation;
    let processedDropoff = dropoffLocation;

    if (pickupLocation && typeof pickupLocation === 'string') {
      processedPickup = await geocodeAddress(pickupLocation);
    }

    if (dropoffLocation && typeof dropoffLocation === 'string') {
      processedDropoff = await geocodeAddress(dropoffLocation);
    }

    const currentPrice = ride.calculateDynamicPrice();
    const totalAmount = seatsToBook * currentPrice;

    const booking = new Booking({
      ride: rideId,
      passenger: req.user.id,
      seatsBooked: seatsToBook,
      totalAmount,
      pickupLocation: processedPickup,
      dropoffLocation: processedDropoff,
      specialRequests,
      paymentMethod: paymentMethod || 'cash',
      status: ride.bookingPolicy.instantBooking ? 'confirmed' : 'pending',
      passengerDetails
    });

    await booking.save();

    // Update ride availability
    ride.availableSeats -= seatsToBook;
    ride.bookings.push(booking._id);
    await ride.save();

    // Populate booking for response
    await booking.populate([
      { path: 'passenger', select: 'name phone email' },
      { path: 'ride', populate: { path: 'driver', select: 'name phone email' } }
    ]);

    // Emit socket event to driver
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${ride.driver._id}`).emit('ride_booked', {
        bookingId: booking._id,
        rideId,
        passengerName: req.user.name,
        passengerPhone: req.user.phone,
        seatsBooked,
        totalAmount,
        from: ride.startLocation.name,
        to: ride.endLocation.name,
        pickupLocation: processedPickup,
        timestamp: new Date().toISOString()
      });
    }

    logger.info(`Ride booked: ${booking._id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully',
      booking,
      estimatedArrival: new Date(ride.departureTime.getTime() + ride.duration * 60000)
    });
  } catch (error) {
    logger.error('Book ride error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to book ride'
    });
  }
});

// @route   PUT /api/rides/:rideId/location
// @desc    Update real-time location
// @access  Private
router.put('/:rideId/location', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { lat, lng } = req.body;

    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ride'
      });
    }

    await ride.updateLocation(lat, lng);

    // Emit location update to passengers
    const io = req.app.get('socketio');
    if (io) {
      io.to(`ride_${rideId}`).emit('location_update', {
        rideId,
        driverLocation: { lat, lng },
        timestamp: new Date().toISOString(),
        driverName: req.user.name
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: { lat, lng, timestamp: new Date() }
    });
  } catch (error) {
    logger.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
});

// @route   GET /api/rides/suggestions
// @desc    Get location suggestions using Google Places API
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
  try {
    const { input, location } = req.query;
    
    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Input parameter is required'
      });
    }

    const suggestions = await getLocationSuggestions(input, location);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    logger.error('Location suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get location suggestions'
    });
  }
});

// @route   GET /api/rides/:rideId
// @desc    Get ride details
// @access  Private
router.get('/:rideId', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    
    const ride = await Ride.findById(rideId)
      .populate('driver', 'name rating phone profilePicture vehicle stats')
      .populate({
        path: 'bookings',
        populate: {
          path: 'passenger',
          select: 'name rating profilePicture'
        }
      });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const enrichedRide = {
      ...ride.toObject(),
      currentPrice: ride.calculateDynamicPrice(),
      canBook: ride.availableSeats > 0 && ride.driver._id.toString() !== req.user.id
    };

    res.json({
      success: true,
      ride: enrichedRide
    });
  } catch (error) {
    logger.error('Get ride details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ride details'
    });
  }
});

// @route   PUT /api/rides/:rideId/cancel
// @desc    Cancel a ride
// @access  Private
router.put('/:rideId/cancel', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = await Ride.findById(rideId).populate('bookings');
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ride'
      });
    }

    if (ride.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ride cannot be cancelled'
      });
    }

    // Update ride status
    ride.status = 'cancelled';
    await ride.save();

    // Cancel all bookings and process refunds
    for (const booking of ride.bookings) {
      booking.status = 'cancelled';
      booking.cancellation = {
        reason: reason || 'Cancelled by driver',
        cancelledBy: req.user.id,
        cancelledAt: new Date(),
        refundEligible: true
      };
      await booking.save();

      // Process refund logic here
      // await processRefund(booking);
    }

    // Emit cancellation notifications
    const io = req.app.get('socketio');
    if (io) {
      io.to(`ride_${rideId}`).emit('ride_cancelled', {
        rideId,
        reason: reason || 'Cancelled by driver',
        from: ride.startLocation.name,
        to: ride.endLocation.name,
        timestamp: new Date().toISOString()
      });
    }

    logger.info(`Ride cancelled: ${rideId} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Ride cancelled successfully'
    });
  } catch (error) {
    logger.error('Cancel ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel ride'
    });
  }
});

export default router;