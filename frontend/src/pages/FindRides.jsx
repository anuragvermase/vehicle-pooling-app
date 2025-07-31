import React, { useState, useEffect, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import EnhancedMap from '../components/maps/EnhancedMap';
import LocationSearchInput from '../components/maps/LocationSearchInput';
import API from '../services/api';
import useWebSocket from '../hooks/useWebSockets';

const libraries = ['places', 'geometry'];

const FindRides = ({ user, onLogout }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    via: '',
    date: '',
    passengers: 1
  });
  
  const [locationData, setLocationData] = useState({
    from: null,
    to: null,
    via: null
  });

  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: '',
    minRating: '',
    vehicleType: '',
    amenities: [],
    instantBooking: false,
    sortBy: 'price'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [favoriteRides, setFavoriteRides] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });

  const { socket, notifications, removeNotification } = useWebSocket(
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', 
    user
  );

  // Load saved data on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    const savedFavorites = localStorage.getItem('favoriteRides');
    
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    if (savedFavorites) {
      setFavoriteRides(JSON.parse(savedFavorites));
    }
  }, []);

  // Filtered and sorted rides
  const filteredRides = useMemo(() => {
    let filtered = [...rides];
    
    // Apply filters
    if (filters.maxPrice) {
      filtered = filtered.filter(ride => (ride.currentPrice || ride.pricePerSeat) <= parseInt(filters.maxPrice));
    }
    
    if (filters.minRating) {
      filtered = filtered.filter(ride => ride.driver.rating.average >= parseFloat(filters.minRating));
    }
    
    if (filters.vehicleType) {
      filtered = filtered.filter(ride => ride.vehicle.type === filters.vehicleType);
    }
    
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(ride =>
        filters.amenities.every(amenity => ride.vehicle.amenities.includes(amenity))
      );
    }
    
    if (filters.instantBooking) {
      filtered = filtered.filter(ride => ride.bookingPolicy.instantBooking);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return (a.currentPrice || a.pricePerSeat) - (b.currentPrice || b.pricePerSeat);
        case 'rating':
          return b.driver.rating.average - a.driver.rating.average;
        case 'time':
          return new Date(a.departureTime) - new Date(b.departureTime);
        case 'duration':
          return a.duration - b.duration;
        case 'distance':
          return a.distance - b.distance;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [rides, filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (locationType, location) => {
    setLocationData(prev => ({
      ...prev,
      [locationType]: location
    }));
    
    setSearchData(prev => ({
      ...prev,
      [locationType]: location.name
    }));

    // Update map center to the selected location
    if (locationType === 'from' && location.coordinates) {
      setMapCenter(location.coordinates);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleAmenityFilter = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      const searchParams = {
        from: searchData.from,
        to: searchData.to,
        via: searchData.via,
        date: searchData.date,
        passengers: searchData.passengers,
        radius: 10
      };

      const response = await API.rides.search(searchParams);
      
      if (response.success) {
        setRides(response.rides);
        
        // Save to search history
        const newSearch = {
          from: searchData.from,
          to: searchData.to,
          via: searchData.via,
          date: searchData.date,
          timestamp: new Date().toISOString()
        };
        
        const updatedHistory = [newSearch, ...searchHistory.filter(
          item => !(item.from === newSearch.from && item.to === newSearch.to)
        )].slice(0, 5);
        
        setSearchHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookRide = async (ride) => {
    if (!ride.canBook) {
      alert('This ride cannot be booked. Not enough seats available.');
      return;
    }

    try {
      const bookingData = {
        seatsToBook: searchData.passengers,
        pickupLocation: locationData.from,
        dropoffLocation: locationData.to || locationData.via,
        paymentMethod: 'cash'
      };

      const response = await API.rides.book(ride._id, bookingData);
      
      if (response.success) {
        alert(`🎉 Booking confirmed!\n\nBooking ID: ${response.booking._id}\nDriver: ${ride.driver.name}\nRoute: ${ride.startLocation.name} → ${ride.endLocation.name}\nDeparture: ${new Date(ride.departureTime).toLocaleString()}\nTotal: ₹${response.booking.totalAmount}`);
        
        // Remove the ride from available rides or update seats
        setRides(prev => prev.map(r => 
          r._id === ride._id 
            ? { ...r, availableSeats: r.availableSeats - searchData.passengers }
            : r
        ));
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    }
  };

  const swapLocations = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
    
    setLocationData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const addViaLocation = () => {
    if (searchData.via) {
      alert('Via location already set. Clear it first to add a new one.');
    }
  };

  const clearViaLocation = () => {
    setSearchData(prev => ({ ...prev, via: '' }));
    setLocationData(prev => ({ ...prev, via: null }));
  };

  const allAmenities = ['ac', 'music', 'charging', 'wifi', 'water', 'snacks', 'sanitizer', 'newspapers'];
  const vehicleTypes = ['sedan', 'hatchback', 'suv', 'luxury', 'electric'];

  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <div className="find-ride-page">
      {/* Navigation */}
      <nav className="ride-navbar-modern">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">🚗</span>
            <span className="brand-text">RideShare Pro</span>
          </div>
          <div className="navbar-actions">
            <div className="notification-badge" onClick={() => console.log('Show notifications')}>
              {notifications.length > 0 && (
                <span className="badge-count">{notifications.length}</span>
              )}
              <span>🔔</span>
            </div>
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
      <div className="find-ride-main">
        {/* Search Header */}
        <div className="search-hero">
          <div className="search-hero-content">
            <h1 className="search-title">Find Your Perfect Ride 🔍</h1>
            <p className="search-subtitle">Real-time rides • Google Maps integration • Secure bookings</p>
          </div>
        </div>

        {/* Enhanced Search Form */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form-enhanced">
            <div className="search-locations">
              <div className="location-inputs">
                <LocationSearchInput
                  placeholder="From where?"
                  value={searchData.from}
                  onChange={handleInputChange}
                  onPlaceSelect={(location) => handleLocationSelect('from', location)}
                  icon="🔴"
                  className="from-input"
                  name="from"
                  required
                />
                
                <button type="button" className="swap-btn" onClick={swapLocations}>
                  ⇅
                </button>
                
                <LocationSearchInput
                  placeholder="Where to?"
                  value={searchData.to}
                  onChange={handleInputChange}
                  onPlaceSelect={(location) => handleLocationSelect('to', location)}
                  icon="🎯"
                  className="to-input"
                  name="to"
                  required
                />
              </div>
              
              {/* Via Location */}
              <div className="via-location-container">
                {!searchData.via ? (
                  <button 
                    type="button" 
                    className="add-via-btn"
                    onClick={addViaLocation}
                  >
                    ➕ Add stop along the way
                  </button>
                ) : (
                  <div className="via-input-container">
                    <LocationSearchInput
                      placeholder="Stop along the way"
                      value={searchData.via}
                      onChange={handleInputChange}
                      onPlaceSelect={(location) => handleLocationSelect('via', location)}
                      icon="📍"
                      className="via-input"
                      name="via"
                    />
                    <button 
                      type="button" 
                      className="remove-via-btn"
                      onClick={clearViaLocation}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="search-filters">
              <div className="filter-row">
                <div className="input-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={searchData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label>Passengers</label>
                  <select
                    name="passengers"
                    value={searchData.passengers}
                    onChange={handleInputChange}
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="search-btn-enhanced" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <div className="spinner"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      🔍 Search Rides
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Advanced Filters */}
        {rides.length > 0 && (
          <div className="filters-section-enhanced">
            <div className="filters-header">
              <button 
                className={`filters-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                🎛 Advanced Filters ({Object.values(filters).filter(v => v && v !== 'price' && (!Array.isArray(v) || v.length > 0)).length})
              </button>
              
              <div className="results-info">
                <span>{filteredRides.length} rides found</span>
              </div>
            </div>
            
            {showFilters && (
              <div className="filters-panel-enhanced">
                <div className="filter-group">
                  <label>Sort by</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="price">Price: Low to High</option>
                    <option value="rating">Highest Rated</option>
                    <option value="time">Departure Time</option>
                    <option value="duration">Shortest Duration</option>
                    <option value="distance">Shortest Distance</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Max Price (₹)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Any price"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  >
                    <option value="">Any rating</option>
                    <option value="4.5">4.5+ stars</option>
                    <option value="4.0">4.0+ stars</option>
                    <option value="3.5">3.5+ stars</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Vehicle Type</label>
                  <select
                    value={filters.vehicleType}
                    onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                  >
                    <option value="">Any vehicle</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Amenities</label>
                  <div className="amenities-filter-grid">
                    {allAmenities.map(amenity => (
                      <button
                        key={amenity}
                        type="button"
                        className={`amenity-filter-chip ${filters.amenities.includes(amenity) ? 'active' : ''}`}
                        onClick={() => toggleAmenityFilter(amenity)}
                      >
                        {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="filter-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.instantBooking}
                      onChange={(e) => handleFilterChange('instantBooking', e.target.checked)}
                    />
                    <span>Instant booking only</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {rides.length > 0 && (
          <div className="results-section-enhanced">
            {/* Rides List */}
            <div className="rides-panel-enhanced">
              <div className="rides-header">
                <h2>Available Rides ({filteredRides.length})</h2>
              </div>
              
              <div className="rides-list">
                {filteredRides.map((ride) => (
                  <div 
                    key={ride._id}
                    className={`ride-card-enhanced ${selectedRide?._id === ride._id ? 'selected' : ''}`}
                    onClick={() => setSelectedRide(ride)}
                  >
                    {/* Ride Card Content */}
                    <div className="ride-card-header">
                      <div className="driver-info">
                        <div className="driver-avatar">
                          <img 
                            src={ride.driver.profilePicture || `https://ui-avatars.com/api/?name=${ride.driver.name}&background=4F46E5&color=fff`}
                            alt={ride.driver.name}
                          />
                          <div className="driver-verified">✓</div>
                        </div>
                        <div className="driver-details">
                          <h4>{ride.driver.name}</h4>
                          <div className="driver-rating">
                            ⭐ {ride.driver.rating.average.toFixed(1)} ({ride.driver.rating.count})
                          </div>
                          <div className="driver-stats">
                            {ride.driver.stats.totalRidesOffered} rides
                          </div>
                        </div>
                      </div>
                      
                      <div className="price-info">
                        <div className="current-price">₹{ride.currentPrice}</div>
                        {ride.dynamicPricing?.enabled && ride.dynamicPricing.currentMultiplier > 1 && (
                          <div className="surge-info">
                            <span className="surge-badge">⚡ Surge {ride.dynamicPricing.currentMultiplier}x</span>
                          </div>
                        )}
                        <div className="price-per">per person</div>
                        {searchData.passengers > 1 && (
                          <div className="total-price">Total: ₹{ride.currentPrice * searchData.passengers}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ride-route">
                      <div className="route-timeline">
                        <div className="route-point">
                          <div className="point-dot start"></div>
                          <div className="point-info">
                            <div className="location">{ride.startLocation.name}</div>
                            <div className="time">{new Date(ride.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                        
                        {ride.viaLocations?.length > 0 && (
                          <div className="via-points">
                            {ride.viaLocations.map((via, index) => (
                              <div key={index} className="route-point via">
                                <div className="point-dot via"></div>
                                <div className="point-info">
                                  <div className="location">{via.name}</div>
                                  <div className="via-label">Stop {index + 1}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="route-point">
                          <div className="point-dot end"></div>
                          <div className="point-info">
                            <div className="location">{ride.endLocation.name}</div>
                            <div className="time">
                              {new Date(new Date(ride.departureTime).getTime() + ride.duration * 60000)
                                .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="route-details">
                        <span>{ride.distance} km</span>
                        <span>•</span>
                        <span>{Math.floor(ride.duration / 60)}h {ride.duration % 60}m</span>
                      </div>
                    </div>
                    
                    <div className="ride-details">
                      <div className="vehicle-info">
                        <span className="vehicle-icon">🚗</span>
                        <span>{ride.vehicle.model} ({ride.vehicle.color})</span>
                        <span className="plate-number">{ride.vehicle.plateNumber}</span>
                      </div>
                      
                      <div className="availability-info">
                        <span className="seats-icon">👥</span>
                        <span>{ride.availableSeats}/{ride.totalSeats} seats</span>
                        {ride.bookingPolicy.instantBooking && (
                          <span className="instant-badge">⚡ Instant</span>
                        )}
                      </div>
                    </div>
                    
                    {ride.vehicle.amenities?.length > 0 && (
                      <div className="amenities-list">
                        {ride.vehicle.amenities.slice(0, 4).map((amenity, index) => (
                          <span key={index} className="amenity-tag">{amenity}</span>
                        ))}
                        {ride.vehicle.amenities.length > 4 && (
                          <span className="amenity-more">+{ride.vehicle.amenities.length - 4} more</span>
                        )}
                      </div>
                    )}
                    
                    <div className="ride-actions">
                      <button 
                        className="contact-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${ride.driver.phone}`);
                        }}
                      >
                        📞 Contact
                      </button>
                      
                      <button 
                        className="book-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookRide(ride);
                        }}
                        disabled={!ride.canBook}
                      >
                        {ride.canBook ? '🎫 Book Now' : 'Not Available'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Map Panel */}
            <div className="map-panel-enhanced">
              <EnhancedMap
                rides={filteredRides}
                selectedRide={selectedRide}
                onRideSelect={setSelectedRide}
                center={mapCenter}
                origin={locationData.from?.coordinates}
                destination={locationData.to?.coordinates}
                viaPoints={locationData.via ? [locationData.via.coordinates] : []}
                showDirections={!!(locationData.from && locationData.to)}
              />
            </div>
          </div>
        )}

        {/* No Results State */}
        {rides.length === 0 && !isSearching && (
          <div className="no-results-state">
            <div className="no-results-content">
              <div className="no-results-illustration">🔍</div>
              <h3>Ready to find your perfect ride?</h3>
              <p>Enter your pickup and destination to discover available rides</p>
              
              {searchHistory.length > 0 && (
                <div className="recent-searches">
                  <h4>Recent Searches</h4>
                  <div className="search-history-grid">
                    {searchHistory.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        className="history-item"
                        onClick={() => {
                          setSearchData(prev => ({
                            ...prev,
                            from: search.from,
                            to: search.to,
                            via: search.via || '',
                            date: new Date().toISOString().split('T')[0]
                          }));
                        }}
                      >
                        <div className="history-route">
                          {search.from} → {search.to}
                          {search.via && <span className="via-indicator">via {search.via}</span>}
                        </div>
                        <span className="history-icon">🔄</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="loading-state">
            <div className="loading-content">
              <div className="loading-spinner-large"></div>
              <h3>Finding the best rides for you...</h3>
              <p>Searching through real-time data with Google Maps integration</p>
              <div className="loading-progress">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <div className="loading-steps">
                  <span className="step active">🔍 Searching routes</span>
                  <span className="step">📍 Checking locations</span>
                  <span className="step">💰 Comparing prices</span>
                  <span className="step">⭐ Filtering by rating</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map((notification) => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              <button 
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindRides;