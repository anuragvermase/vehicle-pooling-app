import React, { useState } from 'react';
import FreeMap from '../components/FreeMap';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';

const FindRide = ({ user, onLogout }) => {
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
    amenities: []
  });

  // Mock ride data
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
      instantBooking: true
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
      instantBooking: false
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
      instantBooking: true
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    setTimeout(() => {
      setRides(mockRides);
      setIsSearching(false);
    }, 1500);
  };

  const handleRideSelect = (ride) => {
    setSelectedRide(ride);
  };

  const handleBookRide = (ride) => {
    alert(`🎉 Booking request sent to ${ride.driver.name}! You will receive confirmation shortly.`);
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '12px'
  };

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

                <button type="button" className="swap-locations">
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

        {/* Results Section */}
        {rides.length > 0 && (
          <div className="results-section">
            <div className="results-container-modern">
              {/* Left Panel - Rides List */}
              <div className="rides-panel">
                <div className="rides-header">
                  <h2 className="results-title">
                    Available Rides <span className="results-count">({rides.length})</span>
                  </h2>
                  <div className="sort-filter-controls">
                    <select className="sort-dropdown">
                      <option value="price">Price: Low to High</option>
                      <option value="time">Departure Time</option>
                      <option value="rating">Highest Rated</option>
                      <option value="duration">Shortest Duration</option>
                    </select>
                  </div>
                </div>

                <div className="rides-list-container">
                  {rides.map((ride) => (
                    <div 
                      key={ride.id} 
                      className={`ride-card-premium ${selectedRide?.id === ride.id ? 'selected' : ''}`}
                      onClick={() => handleRideSelect(ride)}
                    >
                      {ride.instantBooking && (
                        <div className="instant-booking-badge">⚡ Instant Booking</div>
                      )}
                      
                      <div className="ride-card-header">
                        <div className="driver-section">
                          <div className="driver-avatar-container">
                            <img 
                              src={ride.driver.avatar} 
                              alt={ride.driver.name}
                              className="driver-avatar-img"
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
                          </div>
                        </div>
                        
                        <div className="price-section">
                          <div className="price-main">₹{ride.price}</div>
                          <div className="price-details">
                            {ride.originalPrice > ride.price && (
                              <span className="price-original">₹{ride.originalPrice}</span>
                            )}
                            <span className="price-per">per person</span>
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

                      <div className="ride-actions">
                        <button className="action-btn secondary">
                          <span>📞</span>
                          Contact Driver
                        </button>
                        <button 
                          className="action-btn primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookRide(ride);
                          }}
                        >
                          <span>🎫</span>
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel - Map */}
              <div className="map-panel">
                <div className="map-container-modern">
                  <FreeMap rides={rides} selectedRide={selectedRide}/>
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
                      </div>
                      <button 
                        className="book-selected-btn"
                        onClick={() => handleBookRide(selectedRide)}
                      >
                        Book This Ride
                      </button>
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
                <div className="tip">💡 Try searching for popular routes like Koramangala to Electronic City</div>
                <div className="tip">🕐 Book in advance for better availability</div>
                <div className="tip">💰 Compare prices and choose what suits your budget</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindRide;