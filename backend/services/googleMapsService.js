// services/googleMapsService.js
import dotenv from 'dotenv';
dotenv.config(); // ensure .env is loaded before reading process.env

import axios from 'axios';
import { logger } from '../utils/logger.js';

/* =============================== Key utils =============================== */
// Read the key at call-time (not at import) so it isn't undefined in some envs
const getKey = () => process.env.GOOGLE_MAPS_API_KEY;

function assertKey() {
  const key = getKey();
  if (!key) {
    const msg = 'GOOGLE_MAPS_API_KEY is not configured on the server';
    logger.error(msg);
    throw new Error(msg);
  }
}

/* ============================ Error normalization ======================== */
function handleGoogleError(apiName, data) {
  const status = data?.status || 'UNKNOWN_ERROR';
  const errMap = {
    ZERO_RESULTS: 'Address not found',
    OVER_DAILY_LIMIT: 'Google API daily limit exceeded (billing or quota)',
    OVER_QUERY_LIMIT: 'Google API query limit exceeded',
    REQUEST_DENIED: 'Google API request denied (check key, referrer, or restrictions)',
    INVALID_REQUEST: 'Google API invalid request (missing or invalid parameters)',
    UNKNOWN_ERROR: 'Google API unknown error, try again',
    NOT_FOUND: 'Resource not found',
  };
  const msg = errMap[status] || `${apiName} failed with status ${status}`;
  return new Error(msg);
}

/* ================================ Helpers ================================ */
// lat,lng string
const ll = (lat, lng) => `${lat},${lng}`;

// axios instance (you can tweak timeout/retries here if you like)
const http = axios.create({
  timeout: 12_000,
});

/* ======================================================================== */
/* Geocoding (address -> coordinates)                                       */
/* ======================================================================== */
export const geocodeAddress = async (address) => {
  assertKey();
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?address=${encodeURIComponent(address)}` +
      `&key=${getKey()}` +
      `&region=in`;

    const { data } = await http.get(url);

    if (data?.status !== 'OK' || !data?.results?.length) {
      throw handleGoogleError('Geocoding', data);
    }

    const first = data.results[0];
    return {
      coordinates: {
        lat: first.geometry.location.lat,
        lng: first.geometry.location.lng,
      },
      address: first.formatted_address,
      placeId: first.place_id,
    };
  } catch (error) {
    logger.error('Geocoding error:', error?.response?.data || error?.message || error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to geocode address');
  }
};

/* ======================================================================== */
/* Directions (origin+via+destination -> route summary)                     */
/* origin/destination: { coordinates:{lat,lng} }                            */
/* viaPoints: array of { coordinates:{lat,lng} }                            */
/* ======================================================================== */
export const calculateRoute = async (origin, destination, viaPoints = []) => {
  assertKey();
  try {
    if (!origin?.coordinates || !destination?.coordinates) {
      throw new Error('Origin and destination must include coordinates');
    }

    const waypoints =
      viaPoints && viaPoints.length
        ? '&waypoints=' +
          viaPoints
            .filter((p) => p?.coordinates)
            .map((p) => ll(p.coordinates.lat, p.coordinates.lng))
            .join('|')
        : '';

    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${ll(origin.coordinates.lat, origin.coordinates.lng)}` +
      `&destination=${ll(destination.coordinates.lat, destination.coordinates.lng)}` +
      `&mode=driving` +
      `&region=in` +
      waypoints +
      `&key=${getKey()}`;

    const { data } = await http.get(url);

    if (data?.status !== 'OK' || !data?.routes?.length) {
      throw handleGoogleError('Directions', data);
    }

    const route = data.routes[0];
    const legs = route.legs || [];
    const distanceMeters = legs.reduce((sum, l) => sum + (l.distance?.value || 0), 0);
    const durationSeconds = legs.reduce((sum, l) => sum + (l.duration?.value || 0), 0);

    return {
      distance: Math.round(distanceMeters / 1000), // km
      duration: Math.round(durationSeconds / 60),   // minutes
      polyline: route.overview_polyline?.points,
      waypoints: legs.map((leg) => ({
        lat: leg.end_location.lat,
        lng: leg.end_location.lng,
        address: leg.end_address,
      })),
    };
  } catch (error) {
    logger.error('Route calculation error:', error?.response?.data || error?.message || error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to calculate route');
  }
};

/* ======================================================================== */
/* Places Autocomplete                                                      */
/* ======================================================================== */
export const getLocationSuggestions = async (input, location = null) => {
  assertKey();
  try {
    let url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(input)}` +
      `&key=${getKey()}` +
      `&types=geocode` +
      `&components=country:in`;

    // location should be "lat,lng" string; add radius when provided
    if (location) {
      url += `&location=${location}&radius=50000`;
    }

    const { data } = await http.get(url);

    if (data?.status !== 'OK') {
      throw handleGoogleError('Places Autocomplete', data);
    }

    return (data.predictions || []).map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text,
      secondaryText: p.structured_formatting?.secondary_text,
      types: p.types,
    }));
  } catch (error) {
    logger.error('Location suggestions error:', error?.response?.data || error?.message || error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to get location suggestions');
  }
};

/* ======================================================================== */
/* Place Details                                                            */
/* ======================================================================== */
export const getPlaceDetails = async (placeId) => {
  assertKey();
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(placeId)}` +
      `&fields=name,formatted_address,geometry` +
      `&key=${getKey()}`;

    const { data } = await http.get(url);

    if (data?.status !== 'OK' || !data?.result) {
      throw handleGoogleError('Place Details', data);
    }

    const place = data.result;
    return {
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      placeId,
    };
  } catch (error) {
    logger.error('Place details error:', error?.response?.data || error?.message || error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to get place details');
  }
};

/* ======================================================================== */
/* Haversine Distance (km)                                                  */
/* ======================================================================== */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function deg2rad(deg) {
  return (deg * Math.PI) / 180;
}

/* ======================================================================== */
/* Reverse Geocoding (coordinates -> address)                               */
/* ======================================================================== */
export const reverseGeocode = async (lat, lng) => {
  assertKey();
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lng)}` +
      `&key=${getKey()}` +
      `&region=in`;

    const { data } = await http.get(url);

    if (data?.status !== 'OK' || !data?.results?.length) {
      throw handleGoogleError('Reverse Geocoding', data);
    }

    return {
      address: data.results[0].formatted_address,
      components: data.results[0].address_components,
    };
  } catch (error) {
    logger.error('Reverse geocoding error:', error?.response?.data || error?.message || error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to reverse geocode coordinates');
  }
};
