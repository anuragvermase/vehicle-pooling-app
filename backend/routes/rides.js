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
  calculateDistance, // used for Haversine fallback & end-distance
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
      from, to, via, date, passengers = 1, maxPrice,
      departure_time_start, departure_time_end,
      radius = 10, amenities, vehicleType, instantBooking,
      sortBy = 'price',
      fromLat, fromLng, toLat, toLng, viaLat, viaLng, trustCoordinates,
      group = 'false',
      includeOwn = 'false',               // <-- NEW
    } = req.query;

    const pax = Math.max(1, parseInt(passengers, 10) || 1);
    const radMeters = Number(radius) * 1000;
    const radSphere = Number(radius) / 6378.1;

    // Base match
    const baseMatch = {
      status: 'active',
      availableSeats: { $gte: pax },
    };
    if (includeOwn !== 'true') {
      baseMatch.driver = { $ne: req.user.id };         // <-- keep default behavior
    }

    // Date window (UTC-safe same-day)
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0,0,0,0);
      const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);
      baseMatch.departureTime = { $gte: start, $lt: end };
    }

    // Departure time window (optional)
    if (departure_time_start && departure_time_end) {
      baseMatch.departureTime = {
        ...(baseMatch.departureTime || {}),
        $gte: new Date(departure_time_start),
        $lte: new Date(departure_time_end),
      };
    }

    if (maxPrice) baseMatch.pricePerSeat = { $lte: parseInt(maxPrice, 10) };

    if (vehicleType && vehicleType !== 'any') {
      baseMatch['vehicle.type'] = vehicleType;
    }

    if (instantBooking === 'true') {
      baseMatch['bookingPolicy.instantBooking'] = true;
    }

    if (amenities) {
      const arr = Array.isArray(amenities) ? amenities : String(amenities).split(',').map((s) => s.trim());
      if (arr.length) baseMatch['vehicle.amenities'] = { $all: arr };
    }

    // Resolve coordinates (prefer trusted coordinates)
    async function getCoords(text, latStr, lngStr) {
      const lat = Number(latStr);
      const lng = Number(lngStr);
      if ((trustCoordinates === 'true' || trustCoordinates === true) && isNumber(lat) && isNumber(lng)) {
        return { lat, lng };
      }
      if (isNumber(lat) && isNumber(lng)) return { lat, lng };
      if (!text) return null;
      try {
        const g = await geocodeAddress(text);
        if (g?.coordinates && isNumber(g.coordinates.lat) && isNumber(g.coordinates.lng)) {
          return { lat: g.coordinates.lat, lng: g.coordinates.lng };
        }
      } catch { /* noop */ }
      return null;
    }

    const origin = await getCoords(from, fromLat, fromLng);
    const dest   = await getCoords(to, toLat, toLng);
    const viaPt  = await getCoords(via, viaLat, viaLng);

    const canUseGeo = !!origin;

    let docs = [];
    if (canUseGeo) {
      // --- Preferred path: $geoNear on start, then $geoWithin on end/via + attribute filters
      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [origin.lng, origin.lat] },
            key: 'startLocation.coordinates',
            distanceField: '_distanceFromStart',
            spherical: true,
            maxDistance: radMeters,
          },
        },
        { $match: baseMatch },
      ];

      if (dest) {
        pipeline.push({
          $match: {
            'endLocation.coordinates': {
              $geoWithin: {
                $centerSphere: [[dest.lng, dest.lat], radSphere],
              },
            },
          },
        });
      }

      if (viaPt) {
        pipeline.push({
          $match: {
            'viaLocations.coordinates': {
              $geoWithin: {
                $centerSphere: [[viaPt.lng, viaPt.lat], radSphere],
              },
            },
          },
        });
      }

      pipeline.push(
        { $sort: { departureTime: 1 } },
        { $limit: 80 }
      );

      const raw = await Ride.aggregate(pipeline);

      // Hydrate driver + compute end distance + currentPrice + relevance
      const rideIds = raw.map((r) => r._id);
      const ridesFull = await Ride.find({ _id: { $in: rideIds } })
        .populate('driver', 'name rating phone profilePicture vehicle stats');

      const ridesById = new Map(ridesFull.map((r) => [String(r._id), r]));
      docs = raw.map((doc) => {
        const ride = ridesById.get(String(doc._id));
        if (!ride) return null;
        const startKm = (doc._distanceFromStart || 0) / 1000;
        const endKm = dest
          ? calculateDistance(
              ride.endLocation?.lat ?? ride.endLocation?.coordinates?.coordinates?.[1],
              ride.endLocation?.lng ?? ride.endLocation?.coordinates?.coordinates?.[0],
              dest.lat,
              dest.lng
            )
          : 0;

        const currentPrice = ride.calculateDynamicPrice?.() ?? ride.pricePerSeat;
        const relevance =
          (1 / (1 + startKm)) * 0.35 +
          (1 / (1 + endKm)) * 0.35 +
          (1 / (1 + Math.max(0, (ride.duration || 0) / 60))) * 0.10 +
          (1 / (1 + currentPrice / 1000)) * 0.20;

        return {
          ...ride.toObject(),
          startDistanceKm: Number(startKm.toFixed(2)),
          endDistanceKm: Number(endKm.toFixed(2)),
          canBook: ride.availableSeats >= pax,
          currentPrice,
          totalCost: currentPrice * pax,
          estimatedArrival: new Date(ride.departureTime.getTime() + (ride.duration || 0) * 60000),
          _relevance: relevance,
        };
      }).filter(Boolean);

      // Sorting
      switch (sortBy) {
        case 'price':
          docs.sort((a, b) => (a.currentPrice ?? a.pricePerSeat) - (b.currentPrice ?? b.pricePerSeat));
          break;
        case 'rating':
          docs.sort((a, b) => (b.driver?.rating?.average ?? 0) - (a.driver?.rating?.average ?? 0));
          break;
        case 'time':
          docs.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
          break;
        case 'duration':
          docs.sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
          break;
        case 'distance':
          docs.sort((a, b) => (a.startDistanceKm + a.endDistanceKm) - (b.startDistanceKm + b.endDistanceKm));
          break;
        case 'relevance':
        default:
          docs.sort((a, b) => (b._relevance ?? 0) - (a._relevance ?? 0));
      }

      docs = docs.slice(0, 50);
    } else {
      // --- Fallback path: no origin coords — name regex + attribute filters + simple sorts
      const q = { ...baseMatch };
      if (from) q['startLocation.name'] = { $regex: from, $options: 'i' };
      if (to) q['endLocation.name'] = { $regex: to, $options: 'i' };
      if (via) q['viaLocations.name'] = { $regex: via, $options: 'i' };

      let sortOptions = {};
      switch (sortBy) {
        case 'price': sortOptions = { pricePerSeat: 1 }; break;
        case 'rating': sortOptions = { 'rating.average': -1 }; break;
        case 'time': sortOptions = { departureTime: 1 }; break;
        case 'duration': sortOptions = { duration: 1 }; break;
        default: sortOptions = { departureTime: 1 };
      }

      const rides = await Ride.find(q)
        .populate('driver', 'name rating phone profilePicture vehicle stats')
        .sort(sortOptions)
        .limit(50);

      docs = rides.map((ride) => {
        const currentPrice = ride.calculateDynamicPrice?.() ?? ride.pricePerSeat;
        return {
          ...ride.toObject(),
          startDistanceKm: undefined,
          endDistanceKm: undefined,
          canBook: ride.availableSeats >= pax,
          currentPrice,
          totalCost: currentPrice * pax,
          estimatedArrival: new Date(ride.departureTime.getTime() + (ride.duration || 0) * 60000),
        };
      });
    }

    // --- NEW: optional grouping of near-duplicate results (same route & ±15 min)
    if (group === 'true') {
      const timeWindowMin = 15;              // +/- minutes to consider "same time"
      const coordBucket = (lat, lng) => [
        Math.round((lat ?? 0) * 100) / 100,  // ~1.1km buckets
        Math.round((lng ?? 0) * 100) / 100,
      ].join(',');

      const groups = new Map();
      for (const r of docs) {
        const sl = r.startLocation || {};
        const el = r.endLocation || {};
        const keyStart = coordBucket(sl.lat, sl.lng);
        const keyEnd   = coordBucket(el.lat, el.lng);
        const depMs    = new Date(r.departureTime).getTime();
        const slot     = Math.round(depMs / (timeWindowMin * 60 * 1000)); // bucket by window
        const key      = `${keyStart}|${keyEnd}|${slot}`;

        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(r);
      }

      const collapsed = [];
      for (const list of groups.values()) {
        // pick best representative: lowest currentPrice, then highest rating, then earliest
        list.sort((a, b) =>
          (a.currentPrice ?? a.pricePerSeat) - (b.currentPrice ?? b.pricePerSeat) ||
          (b.driver?.rating?.average ?? 0) - (a.driver?.rating?.average ?? 0) ||
          new Date(a.departureTime) - new Date(b.departureTime)
        );
        const head = { ...list[0], groupCount: list.length };
        collapsed.push(head);
      }

      // preserve requested sort after grouping
      switch (sortBy) {
        case 'price':
          collapsed.sort((a, b) => (a.currentPrice ?? a.pricePerSeat) - (b.currentPrice ?? b.pricePerSeat));
          break;
        case 'rating':
          collapsed.sort((a, b) => (b.driver?.rating?.average ?? 0) - (a.driver?.rating?.average ?? 0));
          break;
        case 'time':
          collapsed.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
          break;
        case 'duration':
          collapsed.sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
          break;
        case 'distance':
          collapsed.sort((a, b) => (a.startDistanceKm ?? 0) + (a.endDistanceKm ?? 0) - ((b.startDistanceKm ?? 0) + (b.endDistanceKm ?? 0)));
          break;
        case 'relevance':
        default:
          collapsed.sort((a, b) => (b._relevance ?? 0) - (a._relevance ?? 0));
      }

      docs = collapsed.slice(0, 50);
    }

    res.json({ success: true, count: docs.length, rides: docs });
  } catch (error) {
    logger.error('Search rides error:', error);
    res.status(500).json({ success: false, message: 'Failed to search rides' });
  }
});

/* ------------------------------ nearby (NEW) ------------------------------ */
// GET /api/rides/nearby?lat=..&lng=..&radius=10&includeOwn=true
router.get('/nearby', protect, async (req, res) => {
  try {
    const { lat, lng, radius = 10, date, includeOwn = 'false' } = req.query;
    const latN = Number(lat), lngN = Number(lng);
    if (!isNumber(latN) || !isNumber(lngN)) {
      return res.status(400).json({ success: false, message: 'lat and lng are required numbers' });
    }
    const radMeters = Number(radius) * 1000;

    const baseMatch = { status: 'active' };
    if (includeOwn !== 'true') {
      baseMatch.driver = { $ne: req.user.id };         // <-- hide own by default
    }
    if (date) {
      const d0 = new Date(date); d0.setUTCHours(0,0,0,0);
      const d1 = new Date(d0); d1.setUTCDate(d1.getUTCDate() + 1);
      baseMatch.departureTime = { $gte: d0, $lt: d1 };
    }
    
    // 1) rides starting near the point
    const startPipe = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lngN, latN] },
          key: 'startLocation.coordinates',
          distanceField: '_distanceFromStart',
          spherical: true,
          maxDistance: radMeters,
        },
      },
      { $match: baseMatch },
      { $project: { driver: 1, startLocation: 1, endLocation: 1, departureTime: 1, pricePerSeat: 1, duration: 1, distance: 1, rating: 1, vehicle: 1 } },
      { $limit: 80 },
    ];

    const startHits = await Ride.aggregate(startPipe);

    // 2) rides with a VIA near the point (within radius)
    const viaPipe = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lngN, latN] },
          key: 'viaLocations.coordinates',
          distanceField: '_distanceFromVia',
          spherical: true,
          maxDistance: radMeters,
        },
      },
      { $match: baseMatch },
      { $project: { driver: 1, startLocation: 1, endLocation: 1, departureTime: 1, pricePerSeat: 1, duration: 1, distance: 1, rating: 1, vehicle: 1 } },
      { $limit: 80 },
    ];

    const viaHits = await Ride.aggregate(viaPipe);

    // De-duplicate by _id (prefer startHits distance measure)
    const map = new Map();
    for (const d of [...startHits, ...viaHits]) {
      const key = String(d._id);
      if (!map.has(key)) map.set(key, d);
    }
    const ids = Array.from(map.keys());
    const rides = await Ride.find({ _id: { $in: ids } })
      .populate('driver', 'name rating phone profilePicture vehicle stats')
      .sort({ departureTime: 1 })
      .limit(100);

    const out = rides.map((r) => ({
      _id: r._id,
      start: { name: r.startLocation?.name, lat: r.startLocation?.lat, lng: r.startLocation?.lng },
      end:   { name: r.endLocation?.name,   lat: r.endLocation?.lat,   lng: r.endLocation?.lng },
      departureTime: r.departureTime,
      pricePerSeat: r.pricePerSeat,
      duration: r.duration,
      distance: r.distance,
      driver: r.driver ? { name: r.driver.name, rating: r.driver.rating?.average } : undefined,
      vehicle: r.vehicle ? { type: r.vehicle.type, model: r.vehicle.model } : undefined,
    }));

    res.json({ success: true, count: out.length, rides: out });
  } catch (error) {
    logger.error('Nearby rides error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch nearby rides' });
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
