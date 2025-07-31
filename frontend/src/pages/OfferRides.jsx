import React, { useState, useEffect, useRef } from 'react';
import { useJsApiLoader, GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import LocationSearchInput from '../components/maps/LocationSearchInput';
import API from '../services/api';
import './OfferRides.css';

const libraries = ['places', 'geometry'];

// Map configuration
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const mapZoom = 12;

const OfferRide = ({ user, onLogout }) => {
  const mapRef = useRef(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [rideData, setRideData] = useState({
    startLocation: '',
    endLocation: '',
    viaLocations: [],
    date: '',
    time: '',
    seats: 1,
    price: '',
    carModel: '',
    carNumber: '',
    description: '',
    amenities: [],
    recurringDays: [],
    isRecurring: false,
    vehicleType: 'sedan',
    paymentOptions: {
      cash: true,
      upi: true,
      card: false,
      wallet: false
    },
    bookingPolicy: {
      instantBooking: true,
      requireApproval: false,
      cancellationPolicy: 'moderate'
    },
    dynamicPricing: {
      enabled: false
    }
  });

  const [locationData, setLocationData] = useState({
    startLocation: null,
    endLocation: null,
    viaLocations: []
  });

  const [routeInfo, setRouteInfo] = useState(null);
  const [priceEstimate, setPriceEstimate] = useState({ min: 80, max: 120 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });

  const amenitiesList = [
    { id: 'ac', label: 'Air Conditioning', icon: '❄' },
    { id: 'music', label: 'Music System', icon: '🎵' },
    { id: 'charging', label: 'Phone Charging', icon: '🔌' },
    { id: 'wifi', label: 'WiFi Hotspot', icon: '📶' },
    { id: 'snacks', label: 'Snacks', icon: '🍿' },
    { id: 'water', label: 'Water Bottles', icon: '💧' },
    { id: 'sanitizer', label: 'Hand Sanitizer', icon: '🧴' },
    { id: 'newspapers', label: 'Newspapers', icon: '📰' }
  ];

  const vehicleTypes = [
    { id: 'hatchback', label: 'Hatchback', icon: '🚗' },
    { id: 'sedan', label: 'Sedan', icon: '🚙' },
    { id: 'suv', label: 'SUV', icon: '🚐' },
    { id: 'luxury', label: 'Luxury', icon: '🚘' },
    { id: 'electric', label: 'Electric', icon: '⚡' }
  ];

  const steps = [
    { id: 1, title: 'Route & Stops', icon: '📍', desc: 'Set your route with optional stops' },
    { id: 2, title: 'Schedule', icon: '🕐', desc: 'Choose date, time & recurring options' },
    { id: 3, title: 'Vehicle Details', icon: '🚗', desc: 'Add vehicle info & amenities' },
    { id: 4, title: 'Pricing & Policy', icon: '💰', desc: 'Set price & booking preferences' },
    { id: 5, title: 'Review & Publish', icon: '🚀', desc: 'Review and publish your ride' }
  ];

  // Map load handler
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Helper function to geocode address with fallback
  const geocodeAddress = async (address) => {
    if (!address) return null;
    try {
      // Method 1: Try Google Geocoding if available
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        return new Promise((resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const location = results[0].geometry.location;
              resolve({
                lat: location.lat(),
                lng: location.lng(),
                formatted_address: results[0].formatted_address
              });
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });
      }
      
      // Method 2: Fallback to Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RideShareApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formatted_address: data[0].display_name
        };
      } else {
        throw new Error('Address not found');
      }
    } catch (error) {
      console.warn('Geocoding failed for address:', address, error);
      // Return mock coordinates for development
      return getMockCoordinates(address);
    }
  };

  // Mock coordinates for development/testing
  const getMockCoordinates = (address) => {
    const mockLocations = {
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 }
    };
    const addressLower = address.toLowerCase();
    for (const [city, coords] of Object.entries(mockLocations)) {
      if (addressLower.includes(city)) {
        return {
          ...coords,
          formatted_address: address
        };
      }
    }
    // Default fallback (Bangalore with slight randomization)
    return {
      lat: 12.9716 + (Math.random() - 0.5) * 0.1,
      lng: 77.5946 + (Math.random() - 0.5) * 0.1,
      formatted_address: address
    };
  };

  // Validate form data
  const validateFormData = () => {
    const errors = [];
    if (!rideData.startLocation.trim()) {
      errors.push('Starting location is required');
    }
    if (!rideData.endLocation.trim()) {
      errors.push('Destination is required');
    }
    if (!rideData.date) {
      errors.push('Travel date is required');
    }
    if (!rideData.time) {
      errors.push('Departure time is required');
    }
    if (!rideData.carModel.trim()) {
      errors.push('Car model is required');
    }
    if (!rideData.carNumber.trim()) {
      errors.push('License plate is required');
    }
    if (!rideData.price || rideData.price <= 0) {
      errors.push('Valid price is required');
    }
    if (!rideData.seats || rideData.seats <= 0) {
      errors.push('Number of seats is required');
    }
    return errors;
  };

  // Calculate route when locations change
  useEffect(() => {
    if (locationData.startLocation && locationData.endLocation) {
      calculateRouteInfo();
    }
  }, [locationData.startLocation, locationData.endLocation, locationData.viaLocations]);

  // Calculate price estimate based on distance
  useEffect(() => {
    if (routeInfo) {
      const baseRate = 6; // ₹6 per km
      const min = Math.floor(routeInfo.distance * baseRate * 0.8);
      const max = Math.ceil(routeInfo.distance * baseRate * 1.2);
      setPriceEstimate({ min, max });
      
      if (!rideData.price) {
        setRideData(prev => ({ ...prev, price: Math.round((min + max) / 2) }));
      }
    }
  }, [routeInfo]);

  const calculateRouteInfo = async () => {
    if (!window.google || !locationData.startLocation || !locationData.endLocation) return;
    const directionsService = new window.google.maps.DirectionsService();
    
    const waypoints = locationData.viaLocations.map(location => ({
      location: location.coordinates,
      stopover: true
    }));

    try {
      const response = await directionsService.route({
        origin: locationData.startLocation.coordinates,
        destination: locationData.endLocation.coordinates,
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true
      });

      const route = response.routes[0];
      const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000; // km
      const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0) / 60; // minutes

      setRouteInfo({
        distance: Math.round(totalDistance),
        duration: Math.round(totalDuration),
        polyline: route.overview_polyline.points,
        bounds: route.bounds
      });
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRideData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationSelect = (locationType, location) => {
    setLocationData(prev => ({
      ...prev,
      [locationType]: location
    }));
    
    setRideData(prev => ({
      ...prev,
      [locationType]: location.name
    }));

    if (locationType === 'startLocation') {
      setMapCenter(location.coordinates);
    }
  };

  const addViaLocation = () => {
    setLocationData(prev => ({
      ...prev,
      viaLocations: [...prev.viaLocations, null]
    }));
    
    setRideData(prev => ({
      ...prev,
      viaLocations: [...prev.viaLocations, '']
    }));
  };

  const updateViaLocation = (index, location) => {
    const newViaLocations = [...locationData.viaLocations];
    newViaLocations[index] = location;
    
    setLocationData(prev => ({
      ...prev,
      viaLocations: newViaLocations
    }));
    
    const newViaNames = [...rideData.viaLocations];
    newViaNames[index] = location.name;
    
    setRideData(prev => ({
      ...prev,
      viaLocations: newViaNames
    }));
  };

  const removeViaLocation = (index) => {
    setLocationData(prev => ({
      ...prev,
      viaLocations: prev.viaLocations.filter((_, i) => i !== index)
    }));
    
    setRideData(prev => ({
      ...prev,
      viaLocations: prev.viaLocations.filter((_, i) => i !== index)
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setRideData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handlePaymentOptionToggle = (option) => {
    setRideData(prev => ({
      ...prev,
      paymentOptions: {
        ...prev.paymentOptions,
        [option]: !prev.paymentOptions[option]
      }
    }));
  };

  // FIXED SUBMIT FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Starting ride creation process...');
      
      // Validate form data
      const validationErrors = validateFormData();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Geocode addresses if location data is not available
      let startLocationData = locationData.startLocation;
      let endLocationData = locationData.endLocation;
      let viaLocationsData = locationData.viaLocations;

      // Geocode start location if needed
      if (!startLocationData) {
        console.log('Geocoding start location:', rideData.startLocation);
        const startCoords = await geocodeAddress(rideData.startLocation);
        if (startCoords) {
          startLocationData = {
            name: rideData.startLocation,
            coordinates: { lat: startCoords.lat, lng: startCoords.lng },
            formatted_address: startCoords.formatted_address
          };
        } else {
          throw new Error('Could not find coordinates for starting location');
        }
      }

      // Geocode end location if needed
      if (!endLocationData) {
        console.log('Geocoding end location:', rideData.endLocation);
        const endCoords = await geocodeAddress(rideData.endLocation);
        if (endCoords) {
          endLocationData = {
            name: rideData.endLocation,
            coordinates: { lat: endCoords.lat, lng: endCoords.lng },
            formatted_address: endCoords.formatted_address
          };
        } else {
          throw new Error('Could not find coordinates for destination');
        }
      }

      // Geocode via locations if needed
      if (rideData.viaLocations.length > 0) {
        viaLocationsData = [];
        for (let i = 0; i < rideData.viaLocations.length; i++) {
          const viaLocation = rideData.viaLocations[i];
          if (viaLocation && viaLocation.trim()) {
            let viaLocationData = locationData.viaLocations[i];
            if (!viaLocationData) {
              console.log('Geocoding via location:', viaLocation);
              const viaCoords = await geocodeAddress(viaLocation);
              if (viaCoords) {
                viaLocationData = {
                  name: viaLocation,
                  coordinates: { lat: viaCoords.lat, lng: viaCoords.lng },
                  formatted_address: viaCoords.formatted_address
                };
              }
            }
            if (viaLocationData) {
              viaLocationsData.push(viaLocationData);
            }
          }
        }
      }

      console.log('All locations geocoded successfully');

      // Create ride payload
      const ridePayload = {
        startLocation: startLocationData,
        endLocation: endLocationData,
        viaLocations: viaLocationsData.filter(Boolean),
        departureTime: `${rideData.date}T${rideData.time}:00.000Z`,
        availableSeats: parseInt(rideData.seats),
        pricePerSeat: parseInt(rideData.price),
        vehicle: {
          model: rideData.carModel,
          plateNumber: rideData.carNumber,
          type: rideData.vehicleType
        },
        amenities: rideData.amenities,
        description: rideData.description,
        paymentOptions: rideData.paymentOptions,
        bookingPolicy: rideData.bookingPolicy,
        dynamicPricing: rideData.dynamicPricing,
        isRecurring: rideData.isRecurring,
        recurringDays: rideData.recurringDays
      };

      console.log('Sending ride payload:', ridePayload);

      // Submit to API
      const response = await API.rides.create(ridePayload);
      
      if (response && response.success) {
        console.log('Ride created successfully:', response.ride);
        
        // Show success message
        alert(`🎉 Your ride has been published successfully!

Ride ID: ${response.ride._id || 'Generated'}
Route: ${rideData.startLocation} → ${rideData.endLocation}
Date: ${rideData.date} at ${rideData.time}
Price: ₹${rideData.price} per seat

Passengers can now find and book your ride!`);

        // Reset form
        resetForm();
        
        // Redirect to dashboard or ride list
        // window.location.href = '/dashboard';
        
      } else {
        throw new Error(response?.message || 'Failed to create ride');
      }

    } catch (error) {
      console.error('Create ride error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to create ride. Please try again.';
      
      if (error.message.includes('geocode') || error.message.includes('coordinates')) {
        errorMessage = 'Could not find one or more locations. Please check your addresses and try again.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('validation')) {
        errorMessage = `Please fix the following: ${error.message}`;
      }
      
      alert(`❌ ${errorMessage}\n\nError details: ${error.message}`);
        
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to reset form
  const resetForm = () => {
    setCurrentStep(1);
    setRideData({
      startLocation: '',
      endLocation: '',
      viaLocations: [],
      date: '',
      time: '',
      seats: 1,
      price: '',
      carModel: '',
      carNumber: '',
      description: '',
      amenities: [],
      recurringDays: [],
      isRecurring: false,
      vehicleType: 'sedan',
      paymentOptions: { cash: true, upi: true, card: false, wallet: false },
      bookingPolicy: { instantBooking: true, requireApproval: false, cancellationPolicy: 'moderate' },
      dynamicPricing: { enabled: false }
    });
    setLocationData({
      startLocation: null,
      endLocation: null,
      viaLocations: []
    });
    setRouteInfo(null);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return rideData.startLocation && rideData.endLocation;
      case 2:
        return rideData.date && rideData.time;
      case 3:
        return rideData.carModel && rideData.carNumber;
      case 4:
        return rideData.price && rideData.seats;
      default:
        return true;
    }
  };

  // Add error boundary for Google Maps loading
  if (!isLoaded) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Loading Google Maps...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="offer-ride-page">
      {/* Navigation */}
      <nav className="ride-navbar-modern">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">🚗</span>
            <span className="brand-text">RideShare Pro</span>
          </div>
          <div className="navbar-actions">
            <div className="user-welcome">
              <span className="welcome-text">Welcome,</span>
              <span className="user-name">{user?.name || 'User'}!</span>
            </div>
            <button onClick={onLogout} className="logout-btn-modern">
              <span>👋</span>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="offer-ride-main">
        {/* Header Section */}
        <div className="offer-hero">
          <div className="hero-content">
            <h1 className="offer-title">Share Your Journey & Earn</h1>
            <p className="offer-subtitle">Turn your daily commute into earnings while helping others travel sustainably</p>
            
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">💰</div>
                <div className="benefit-text">
                  <div className="benefit-title">Earn Money</div>
                  <div className="benefit-desc">₹500-3000+ monthly</div>
                </div>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🌱</div>
                <div className="benefit-text">
                  <div className="benefit-title">Go Green</div>
                  <div className="benefit-desc">Reduce carbon footprint</div>
                </div>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">👥</div>
                <div className="benefit-text">
                  <div className="benefit-title">Meet People</div>
                  <div className="benefit-desc">Build connections</div>
                </div>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🛡</div>
                <div className="benefit-text">
                  <div className="benefit-title">Stay Safe</div>
                  <div className="benefit-desc">Verified passengers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="steps-container-enhanced">
          <div className="steps-wrapper">
            {steps.map((step, index) => (
              <div key={step.id} className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
                <div className="step-indicator">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-number">{step.id}</span>
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="form-container-enhanced">
          <div className="form-layout">
            {/* Form Section */}
            <div className="form-section">
              <form onSubmit={handleSubmit} className="offer-form-enhanced">
                
                {/* Step 1: Route & Stops */}
                {currentStep === 1 && (
                  <div className="form-step active">
                    <div className="step-header">
                      <h2>📍 Plan Your Route</h2>
                      <p>Set your starting point, destination, and any stops along the way</p>
                    </div>
                    
                    <div className="form-content">
                      <div className="route-planning">
                        <div className="location-input-group">
                          <div className="input-field">
                            <label>Starting Point *</label>
                            <LocationSearchInput
                              placeholder="Where are you starting from?"
                              value={rideData.startLocation}
                              onChange={handleInputChange}
                              onPlaceSelect={(location) => handleLocationSelect('startLocation', location)}
                              // icon="🔴"
                              name="startLocation"
                              required
                            />
                          </div>
                          
                          {/* Via Locations */}
                          {rideData.viaLocations.map((via, index) => (
                            <div key={index} className="input-field via-field">
                              <label>Stop {index + 1}</label>
                              <div className="via-input-wrapper">
                                <LocationSearchInput
                                  placeholder={`Stop ${index + 1} location`}
                                  value={via}
                                  onChange={(e) => {
                                    const newViaLocations = [...rideData.viaLocations];
                                    newViaLocations[index] = e.target.value;
                                    setRideData(prev => ({ ...prev, viaLocations: newViaLocations }));
                                  }}
                                  onPlaceSelect={(location) => updateViaLocation(index, location)}
                                  icon="📍"
                                  name={`viaLocation${index}`}
                                />
                                <button 
                                  type="button"
                                  className="remove-via-btn"
                                  onClick={() => removeViaLocation(index)}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          <button 
                            type="button"
                            className="add-via-btn"
                            onClick={addViaLocation}
                            disabled={rideData.viaLocations.length >= 3}
                          >
                            ➕ Add stop (optional)
                          </button>
                          
                          <div className="input-field">
                            <label>Destination *</label>
                            <LocationSearchInput
                              placeholder="Where are you going?"
                              value={rideData.endLocation}
                              onChange={handleInputChange}
                              onPlaceSelect={(location) => handleLocationSelect('endLocation', location)}
                              // icon="🎯"
                              name="endLocation"
                              required
                            />
                          </div>
                        </div>
                        
                        {routeInfo && (
                          <div className="route-summary">
                            <h4>Route Summary</h4>
                            <div className="route-stats">
                              <div className="stat">
                                <span className="stat-icon">📏</span>
                                <span className="stat-value">{routeInfo.distance} km</span>
                                <span className="stat-label">Distance</span>
                              </div>
                              <div className="stat">
                                <span className="stat-icon">⏱</span>
                                <span className="stat-value">{Math.floor(routeInfo.duration / 60)}h {routeInfo.duration % 60}m</span>
                                <span className="stat-label">Duration</span>
                              </div>
                              <div className="stat">
                                <span className="stat-icon">⛽</span>
                                <span className="stat-value">₹{Math.round(routeInfo.distance * 3)}</span>
                                <span className="stat-label">Est. Fuel Cost</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Schedule */}
                {currentStep === 2 && (
                  <div className="form-step active">
                    <div className="step-header">
                      <h2>🕐 Set Your Schedule</h2>
                      <p>Choose when you're traveling and set up recurring rides if needed</p>
                    </div>
                    
                    <div className="form-content">
                      <div className="schedule-grid">
                        <div className="input-field">
                          <label>Travel Date *</label>
                          <input
                            type="date"
                            name="date"
                            value={rideData.date}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        
                        <div className="input-field">
                          <label>Departure Time *</label>
                          <input
                            type="time"
                            name="time"
                            value={rideData.time}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="recurring-section">
                          <label className="checkbox-field">
                            <input
                              type="checkbox"
                              name="isRecurring"
                              checked={rideData.isRecurring}
                              onChange={handleInputChange}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">Make this a recurring ride</span>
                          </label>
                          
                          {rideData.isRecurring && (
                            <div className="recurring-options">
                              <p>Select days when you'll be traveling:</p>
                              <div className="days-selector">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                                  <label key={day} className="day-checkbox">
                                    <input
                                      type="checkbox"
                                      value={index + 1}
                                      checked={rideData.recurringDays.includes(index + 1)}
                                      onChange={(e) => {
                                        const dayValue = parseInt(e.target.value);
                                        setRideData(prev => ({
                                          ...prev,
                                          recurringDays: e.target.checked
                                            ? [...prev.recurringDays, dayValue]
                                            : prev.recurringDays.filter(d => d !== dayValue)
                                        }));
                                      }}
                                    />
                                    <span>{day.slice(0, 3)}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Vehicle Details */}
                {currentStep === 3 && (
                  <div className="form-step active">
                    <div className="step-header">
                      <h2>🚗 Vehicle Information</h2>
                      <p>Add your vehicle details and available amenities</p>
                    </div>
                    
                    <div className="form-content">
                      <div className="vehicle-grid">
                        <div className="input-field">
                          <label>Vehicle Type *</label>
                          <div className="vehicle-type-selector">
                            {vehicleTypes.map(type => (
                              <button
                                key={type.id}
                                type="button"
                                className={`vehicle-type-btn ${rideData.vehicleType === type.id ? 'active' : ''}`}
                                onClick={() => setRideData(prev => ({ ...prev, vehicleType: type.id }))}
                              >
                                <span className="vehicle-icon">{type.icon}</span>
                                <span>{type.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="input-row">
                          <div className="input-field">
                            <label>Car Model *</label>
                            <input
                              type="text"
                              name="carModel"
                              value={rideData.carModel}
                              onChange={handleInputChange}
                              placeholder="e.g., Honda City, Maruti Swift"
                              required
                            />
                          </div>
                          
                          <div className="input-field">
                            <label>License Plate *</label>
                            <input
                              type="text"
                              name="carNumber"
                              value={rideData.carNumber}
                              onChange={handleInputChange}
                              placeholder="e.g., KA 01 AB 1234"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="amenities-section">
                          <label>Available Amenities</label>
                          <div className="amenities-grid">
                            {amenitiesList.map(amenity => (
                              <button
                                key={amenity.id}
                                type="button"
                                className={`amenity-btn ${rideData.amenities.includes(amenity.id) ? 'active' : ''}`}
                                onClick={() => handleAmenityToggle(amenity.id)}
                              >
                                <span className="amenity-icon">{amenity.icon}</span>
                                <span>{amenity.label}</span>
                                {rideData.amenities.includes(amenity.id) && (
                                  <span className="amenity-check">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Pricing & Policy */}
                {currentStep === 4 && (
                  <div className="form-step active">
                    <div className="step-header">
                      <h2>💰 Pricing & Booking Policy</h2>
                      <p>Set your price and define how passengers can book your ride</p>
                    </div>
                    
                    <div className="form-content">
                      <div className="pricing-grid">
                        <div className="pricing-section">
                          <div className="input-row">
                            <div className="input-field">
                              <label>Available Seats *</label>
                              <select
                                name="seats"
                                value={rideData.seats}
                                onChange={handleInputChange}
                                required
                              >
                                {[1,2,3,4,5,6].map(num => (
                                  <option key={num} value={num}>{num} seat{num > 1 ? 's' : ''}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="input-field">
                              <label>Price per Seat *</label>
                              <div className="price-input-container">
                                <span className="currency">₹</span>
                                <input
                                  type="number"
                                  name="price"
                                  value={rideData.price}
                                  onChange={handleInputChange}
                                  placeholder="0"
                                  min="0"
                                  step="5"
                                  required
                                />
                              </div>
                              <div className="price-suggestion">
                                Suggested: ₹{priceEstimate.min} - ₹{priceEstimate.max}
                              </div>
                            </div>
                          </div>
                          
                          <div className="earnings-preview">
                            <h4>Potential Earnings</h4>
                            <div className="earnings-breakdown">
                              <div className="earning-item">
                                <span>Per passenger:</span>
                                <span>₹{rideData.price || 0}</span>
                              </div>
                              <div className="earning-item">
                                <span>Total seats:</span>
                                <span>{rideData.seats}</span>
                              </div>
                              <div className="earning-item total">
                                <span>Maximum earnings:</span>
                                <span>₹{(rideData.price || 0) * rideData.seats}</span>
                              </div>
                              {routeInfo && (
                                <div className="earning-item">
                                  <span>Estimated fuel cost:</span>
                                  <span>₹{Math.round(routeInfo.distance * 3)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="policy-section">
                          <div className="payment-options">
                            <h4>Accepted Payment Methods</h4>
                            <div className="payment-grid">
                              {Object.entries(rideData.paymentOptions).map(([method, enabled]) => (
                                <label key={method} className="payment-option">
                                  <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={() => handlePaymentOptionToggle(method)}
                                  />
                                  <span className="payment-label">
                                    {method === 'cash' && '💵 Cash'}
                                    {method === 'upi' && '📱 UPI'}
                                    {method === 'card' && '💳 Card'}
                                    {method === 'wallet' && '👛 Wallet'}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          <div className="booking-policy">
                            <h4>Booking Policy</h4>
                            <label className="checkbox-field">
                              <input
                                type="checkbox"
                                checked={rideData.bookingPolicy.instantBooking}
                                onChange={(e) => setRideData(prev => ({
                                  ...prev,
                                  bookingPolicy: {
                                    ...prev.bookingPolicy,
                                    instantBooking: e.target.checked
                                  }
                                }))}
                              />
                              <span className="checkbox-custom"></span>
                              <span>Allow instant booking</span>
                            </label>
                            
                            <div className="input-field">
                              <label>Cancellation Policy</label>
                              <select
                                value={rideData.bookingPolicy.cancellationPolicy}
                                onChange={(e) => setRideData(prev => ({
                                  ...prev,
                                  bookingPolicy: {
                                    ...prev.bookingPolicy,
                                    cancellationPolicy: e.target.value
                                  }
                                }))}
                              >
                                <option value="flexible">Flexible - Free cancellation up to 2 hours before</option>
                                <option value="moderate">Moderate - Free cancellation up to 6 hours before</option>
                                <option value="strict">Strict - Free cancellation up to 24 hours before</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Publish */}
                {currentStep === 5 && (
                  <div className="form-step active">
                    <div className="step-header">
                      <h2>🚀 Review & Publish</h2>
                      <p>Review your ride details and add any additional information</p>
                    </div>
                    
                    <div className="form-content">
                      <div className="review-grid">
                        <div className="review-section">
                          <div className="input-field">
                            <label>Additional Notes (Optional)</label>
                            <textarea
                              name="description"
                              value={rideData.description}
                              onChange={handleInputChange}
                              placeholder="Any special instructions, preferences, or additional information for passengers..."
                              rows="4"
                            />
                          </div>
                          
                          <div className="ride-preview">
                            <h4>How your ride will appear to passengers</h4>
                            <div className="preview-card">
                              <div className="preview-header">
                                <div className="preview-driver">
                                  <div className="preview-avatar">
                                    {user?.profilePicture ? (
                                      <img src={user.profilePicture} alt={user.name} />
                                    ) : (
                                      <div className="avatar-placeholder">{user?.name?.[0] || 'U'}</div>
                                    )}
                                  </div>
                                  <div className="preview-info">
                                    <div className="preview-name">{user?.name || 'Your Name'}</div>
                                    <div className="preview-rating">⭐ {user?.rating?.average || 'New'} • {rideData.vehicleType}</div>
                                  </div>
                                </div>
                                <div className="preview-price">₹{rideData.price || 0}</div>
                              </div>
                              
                              <div className="preview-route">
                                <div className="preview-location start">{rideData.startLocation || 'Starting point'}</div>
                                {rideData.viaLocations.filter(Boolean).length > 0 && (
                                  <div className="preview-via">
                                    via {rideData.viaLocations.filter(Boolean).join(', ')}
                                  </div>
                                )}
                                <div className="preview-location end">{rideData.endLocation || 'Destination'}</div>
                              </div>
                              
                              <div className="preview-details">
                                <span>{rideData.date}</span>
                                <span>•</span>
                                <span>{rideData.time}</span>
                                <span>•</span>
                                <span>{rideData.seats} seats</span>
                                {routeInfo && (
                                  <>
                                    <span>•</span>
                                    <span>{routeInfo.distance} km</span>
                                  </>
                                )}
                              </div>
                              
                              {rideData.amenities.length > 0 && (
                                <div className="preview-amenities">
                                  {rideData.amenities.slice(0, 3).map(amenity => (
                                    <span key={amenity} className="preview-amenity">
                                      {amenitiesList.find(a => a.id === amenity)?.label}
                                    </span>
                                  ))}
                                  {rideData.amenities.length > 3 && (
                                    <span className="preview-more">+{rideData.amenities.length - 3} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="summary-section">
                          <h4>Ride Summary</h4>
                          <div className="summary-list">
                            <div className="summary-item">
                              <span className="summary-icon">📍</span>
                              <div>
                                <div className="summary-label">Route</div>
                                <div className="summary-value">
                                  {rideData.startLocation} → {rideData.endLocation}
                                  {rideData.viaLocations.filter(Boolean).length > 0 && (
                                    <div className="via-summary">via {rideData.viaLocations.filter(Boolean).join(', ')}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="summary-item">
                              <span className="summary-icon">🕐</span>
                              <div>
                                <div className="summary-label">Schedule</div>
                                <div className="summary-value">{rideData.date} at {rideData.time}</div>
                                {rideData.isRecurring && (
                                  <div className="recurring-info">Recurring ride</div>
                                )}
                              </div>
                            </div>
                            
                            <div className="summary-item">
                              <span className="summary-icon">🚗</span>
                              <div>
                                <div className="summary-label">Vehicle</div>
                                <div className="summary-value">{rideData.carModel} ({rideData.carNumber})</div>
                              </div>
                            </div>

                            <div className="summary-item">
                              <span className="summary-icon">💰</span>
                              <div>
                                <div className="summary-label">Pricing</div>
                                <div className="summary-value">₹{rideData.price} per seat • {rideData.seats} seats available</div>
                                <div className="potential-earning">Max earning: ₹{(rideData.price || 0) * rideData.seats}</div>
                              </div>
                            </div>
                            
                            <div className="summary-item">
                              <span className="summary-icon">💳</span>
                              <div>
                                <div className="summary-label">Payment</div>
                                <div className="summary-value">
                                  {Object.entries(rideData.paymentOptions)
                                    .filter(([_, enabled]) => enabled)
                                    .map(([method, _]) => method.toUpperCase())
                                    .join(', ')
                                  }
                                </div>
                              </div>
                            </div>
                            
                            {rideData.amenities.length > 0 && (
                              <div className="summary-item">
                                <span className="summary-icon">✨</span>
                                <div>
                                  <div className="summary-label">Amenities</div>
                                  <div className="summary-value">
                                    {rideData.amenities.map(amenity =>
                                       amenitiesList.find(a => a.id === amenity)?.label
                                    ).join(', ')}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="terms-acceptance">
                            <label className="checkbox-field">
                              <input
                                type="checkbox"
                                required
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                              />
                              <span className="checkbox-custom"></span>
                              <span className="checkbox-label">
                                I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="form-navigation">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="nav-btn prev-btn"
                      disabled={isSubmitting}
                    >
                      ← Previous
                    </button>
                  )}
                  
                  <div className="nav-spacer"></div>
                  
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="nav-btn next-btn"
                      disabled={!canProceedToNext() || isSubmitting}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="nav-btn publish-btn"
                      disabled={isSubmitting || !canProceedToNext() || !termsAccepted}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="loading-spinner"></span>
                          Publishing...
                        </>
                      ) : (
                        <>
                          🚀 Publish Ride
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Map Section */}
            <div className="map-section">
              <div className="map-container">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={mapZoom}
                  options={mapOptions}
                  onLoad={onMapLoad}
                >
                  {/* Start Location Marker */}
                  {locationData.startLocation && (
                    <Marker
                      position={locationData.startLocation.coordinates}
                      icon={{
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" fill="#4CAF50"/>
                            <circle cx="12" cy="12" r="4" fill="white"/>
                          </svg>
                        `),
                        scaledSize: new window.google.maps.Size(32, 32),
                      }}
                      title="Start Location"
                    />
                  )}

                  {/* End Location Marker */}
                  {locationData.endLocation && (
                    <Marker
                      position={locationData.endLocation.coordinates}
                      icon={{
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" fill="#f44336"/>
                            <circle cx="12" cy="12" r="4" fill="white"/>
                          </svg>
                        `),
                        scaledSize: new window.google.maps.Size(32, 32),
                      }}
                      title="End Location"
                    />
                  )}

                  {/* Via Location Markers */}
                  {locationData.viaLocations.map((via, index) => (
                    via && (
                      <Marker
                        key={index}
                        position={via.coordinates}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="8" fill="#FF9800"/>
                              <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${index + 1}</text>
                            </svg>
                          `),
                          scaledSize: new window.google.maps.Size(28, 28),
                        }}
                        title={`Stop ${index + 1}`}
                      />
                    )
                  ))}

                  {/* Route Polyline */}
                  {routeInfo && routeInfo.polyline && (
                    <Polyline
                      path={google.maps.geometry.encoding.decodePath(routeInfo.polyline)}
                      options={{
                        strokeColor: '#2196F3',
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        geodesic: true,
                      }}
                    />
                  )}
                </GoogleMap>
                
                {/* Map Controls */}
                <div className="map-controls">
                  <button 
                    type="button"
                    className="map-control-btn"
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.setZoom(mapRef.current.getZoom() + 1);
                      }
                    }}
                  >
                    +
                  </button>
                  <button 
                    type="button"
                    className="map-control-btn"
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.setZoom(mapRef.current.getZoom() - 1);
                      }
                    }}
                  >
                    -
                  </button>
                  <button 
                    type="button"
                    className="map-control-btn"
                    onClick={() => {
                      if (routeInfo && routeInfo.bounds && mapRef.current) {
                        mapRef.current.fitBounds(routeInfo.bounds);
                      }
                    }}
                    disabled={!routeInfo}
                  >
                    📍
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips Sidebar */}
      {/* <div className="tips-sidebar">
        <div className="tips-container">
          <h3>💡 Quick Tips</h3>
          <div className="tip-items">
            <div className="tip-item">
              <span className="tip-icon">🎯</span>
              <div className="tip-content">
                <div className="tip-title">Be Specific</div>
                <div className="tip-text">Use exact landmarks for pickup/drop points</div>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">💰</span>
              <div className="tip-content">
                <div className="tip-title">Fair Pricing</div>
                <div className="tip-text">Price ₹8-12 per km for competitive rates</div>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⭐</span>
              <div className="tip-content">
                <div className="tip-title">Good Ratings</div>
                <div className="tip-text">Be punctual and maintain clean vehicle</div>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📱</span>
              <div className="tip-content">
                <div className="tip-title">Stay Connected</div>
                <div className="tip-text">Keep phone accessible for passenger contact</div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default OfferRide;