import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import API from '../../services/api'; // <- fixed path

const libraries = ['places', 'geometry'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px'
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

const EnhancedMap = ({ 
  rides = [], 
  selectedRide = null, 
  onRideSelect,
  center = defaultCenter,
  zoom = 11,
  showDirections = false,
  origin = null,
  destination = null,
  viaPoints = [],
  onMapClick,
  isInteractive = true,
  userLocation = null
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [currentUserLocation, setCurrentUserLocation] = useState(userLocation);
  const [nearbyRides, setNearbyRides] = useState([]);

  const mapRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Get user's current location
  useEffect(() => {
    if (!currentUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, [currentUserLocation]);

  // Calculate directions when origin/destination changes
  useEffect(() => {
    if (isLoaded && origin && destination && showDirections) {
      calculateRoute();
    }
  }, [isLoaded, origin, destination, viaPoints, showDirections]);

  const calculateRoute = useCallback(async () => {
    if (!origin || !destination) return;
    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = viaPoints.map(point => ({
      location: { lat: point.lat, lng: point.lng },
      stopover: true
    }));
    try {
      const results = await directionsService.route({
        origin: origin,
        destination: destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true
      });
      setDirectionsResponse(results);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  }, [origin, destination, viaPoints]);

  const onLoad = useCallback((map) => {
    setMap(map);
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  const handleMarkerClick = (ride) => {
    setSelectedMarker(ride._id || ride.id);
    if (onRideSelect) onRideSelect(ride);
  };

  const getMarkerIcon = (ride) => {
    const isSelected = selectedRide?._id === ride._id || selectedRide?.id === ride.id;
    const price = ride.currentPrice || ride.pricePerSeat || ride.price || 0;
    const groupCount = ride.groupCount || 0;
    const badge = groupCount > 1 ? `+${groupCount}` : `₹${price}`;

    return {
      url: `data:image/svg+xml;charset=UTF-8,
        <svg width='50' height='50' xmlns='http://www.w3.org/2000/svg'>
          <circle cx='25' cy='25' r='22' fill='%23${isSelected ? '4F46E5' : '10B981'}' stroke='white' stroke-width='3'/>
          <text x='25' y='30' text-anchor='middle' fill='white' font-size='11' font-weight='bold'>${badge}</text>
        </svg>`,
      scaledSize: new window.google.maps.Size(50, 50),
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(25, 25)
    };
  };

  const getUserLocationIcon = () => ({
    url: `data:image/svg+xml;charset=UTF-8,
      <svg width='24' height='24' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='12' cy='12' r='10' fill='%234285F4' stroke='white' stroke-width='2'/>
        <circle cx='12' cy='12' r='3' fill='white'/>
      </svg>`,
    scaledSize: new window.google.maps.Size(24, 24),
    origin: new window.google.maps.Point(0, 0),
    anchor: new window.google.maps.Point(12, 12)
  });

  // === Fetch nearby rides when map idle (pan/zoom finished) ===
  const fetchNearbyRides = useCallback(async () => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    if (!c) return;
    const lat = c.lat();
    const lng = c.lng();
    try {
      const res = await API.get(`/rides/nearby?lat=${lat}&lng=${lng}&radius=10`);
      if (res?.data?.success) {
        setNearbyRides(res.data.rides || []);
      }
    } catch (err) {
      console.error('Error fetching nearby rides:', err);
    }
  }, []);

  const handleIdle = () => {
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(fetchNearbyRides, 600); // debounce
  };

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading Google Maps...</p>
      </div>
    );
  }

  // Use explicit rides if provided; otherwise use auto nearby
  const allRides = rides.length ? rides : nearbyRides;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={onMapClick}
      onIdle={handleIdle}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        clickableIcons: false,
        gestureHandling: isInteractive ? 'cooperative' : 'none',
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
      }}
    >
      {/* User location marker */}
      {currentUserLocation && (
        <Marker
          position={currentUserLocation}
          icon={getUserLocationIcon()}
          title="Your Location"
          zIndex={1000}
        />
      )}

      {/* Ride markers */}
      {allRides.map((ride) => {
        const position =
          ride.start?.lat
            ? { lat: ride.start.lat, lng: ride.start.lng }
            : ride.startLocation?.coordinates
              ? { lat: ride.startLocation.coordinates.lat, lng: ride.startLocation.coordinates.lng }
              : ride.coordinates || null;
        if (!position) return null;

        return (
          <Marker
            key={ride._id || ride.id}
            position={position}
            icon={getMarkerIcon(ride)}
            onClick={() => handleMarkerClick(ride)}
            title={`${ride.start?.name || ride.startLocation?.name || ride.from} → ${ride.end?.name || ride.endLocation?.name || ride.to}`}
          />
        );
      })}

      {/* Via location markers */}
      {viaPoints.map((point, index) => (
        <Marker
          key={`via-${index}`}
          position={{ lat: point.lat, lng: point.lng }}
          icon={{
            url: `data:image/svg+xml;charset=UTF-8,
              <svg width='30' height='30' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='15' cy='15' r='12' fill='%23F59E0B' stroke='white' stroke-width='2'/>
                <text x='15' y='20' text-anchor='middle' fill='white' font-size='10' font-weight='bold'>${index + 1}</text>
              </svg>`,
            scaledSize: new window.google.maps.Size(30, 30),
            anchor: new window.google.maps.Point(15, 15)
          }}
          title={`Stop ${index + 1}`}
        />
      ))}

      {/* Info window for selected marker */}
      {selectedMarker && selectedRide && (
        <InfoWindow
          position={{
            lat: selectedRide.startLocation?.coordinates?.lat || selectedRide.start?.lat,
            lng: selectedRide.startLocation?.coordinates?.lng || selectedRide.start?.lng
          }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="map-info-window">
            <div className="info-header">
              <h4>
                {selectedRide.start?.name || selectedRide.startLocation?.name || selectedRide.from}
                {' '}→{' '}
                {selectedRide.end?.name || selectedRide.endLocation?.name || selectedRide.to}
              </h4>
              <div className="info-price">₹{selectedRide.currentPrice || selectedRide.pricePerSeat || selectedRide.price}</div>
            </div>
            <div className="info-details">
              <div className="info-row">👤 {selectedRide.driver?.name} • ⭐ {selectedRide.driver?.rating?.average || selectedRide.driver?.rating || 0}</div>
              <div className="info-row">🕐 {new Date(selectedRide.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {selectedRide.duration ? `${Math.floor(selectedRide.duration / 60)}h ${selectedRide.duration % 60}m` : selectedRide.estimatedDuration || ''}</div>
              <div className="info-row">👥 {selectedRide.availableSeats} seats available</div>
              {selectedRide.viaLocations?.length > 0 && <div className="info-row">📍 {selectedRide.viaLocations.length} stops</div>}
              {selectedRide.groupCount > 1 && <div className="info-row">📦 {selectedRide.groupCount} similar rides grouped</div>}
            </div>
            <div className="info-actions">
              <button 
                className="info-contact-btn"
                onClick={() => window.open(`tel:${selectedRide.driver?.phone}`)}
              >
                📞 Contact
              </button>
              <button className="info-book-btn">🎫 Book Now</button>
            </div>
          </div>
        </InfoWindow>
      )}

      {/* Directions renderer */}
      {directionsResponse && showDirections && (
        <DirectionsRenderer
          directions={directionsResponse}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#4F46E5',
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          }}
        />
      )}
    </GoogleMap>
  );
};

export default EnhancedMap;
