import axios from 'axios';
import { logger } from '../utils/logger.js';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Helper function to get coordinates from address
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (response.data.results.length > 0) {
      const location = response.data.results[0];
      return {
        coordinates: {
          lat: location.geometry.location.lat,
          lng: location.geometry.location.lng
        },
        address: location.formatted_address,
        placeId: location.place_id
      };
    }
    throw new Error('Address not found');
  } catch (error) {
    logger.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
};

// Helper function to calculate route with via points
export const calculateRoute = async (origin, destination, viaPoints = []) => {
  try {
    let waypoints = '';
    if (viaPoints.length > 0) {
      waypoints = '&waypoints=' + viaPoints.map(point => 
        `${point.coordinates.lat},${point.coordinates.lng}`
      ).join('|');
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.coordinates.lat},${origin.coordinates.lng}&destination=${destination.coordinates.lat},${destination.coordinates.lng}${waypoints}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: Math.round(route.legs.reduce((total, leg) => total + leg.distance.value, 0) / 1000), // km
        duration: Math.round(route.legs.reduce((total, leg) => total + leg.duration.value, 0) / 60), // minutes
        polyline: route.overview_polyline.points,
        waypoints: route.legs.map(leg => ({
          lat: leg.end_location.lat,
          lng: leg.end_location.lng,
          address: leg.end_address
        }))
      };
    }
    throw new Error('Route not found');
  } catch (error) {
    logger.error('Route calculation error:', error);
    throw new Error('Failed to calculate route');
  }
};

// Get location suggestions using Google Places API
export const getLocationSuggestions = async (input, location = null) => {
  try {
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&types=geocode&components=country:in`;
    
    if (location) {
      url += `&location=${location}&radius=50000`;
    }

    const response = await axios.get(url);
    
    return response.data.predictions.map(prediction => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
      types: prediction.types
    }));
  } catch (error) {
    logger.error('Location suggestions error:', error);
    throw new Error('Failed to get location suggestions');
  }
};

// Get place details by place ID
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.result) {
      const place = response.data.result;
      return {
        name: place.name,
        address: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        placeId: placeId
      };
    }
    throw new Error('Place not found');
  } catch (error) {
    logger.error('Place details error:', error);
    throw new Error('Failed to get place details');
  }
};

// Calculate distance between two points
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Reverse geocoding - get address from coordinates
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.results.length > 0) {
      return {
        address: response.data.results[0].formatted_address,
        components: response.data.results[0].address_components
      };
    }
    throw new Error('Address not found for coordinates');
  } catch (error) {
    logger.error('Reverse geocoding error:', error);
    throw new Error('Failed to reverse geocode coordinates');
  }
};