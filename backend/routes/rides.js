// routes/rides.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import Ride from '../models/Ride.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import {
  geocodeAddress,
  calculateRoute,
  getLocationSuggestions,
  calculateDistance, // used for Haversine fallback
} from '../services/googleMapsService.js';
import { ensureOp } from '../services/idempotency.js'; // idempotency (Redis/memory), safe if present

const router = express.Router();

/* ----------------------------- helpers ----------------------------- */

const isNumber = (n) => typeof n === 'number' && Number.isFinite(n);

const pickFirst = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== '');

// Pull idempotency op-id (optional)
function getOpId(req) {
  return req.headers['x-op-id'] || req.body?.opId || null;
}

/**
 * Normalizes an incoming "location" which can be:
 *  - string address
 *  - { name/address, coordinates:{lat,lng}, placeId }
 *  - { name/address, lat, lng, placeId }
 *
 * Returns a unified shape:
 *  { name?, address, coordinates:{lat,lng}, placeId? }
 *
 * It will:
 *  - trust coordinates if present
 *  - otherwise call geocodeAddress(addressLike)
 */
async function normalizeLocation(input, labelForError = 'location') {
  if (!input) throw new Error(`Missing ${labelForError}`);

  // If object with nested coordinates
  if (
    typeof input === 'object' &&
    input.coordinates &&
    isNumber(input.coordinates.lat) &&
    isNumber(input.coordinates.lng)
  ) {
    return {
      name: input.name || input.address || '',
      address: input.address || input.name || '',
      coordinates: { lat: input.coordinates.lat, lng: input.coordinates.lng },
      placeId: input.placeId,
    };
  }

  // If object with flat lat/lng
  if (typeof input === 'object' && isNumber(input.lat) && isNumber(input.lng)) {
    return {
      name: input.name || input.address || '',
      address: input.address || input.name || '',
      coordinates: { lat: input.lat, lng: input.lng },
      placeId: input.placeId,
    };
  }

  // Otherwise geocode text-like
  const addressLike =
    typeof input === 'string' ? input : pickFirst(input.address, input.name, input.from, input.to);

  if (!addressLike) {
    throw new Error(`Missing address for ${labelForError}`);
  }

  const g = await geocodeAddress(addressLike);
  if (!g?.coordinates || !isNumber(g.coordinates.lat) || !isNumber(g.coordinates.lng)) {
    throw new Error(`Failed to geocode ${labelForError}`);
  }

  return {
    name: typeof input === 'object' ? input.name || addressLike : addressLike,
    address: g.address || addressLike,
    coordinates: g.coordinates,
    placeId: g.placeId,
  };
}

/**
 * Convert a normalized location ({address, placeId?, coordinates:{lat,lng}, name?})
 * into the schema-ready document:
 *  { name, address, placeId?, lat, lng, coordinates: { type:'Point', coordinates:[lng,lat] } }
 */
function toLocationDoc(norm) {
  const lat = norm.coordinates.lat;
  const lng = norm.coordinates.lng;
  return {
    name: norm.name || norm.address || '',
    address: norm.address || norm.name || '',
    placeId: norm.placeId,
    lat,
    lng,
    coordinates: {
      type: 'Point',
      coordinates: [lng, lat], // GeoJSON order
    },
  };
}

/* ----------------------------- create ride ----------------------------- */
/**
 * Accepts:
 *  - POST /api/rides/create     (existing)
 *  - POST /api/rides            (conventional)
 *
 * Body can send any of these for start/end:
 *  - startLocation / endLocation (preferred rich object)
 *  - pickup / dropoff (rich or flat)
 *  - from/to + fromLat/fromLng/toLat/toLng
 */
async function createRideHandler(req, res) {
  try {
    // Idempotency (optional)
    const opId = getOpId(req);
    if (opId && ensureOp) {
      const first = await ensureOp(`${req.user.id}:${opId}`, 3600);
      if (!first) {
        return res.json({ success: true, dedup: true });
      }
    }

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
      amenities,
      // aliases supported:
      pickup,
      dropoff,
      from,
      to,
      fromLat,
      fromLng,
      toLat,
      toLng,
      fromPlaceId,
      toPlaceId,
    } = req.body || {};

    // Build "candidates" from any aliases the client may have used
    const startCandidate =
      pickFirst(startLocation, pickup) || {
        name: from,
        address: from,
        lat: isNumber(fromLat) ? fromLat : undefined,
        lng: isNumber(fromLng) ? fromLng : undefined,
        placeId: fromPlaceId,
      };

    const endCandidate =
      pickFirst(endLocation, dropoff) || {
        name: to,
        address: to,
        lat: isNumber(toLat) ? toLat : undefined,
        lng: isNumber(toLng) ? toLng : undefined,
        placeId: toPlaceId,
      };

    // Normalize (trust coords if present; otherwise geocode)
    const start = await normalizeLocation(startCandidate, 'startLocation');
    const end = await normalizeLocation(endCandidate, 'endLocation');

    // Normalize via locations (skip bad ones politely)
    const processedViaLocations = [];
    for (let i = 0; i < viaLocations.length; i++) {
      const vIn = viaLocations[i];
      try {
        const nv = await normalizeLocation(vIn, `viaLocation[${i}]`);
        processedViaLocations.push({
          name: vIn?.name || vIn?.address || nv.address,
          address: nv.address,
          coordinates: nv.coordinates,
          placeId: nv.placeId,
          order: vIn?.order || i + 1,
          maxWaitTime: vIn?.maxWaitTime || 5,
        });
      } catch {
        // ignore this via if it can't be normalized
      }
    }

    // Calculate route (use normalized shapes) with safe fallback
    let routeInfo = null;
    try {
      routeInfo = await calculateRoute(start, end, processedViaLocations);
    } catch (err) {
      // Fallback when Google Directions is unavailable (e.g., missing API key)
      const s = start.coordinates;
      const e = end.coordinates;
      const distanceKm = Math.max(1, Math.round(calculateDistance(s.lat, s.lng, e.lat, e.lng)));
      // rough driving speed ~40 km/h
      const durationMin = Math.max(10, Math.round((distanceKm / 40) * 60));

      routeInfo = {
        distance: distanceKm,
        duration: durationMin,
        polyline: undefined,
        waypoints: [],
      };

      logger.warn('Directions API unavailable — using Haversine fallback', {
        distanceKm,
        durationMin,
      });
    }

    const ride = new Ride({
      driver: req.user.id,

      // schema-ready (GeoJSON + lat/lng numbers)
      startLocation: toLocationDoc(start),
      endLocation: toLocationDoc(end),
      viaLocations: processedViaLocations.map((v) => ({
        ...toLocationDoc(v),
        order: v.order,
        maxWaitTime: v.maxWaitTime,
      })),

      departureTime: new Date(departureTime),
      availableSeats,
      totalSeats: availableSeats,
      pricePerSeat,
      distance: routeInfo?.distance,
      duration: routeInfo?.duration,
      route: routeInfo
        ? {
            polyline: routeInfo.polyline,
            waypoints: routeInfo.waypoints,
            totalDistance: routeInfo.distance,
            totalDuration: routeInfo.duration,
          }
        : undefined,
      preferences: preferences || {},
      vehicle: {
        ...vehicle,
        amenities: amenities || [],
      },
      description,
      paymentOptions: paymentOptions || { cash: true, upi: true },
      bookingPolicy: bookingPolicy || { instantBooking: true },
      dynamicPricing: dynamicPricing || { enabled: false },
      realTimeTracking: {
        enabled: true,
        currentLocation: { lat: start.coordinates.lat, lng: start.coordinates.lng },
      },
    });

    await ride.save();
    await ride.populate('driver', 'name email phone rating vehicle');

    // Emit socket event for new ride
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_ride_available', {
        rideId: ride._id,
        from: ride.startLocation.name,
        to: ride.endLocation.name,
        price: ride.pricePerSeat,
        departureTime: ride.departureTime,
      });
    }

    logger.info(`New ride created by user ${req.user.id}: ${ride._id}`);

    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      ride,
    });
  } catch (error) {
    logger.error('Create ride error:', error);
    const isGeo =
      /geocode|address|ZERO_RESULTS|REQUEST_DENIED|GOOGLE|coordinates/i.test(error?.message || '');
    res.status(isGeo ? 400 : 500).json({
      success: false,
      message: error.message || 'Failed to create ride',
    });
  }
}

// keep your existing route
router.post('/create', protect, createRideHandler);
// also support POST /api/rides
router.post('/', protect, createRideHandler);

/* ------------------------------ search ------------------------------ */
// GET /api/rides/search
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
      sortBy = 'price',
      // NEW: if client sends coordinates, we can skip geocoding:
      fromLat,
      fromLng,
      toLat,
      toLng,
      viaLat,
      viaLng,
      trustCoordinates,
    } = req.query;

    const query = {
      status: 'active',
      availableSeats: { $gte: parseInt(passengers) },
      driver: { $ne: req.user.id },
    };

    // Helper to add $near queries
    const addNear = (field, lat, lng) => {
      if (!isNumber(lat) || !isNumber(lng)) return;
      query[field] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) * 1000,
        },
      };
    };

    // Prefer coordinates if provided
    if (trustCoordinates === 'true' || trustCoordinates === true) {
      addNear('startLocation.coordinates', Number(fromLat), Number(fromLng));
      addNear('endLocation.coordinates', Number(toLat), Number(toLng));
      addNear('viaLocations.coordinates', Number(viaLat), Number(viaLng));
    } else {
      // Otherwise, geocode the text inputs
      if (from) {
        try {
          const g = await geocodeAddress(from);
          addNear('startLocation.coordinates', g.coordinates.lat, g.coordinates.lng);
        } catch {
          query['startLocation.name'] = { $regex: from, $options: 'i' };
        }
      }

      if (to) {
        try {
          const g = await geocodeAddress(to);
          addNear('endLocation.coordinates', g.coordinates.lat, g.coordinates.lng);
        } catch {
          query['endLocation.name'] = { $regex: to, $options: 'i' };
        }
      }

      if (via) {
        try {
          const g = await geocodeAddress(via);
          addNear('viaLocations.coordinates', g.coordinates.lat, g.coordinates.lng);
        } catch {
          query['viaLocations.name'] = { $regex: via, $options: 'i' };
        }
      }
    }

    // Date filter (same-day window)
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.departureTime = { $gte: searchDate, $lt: nextDay };
    }

    if (maxPrice) query.pricePerSeat = { $lte: parseInt(maxPrice) };

    if (departure_time_start && departure_time_end) {
      query.departureTime = {
        ...(query.departureTime || {}),
        $gte: new Date(departure_time_start),
        $lte: new Date(departure_time_end),
      };
    }

    if (amenities) {
      const arr = Array.isArray(amenities) ? amenities : String(amenities).split(',');
      query['vehicle.amenities'] = { $all: arr };
    }

    if (vehicleType) {
      query['vehicle.type'] = vehicleType;
    }

    if (instantBooking === 'true') {
      query['bookingPolicy.instantBooking'] = true;
    }

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

    const enriched = rides.map((ride) => {
      const obj = ride.toObject();
      const dynamic = ride.calculateDynamicPrice?.() ?? ride.pricePerSeat;
      return {
        ...obj,
        canBook: ride.availableSeats >= parseInt(passengers),
        currentPrice: dynamic,
        estimatedArrival: new Date(ride.departureTime.getTime() + (ride.duration || 0) * 60000),
        totalCost: dynamic * parseInt(passengers),
      };
    });

    res.json({ success: true, count: enriched.length, rides: enriched });
  } catch (error) {
    logger.error('Search rides error:', error);
    res.status(500).json({ success: false, message: 'Failed to search rides' });
  }
});

/* ------------------------------ my rides ------------------------------ */
// GET /api/rides/user  (MUST be before :rideId)
router.get('/user', protect, async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;

    const q = { driver: req.user.id };
    if (status !== 'all') q.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Ride.find(q)
        .populate('driver', 'name rating phone profilePicture vehicle stats')
        .sort({ departureTime: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Ride.countDocuments(q),
    ]);

    const enriched = items.map((ride) => {
      const obj = ride.toObject();
      const dynamic = ride.calculateDynamicPrice?.() ?? ride.pricePerSeat;
      return {
        ...obj,
        currentPrice: dynamic,
        bookingsCount: Array.isArray(ride.bookings) ? ride.bookings.length : 0,
        canBook: false, // owner cannot book own ride
      };
    });

    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      count: enriched.length,
      rides: enriched,
    });
  } catch (error) {
    logger.error('Get user rides error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user rides' });
  }
});

/* ------------------------------ booking ----------------------------- */
// POST /api/rides/:rideId/book
router.post('/:rideId([0-9a-fA-F]{24})/book', protect, async (req, res) => {
  try {
    // Idempotency (optional)
    const opId = getOpId(req);
    if (opId && ensureOp) {
      const first = await ensureOp(`${req.user.id}:${opId}`, 3600);
      if (!first) {
        return res.json({ success: true, dedup: true });
      }
    }

    const { rideId } = req.params;
    const {
      seatsToBook,
      pickupLocation,
      dropoffLocation,
      specialRequests,
      paymentMethod,
      passengerDetails,
    } = req.body;

    const ride = await Ride.findById(rideId).populate('driver', 'name phone email');
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    if (ride.driver._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot book your own ride' });
    }

    if (ride.availableSeats < seatsToBook) {
      return res.status(400).json({ success: false, message: 'Not enough available seats' });
    }

    // Normalize pickup/dropoff: trust coords if present; else geocode string
    const pickupNorm = pickupLocation ? await normalizeLocation(pickupLocation, 'pickupLocation') : null;
    const dropoffNorm = dropoffLocation ? await normalizeLocation(dropoffLocation, 'dropoffLocation') : null;

    const currentPrice = ride.calculateDynamicPrice?.() ?? ride.pricePerSeat;
    const totalAmount = seatsToBook * currentPrice;

    const booking = new Booking({
      ride: rideId,
      passenger: req.user.id,
      seatsBooked: seatsToBook,
      totalAmount,
      pickupLocation: pickupNorm
        ? {
            name: pickupNorm.name || pickupNorm.address,
            address: pickupNorm.address,
            coordinates: pickupNorm.coordinates,
            placeId: pickupNorm.placeId,
          }
        : undefined,
      dropoffLocation: dropoffNorm
        ? {
            name: dropoffNorm.name || dropoffNorm.address,
            address: dropoffNorm.address,
            coordinates: dropoffNorm.coordinates,
            placeId: dropoffNorm.placeId,
          }
        : undefined,
      specialRequests,
      paymentMethod: paymentMethod || 'cash',
      status: ride.bookingPolicy?.instantBooking ? 'confirmed' : 'pending',
      passengerDetails,
    });

    await booking.save();

    // Update ride availability
    ride.availableSeats -= seatsToBook;
    ride.bookings.push(booking._id);
    await ride.save();

    await booking.populate([
      { path: 'passenger', select: 'name phone email' },
      { path: 'ride', populate: { path: 'driver', select: 'name phone email' } },
    ]);

    // Notify driver
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${ride.driver._id}`).emit('ride_booked', {
        bookingId: booking._id,
        rideId,
        passengerName: req.user.name,
        passengerPhone: req.user.phone,
        seatsBooked,
        totalAmount,
        from: ride.startLocation?.name,
        to: ride.endLocation?.name,
        pickupLocation: booking.pickupLocation,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Ride booked: ${booking._id} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully',
      booking,
      estimatedArrival: new Date(ride.departureTime.getTime() + (ride.duration || 0) * 60000),
    });
  } catch (error) {
    logger.error('Book ride error:', error);
    const isGeo =
      /geocode|address|ZERO_RESULTS|REQUEST_DENIED|GOOGLE|coordinates/i.test(error?.message || '');
    res.status(isGeo ? 400 : 500).json({
      success: false,
      message: error.message || 'Failed to book ride',
    });
  }
});

/* ---------------------------- live location ---------------------------- */
// PUT /api/rides/:rideId/location
router.put('/:rideId([0-9a-fA-F]{24})/location', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { lat, lng } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this ride' });
    }

    await ride.updateLocation(lat, lng);

    const io = req.app.get('socketio');
    if (io) {
      io.to(`ride_${rideId}`).emit('location_update', {
        rideId,
        driverLocation: { lat, lng },
        timestamp: new Date().toISOString(),
        driverName: req.user.name,
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: { lat, lng, timestamp: new Date() },
    });
  } catch (error) {
    logger.error('Update location error:', error);
    res.status(500).json({ success: false, message: 'Failed to update location' });
  }
});

/* -------------------------- places suggestions -------------------------- */
// GET /api/rides/suggestions
router.get('/suggestions', protect, async (req, res) => {
  try {
    const { input, location } = req.query;
    if (!input) return res.status(400).json({ success: false, message: 'Input parameter is required' });

    const suggestions = await getLocationSuggestions(input, location);
    res.json({ success: true, suggestions });
  } catch (error) {
    logger.error('Location suggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get location suggestions' });
  }
});

/* ------------------------------ ride detail ----------------------------- */
// GET /api/rides/:rideId
router.get('/:rideId([0-9a-fA-F]{24})', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId)
      .populate('driver', 'name rating phone profilePicture vehicle stats')
      .populate({
        path: 'bookings',
        populate: { path: 'passenger', select: 'name rating profilePicture' },
      });

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    const enrichedRide = {
      ...ride.toObject(),
      currentPrice: ride.calculateDynamicPrice?.() ?? ride.pricePerSeat,
      canBook: ride.availableSeats > 0 && ride.driver._id.toString() !== req.user.id,
    };

    res.json({ success: true, ride: enrichedRide });
  } catch (error) {
    logger.error('Get ride details error:', error);
    res.status(500).json({ success: false, message: 'Failed to get ride details' });
  }
});

/* -------------------------------- cancel -------------------------------- */
// PUT /api/rides/:rideId/cancel
router.put('/:rideId([0-9a-fA-F]{24})/cancel', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;

    const ride = await Ride.findById(rideId).populate('bookings');
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this ride' });
    }

    if (ride.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Ride cannot be cancelled' });
    }

    // Update ride status
    ride.status = 'cancelled';
    await ride.save();

    // Cancel all bookings (refund logic can be added)
    for (const booking of ride.bookings) {
      booking.status = 'cancelled';
      booking.cancellation = {
        reason: reason || 'Cancelled by driver',
        cancelledBy: req.user.id,
        cancelledAt: new Date(),
        refundEligible: true,
      };
      await booking.save();
    }

    const io = req.app.get('socketio');
    if (io) {
      io.to(`ride_${rideId}`).emit('ride_cancelled', {
        rideId,
        reason: reason || 'Cancelled by driver',
        from: ride.startLocation?.name,
        to: ride.endLocation?.name,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Ride cancelled: ${rideId} by user ${req.user.id}`);

    res.json({ success: true, message: 'Ride cancelled successfully' });
  } catch (error) {
    logger.error('Cancel ride error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel ride' });
  }
});

export default router;
