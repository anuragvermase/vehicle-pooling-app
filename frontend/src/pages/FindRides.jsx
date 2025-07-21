import React, { useState, useEffect, useMemo } from 'react';
import FreeMap from '../components/FreeMap';

const FindRides = ({ user, onLogout }) => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1
  });
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: '',
    departureTime: '',
    amenities: [],
    sortBy: 'price'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [favoriteRides, setFavoriteRides] = useState([]);

  // Mock ride data with more variety
  const mockRides = [
    {
      id: 1,
      driver: {
        name: "Rajesh Kumar",
        rating: 4.8,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        phone: "+91 98765 43210",
        verified: true,
        totalRides: 156,
        joinedYear: 2019
      },
      from: "Koramangala",
      to: "Electronic City",
      date: "2024-01-15",
      time: "09:00 AM",
      price: 120,
      originalPrice: 150,
      availableSeats: 3,
      totalSeats: 4,
      carModel: "Honda City",
      carColor: "White",
      carNumber: "KA 01 AB 1234",
      pickupPoints: ["Koramangala 5th Block", "BTM Layout", "Silk Board"],
      amenities: ["AC", "Music", "Phone Charging", "WiFi"],
      estimatedDuration: "45 mins",
      distance: "18 km",
      instantBooking: true,
      driverResponse: "Usually responds in 5 mins"
    },
    {
      id: 2,
      driver: {
        name: "Priya Sharma",
        rating: 4.9,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b602?w=150&h=150&fit=crop&crop=face",
        phone: "+91 87654 32109",
        verified: true,
        totalRides: 203,
        joinedYear: 2018
      },
      from: "Koramangala",
      to: "Electronic City",
      date: "2024-01-15",
      time: "09:15 AM",
      price: 100,
      originalPrice: 120,
      availableSeats: 2,
      totalSeats: 4,
      carModel: "Maruti Swift",
      carColor: "Silver",
      carNumber: "KA 02 CD 5678",
      pickupPoints: ["Koramangala 6th Block", "BTM Layout"],
      amenities: ["AC", "Music", "Phone Charging"],
      estimatedDuration: "50 mins",
      distance: "20 km",
      instantBooking: false,
      driverResponse: "Usually responds in 15 mins"
    },
    {
      id: 3,
      driver: {
        name: "Amit Patel",
        rating: 4.7,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        phone: "+91 76543 21098",
        verified: true,
        totalRides: 89,
        joinedYear: 2020
      },
      from: "Koramangala",
      to: "Electronic City",
      date: "2024-01-15",
      time: "09:30 AM",
      price: 80,
      originalPrice: 100,
      availableSeats: 1,
      totalSeats: 4,
      carModel: "Hyundai i20",
      carColor: "Blue",
      carNumber: "KA 03 EF 9012",
      pickupPoints: ["Koramangala 4th Block"],
      amenities: ["AC", "Music"],
      estimatedDuration: "40 mins",
      distance: "16 km",
      instantBooking: true,
      driverResponse: "Usually responds in 2 mins"
    },
    {
      id: 4,
      driver: {
        name: "Sneha Reddy",
        rating: 4.9,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        phone: "+91 65432 10987",
        verified: true,
        totalRides: 234,
        joinedYear: 2017
      },
      from: "Koramangala",
      to: "Electronic City",
      date: "2024-01-15",
      time: "08:45 AM",
      price: 140,
      originalPrice: 160,
      availableSeats: 2,
      totalSeats: 4,
      carModel: "Toyota Innova",
      carColor: "Black",
      carNumber: "KA 04 GH 3456",
      pickupPoints: ["Koramangala 3rd Block", "Forum Mall", "BTM Layout"],
      amenities: ["AC", "Music", "Phone Charging", "WiFi", "Water Bottle"],
      estimatedDuration: "42 mins",
      distance: "17 km",
      instantBooking: true,
      driverResponse: "Usually responds in 3 mins"
    }
  ];

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

    // Apply price filter
    if (filters.maxPrice) {
      filtered = filtered.filter(ride => ride.price <= parseInt(filters.maxPrice));
    }

    // Apply amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(ride => 
        filters.amenities.every(amenity => ride.amenities.includes(amenity))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.driver.rating - a.driver.rating;
        case 'time':
          return new Date(`${a.date} ${a.time}) - new Date(${b.date} ${b.time}`);
        case 'duration':
          return parseInt(a.estimatedDuration) - parseInt(b.estimatedDuration);
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
    
    // Save to search history
    const newSearch = {
      from: searchData.from,
      to: searchData.to,
      date: searchData.date,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [newSearch, ...searchHistory.filter(
      item => !(item.from === newSearch.from && item.to === newSearch.to)
    )].slice(0, 5);
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    
    setTimeout(() => {
      setRides(mockRides);
      setIsSearching(false);
    }, 1500);
  };

  const swapLocations = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const handleRideSelect = (ride) => {
    setSelectedRide(ride);
  };

  const toggleFavorite = (ride) => {
    const isFavorite = favoriteRides.some(fav => fav.id === ride.id);
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favoriteRides.filter(fav => fav.id !== ride.id);
    } else {
      updatedFavorites = [...favoriteRides, ride];
    }
    
    setFavoriteRides(updatedFavorites);
    localStorage.setItem('favoriteRides', JSON.stringify(updatedFavorites));
  };

  const handleBookRide = (ride) => {
    // Enhanced booking with more details
    const bookingDetails = {
      rideId: ride.id,
      driverName: ride.driver.name,
      from: ride.from,
      to: ride.to,
      date: ride.date,
      time: ride.time,
      price: ride.price,
      passengers: searchData.passengers,
      bookingTime: new Date().toLocaleString()
    };

    alert(`🎉 Booking request sent to ${ride.driver.name}!\n\nBooking Details:\n📍 ${ride.from} → ${ride.to}\n📅 ${ride.date} at ${ride.time}\n💰 ₹${ride.price} per person\n👥 ${searchData.passengers} passenger(s)\n\nYou will receive confirmation shortly on your registered mobile number.`);
    
    // Could integrate with real booking API here
    console.log('Booking Details:', bookingDetails);
  };

  const clearFilters = () => {
    setFilters({
      maxPrice: '',
      departureTime: '',
      amenities: [],
      sortBy: 'price'
    });
  };

  const allAmenities = ['AC', 'Music', 'Phone Charging', 'WiFi', 'Water Bottle', 'Snacks'];

  return (
    <div className="find-ride-page">
      {/* Navigation */}
      <nav className="ride-navbar-modern">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">🚗</span>
            <span className="brand-text">PoolRide</span>
          </div>
          <div className="navbar-actions">
            <div className="user-welcome">
              <span className="welcome-text">Welcome back,</span>
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
        {/* Search Header Section */}
        <div className="search-hero">
          <div className="search-hero-content">
            <h1 className="search-title">Find Your Perfect Ride 🔍</h1>
            <p className="search-subtitle">Connect with verified drivers • Save money • Travel comfortably</p>
            {searchHistory.length > 0 && (
              <div className="search-suggestions">
                <span className="suggestions-label">Recent searches:</span>
                {searchHistory.slice(0, 3).map((search, index) => (
                  <button
                    key={index}
                    className="suggestion-chip"
                    onClick={() => setSearchData(prev => ({
                      ...prev,
                      from: search.from,
                      to: search.to,
                      date: search.date
                    }))}
                  >
                    {search.from} → {search.to}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Form */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form-advanced">
            <div className="search-row">
              <div className="location-group">
                <div className="input-field">
                  <label className="input-label">From</label>
                  <div className="input-wrapper">
                    <span className="input-icon from-icon">🔴</span>
                    <input
                      type="text"
                      name="from"
                      value={searchData.from}
                      onChange={handleInputChange}
                      placeholder="Enter pickup location"
                      className="location-input-modern"
                      required
                    />
                  </div>
                </div>
                <button type="button" className="swap-locations" onClick={swapLocations}>
                  <span>⇅</span>
                </button>
                <div className="input-field">
                  <label className="input-label">To</label>
                  <div className="input-wrapper">
                    <span className="input-icon to-icon">🎯</span>
                    <input
                      type="text"
                      name="to"
                      value={searchData.to}
                      onChange={handleInputChange}
                      placeholder="Enter destination"
                      className="location-input-modern"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="filters-group">
                <div className="input-field">
                  <label className="input-label">Date</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📅</span>
                    <input
                      type="date"
                      name="date"
                      value={searchData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="date-input-modern"
                      required
                    />
                  </div>
                </div>
                <div className="input-field">
                  <label className="input-label">Passengers</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👥</span>
                    <select
                      name="passengers"
                      value={searchData.passengers}
                      onChange={handleInputChange}
                      className="select-modern"
                    >
                      <option value={1}>1 Passenger</option>
                      <option value={2}>2 Passengers</option>
                      <option value={3}>3 Passengers</option>
                      <option value={4}>4 Passengers</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="search-button" disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <div className="button-spinner"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Search Rides</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Advanced Filters */}
        {rides.length > 0 && (
          <div className="filters-section">
            <div className="filters-header">
              <button 
                className={`filters-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>🎛</span>
                <span>Filters & Sort</span>
                <span className={`chevron ${showFilters ? 'up' : 'down'}`}>⌄</span>
              </button>
              {(filters.maxPrice || filters.amenities.length > 0) && (
                <button className="clear-filters" onClick={clearFilters}>
                  <span>✕</span>
                  Clear all
                </button>
              )}
            </div>
            
            {showFilters && (
              <div className="filters-panel">
                <div className="filter-group">
                  <label className="filter-label">Sort by</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="filter-select"
                  >
                    <option value="price">Price: Low to High</option>
                    <option value="rating">Highest Rated</option>
                    <option value="time">Departure Time</option>
                    <option value="duration">Shortest Duration</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Max Price (₹)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Enter max price"
                    className="filter-input"
                    min="0"
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">Amenities</label>
                  <div className="amenities-filter">
                    {allAmenities.map(amenity => (
                      <button
                        key={amenity}
                        className={`amenity-filter-btn ${filters.amenities.includes(amenity) ? 'active' : ''}`}
                        onClick={() => toggleAmenityFilter(amenity)}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {rides.length > 0 && (
          <div className="results-section">
            <div className="results-container-modern">
              {/* Left Panel - Rides List */}
              <div className="rides-panel">
                <div className="rides-header">
                  <h2 className="results-title">
                    Available Rides <span className="results-count">({filteredRides.length})</span>
                  </h2>
                  <div className="results-summary">
                    <span className="price-range">
                      ₹{Math.min(...filteredRides.map(r => r.price))} - ₹{Math.max(...filteredRides.map(r => r.price))}
                    </span>
                  </div>
                </div>

                <div className="rides-list-container">
                  {filteredRides.map((ride) => (
                    <div 
                      key={ride.id}
                      className={`ride-card-premium ${selectedRide?.id === ride.id ? 'selected' : ''}`}
                      onClick={() => handleRideSelect(ride)}
                    >
                      {ride.instantBooking && (
                        <div className="instant-booking-badge">⚡ Instant Booking</div>
                      )}
                      
                      <button 
                        className={`favorite-btn ${favoriteRides.some(fav => fav.id === ride.id) ? 'favorited' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(ride);
                        }}
                      >
                        {favoriteRides.some(fav => fav.id === ride.id) ? '❤' : '🤍'}
                      </button>
                      
                      <div className="ride-card-header">
                        <div className="driver-section">
                          <div className="driver-avatar-container">
                            <img 
                              src={ride.driver.avatar}
                              alt={ride.driver.name}
                              className="driver-avatar-img"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150x150/cccccc/666666?text=User';
                              }}
                            />
                            {ride.driver.verified && (
                              <div className="verified-indicator">✓</div>
                            )}
                          </div>
                          <div className="driver-info">
                            <h3 className="driver-name">{ride.driver.name}</h3>
                            <div className="driver-stats">
                              <span className="rating">⭐ {ride.driver.rating}</span>
                              <span className="separator">•</span>
                              <span className="rides-count">{ride.driver.totalRides} rides</span>
                            </div>
                            <div className="car-info">{ride.carModel} • {ride.carColor}</div>
                            <div className="response-time">{ride.driverResponse}</div>
                          </div>
                        </div>
                        
                        <div className="price-section">
                          <div className="price-main">₹{ride.price}</div>
                          <div className="price-details">
                            {ride.originalPrice > ride.price && (
                              <span className="price-original">₹{ride.originalPrice}</span>
                            )}
                            <span className="price-per">per person</span>
                            {searchData.passengers > 1 && (
                              <div className="total-price">
                                Total: ₹{ride.price * searchData.passengers}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="route-section">
                        <div className="route-timeline">
                          <div className="route-point start-point">
                            <div className="point-indicator"></div>
                            <div className="point-details">
                              <div className="location">{ride.from}</div>
                              <div className="time">{ride.time}</div>
                            </div>
                          </div>
                          
                          <div className="route-path">
                            <div className="path-line"></div>
                            <div className="travel-info">
                              <span>{ride.estimatedDuration}</span>
                              <span>•</span>
                              <span>{ride.distance}</span>
                            </div>
                          </div>
                          
                          <div className="route-point end-point">
                            <div className="point-indicator"></div>
                            <div className="point-details">
                              <div className="location">{ride.to}</div>
                              <div className="estimated-time">
                                {new Date(new Date(`${ride.date} ${ride.time}`).getTime() + 45*60000)
                                  .toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ride-meta">
                        <div className="meta-item">
                          <span className="meta-icon">🚗</span>
                          <span>{ride.carNumber}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">👥</span>
                          <span>{ride.availableSeats}/{ride.totalSeats} seats available</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">📍</span>
                          <span>{ride.pickupPoints.length} pickup points</span>
                        </div>
                      </div>

                      <div className="amenities-section">
                        {ride.amenities.map((amenity, index) => (
                          <span key={index} className="amenity-chip">{amenity}</span>
                        ))}
                      </div>

                      <div className="pickup-points-preview">
                        <div className="pickup-header">
                          <span className="pickup-icon">📍</span>
                          <span>Pickup Points:</span>
                        </div>
                        <div className="pickup-list">
                          {ride.pickupPoints.slice(0, 2).map((point, index) => (
                            <span key={index} className="pickup-point">{point}</span>
                          ))}
                          {ride.pickupPoints.length > 2 && (
                            <span className="pickup-more">+{ride.pickupPoints.length - 2} more</span>
                          )}
                        </div>
                      </div>

                      <div className="ride-actions">
                        <button 
                          className="action-btn secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${ride.driver.phone}`, '_self');
                          }}
                        >
                          <span>📞</span>
                          Contact Driver
                        </button>
                        <button 
                          className="action-btn primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookRide(ride);
                          }}
                          disabled={ride.availableSeats < searchData.passengers}
                        >
                          <span>🎫</span>
                          {ride.availableSeats < searchData.passengers ? 'Not enough seats' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredRides.length === 0 && rides.length > 0 && (
                    <div className="no-filtered-results">
                      <div className="no-results-content">
                        <div className="no-results-illustration">🔍</div>
                        <h3>No rides match your filters</h3>
                        <p>Try adjusting your filters to see more options</p>
                        <button className="clear-filters-btn" onClick={clearFilters}>
                          Clear all filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Map */}
              <div className="map-panel">
                <div className="map-container-modern">
                  <FreeMap rides={filteredRides} selectedRide={selectedRide}/>
                </div>
                {selectedRide && (
                  <div className="selected-ride-panel">
                    <div className="panel-header">
                      <h4>Selected Ride</h4>
                      <button 
                        className="close-panel"
                        onClick={() => setSelectedRide(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="panel-content">
                      <div className="selected-driver">
                        <img 
                          src={selectedRide.driver.avatar}
                          alt={selectedRide.driver.name}
                          className="selected-avatar"
                        />
                        <div>
                          <div className="selected-name">{selectedRide.driver.name}</div>
                          <div className="selected-car">{selectedRide.carModel}</div>
                          <div className="selected-rating">⭐ {selectedRide.driver.rating}</div>
                        </div>
                      </div>
                      <div className="selected-details">
                        <div className="detail-row">
                          <span>💰 Price:</span>
                          <span>₹{selectedRide.price}</span>
                        </div>
                        <div className="detail-row">
                          <span>⏰ Time:</span>
                          <span>{selectedRide.time}</span>
                        </div>
                        <div className="detail-row">
                          <span>👥 Seats:</span>
                          <span>{selectedRide.availableSeats} available</span>
                        </div>
                        <div className="detail-row">
                          <span>🚗 Duration:</span>
                          <span>{selectedRide.estimatedDuration}</span>
                        </div>
                        {searchData.passengers > 1 && (
                          <div className="detail-row total-cost">
                            <span>💳 Total Cost:</span>
                            <span>₹{selectedRide.price * searchData.passengers}</span>
                          </div>
                        )}
                      </div>
                      <div className="selected-amenities">
                        {selectedRide.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="selected-amenity">{amenity}</span>
                        ))}
                      </div>
                      <div className="selected-actions">
                        <button 
                          className="contact-selected-btn"
                          onClick={() => window.open(`tel:${selectedRide.driver.phone}`, '_self')}
                        >
                          📞 Call Driver
                        </button>
                        <button 
                          className="book-selected-btn"
                          onClick={() => handleBookRide(selectedRide)}
                          disabled={selectedRide.availableSeats < searchData.passengers}
                        >
                          🎫 Book This Ride
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {rides.length === 0 && !isSearching && (
          <div className="no-results-state">
            <div className="no-results-content">
              <div className="no-results-illustration">🔍</div>
              <h3>Ready to find your perfect ride?</h3>
              <p>Enter your pickup and destination to discover available rides in your area</p>
              <div className="search-tips">
                <div className="tip">💡 Try searching for popular routes like Koram
                  angala to Electronic City</div>
                <div className="tip">🕐 Book in advance for better availability</div>
                <div className="tip">💰 Compare prices and choose what suits your budget</div>
                <div className="tip">⭐ Check driver ratings and reviews for a better experience</div>
              </div>
              
              {searchHistory.length > 0 && (
                <div className="quick-search-section">
                  <h4>Quick Search</h4>
                  <div className="quick-search-buttons">
                    {searchHistory.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        className="quick-search-btn"
                        onClick={() => {
                          setSearchData(prev => ({
                            ...prev,
                            from: search.from,
                            to: search.to,
                            date: new Date().toISOString().split('T')[0]
                          }));
                        }}
                      >
                        <span className="route-text">{search.from} → {search.to}</span>
                        <span className="search-icon">🔄</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {favoriteRides.length > 0 && (
                <div className="favorite-routes-section">
                  <h4>Your Favorite Routes</h4>
                  <div className="favorite-routes">
                    {favoriteRides.slice(0, 3).map((ride, index) => (
                      <div key={index} className="favorite-route-card">
                        <div className="favorite-route-info">
                          <span className="favorite-route">{ride.from} → {ride.to}</span>
                          <span className="favorite-driver">{ride.driver.name}</span>
                        </div>
                        <button
                          className="search-favorite-btn"
                          onClick={() => {
                            setSearchData(prev => ({
                              ...prev,
                              from: ride.from,
                              to: ride.to,
                              date: new Date().toISOString().split('T')[0]
                            }));
                          }}
                        >
                          Search Again
                        </button>
                      </div>
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
              <div className="loading-spinner"></div>
              <h3>Finding the best rides for you...</h3>
              <p>We're searching through hundreds of available rides</p>
              <div className="loading-steps">
                <div className="loading-step active">
                  <span className="step-icon">🔍</span>
                  <span>Searching rides</span>
                </div>
                <div className="loading-step">
                  <span className="step-icon">⭐</span>
                  <span>Checking ratings</span>
                </div>
                <div className="loading-step">
                  <span className="step-icon">💰</span>
                  <span>Comparing prices</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="quick-actions">
        {rides.length > 0 && (
          <button 
            className="quick-action-btn filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>🎛</span>
            <span>Filters</span>
          </button>
        )}
        
        {favoriteRides.length > 0 && (
          <button className="quick-action-btn favorites-btn">
            <span>❤</span>
            <span>{favoriteRides.length}</span>
          </button>
        )}
        
        <button 
          className="quick-action-btn refresh-btn"
          onClick={() => {
            if (rides.length > 0) {
              setIsSearching(true);
              setTimeout(() => {
                setRides([...mockRides].sort(() => Math.random() - 0.5));
                setIsSearching(false);
              }, 1000);
            }
          }}
          disabled={rides.length === 0}
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Toast notifications could be added here */}
      <div id="toast-container" className="toast-container"></div>
    </div>
  );
};

export default FindRides;