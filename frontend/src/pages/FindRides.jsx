import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import API from '../services/api';

const FindRides = () => {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    passengers: 1
  });
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    timeRange: 'any',
    vehicleType: 'any',
    rating: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock rides data for demonstration
  const mockRides = [
    {
      id: 1,
      driver: {
        name: 'Rajesh Kumar',
        rating: 4.8,
        photo: '👨‍💼',
        verified: true,
        rides: 156
      },
      route: {
        from: 'Connaught Place',
        to: 'Gurgaon Cyber City',
        distance: '28 km',
        duration: '45 mins'
      },
      vehicle: {
        type: 'Sedan',
        model: 'Honda City',
        number: 'DL 8C AB 1234',
        color: 'White'
      },
      timing: {
        departure: '08:30 AM',
        arrival: '09:15 AM',
        date: '2024-01-15'
      },
      pricing: {
        total: 150,
        perSeat: 150,
        seats: 3
      },
      amenities: ['AC', 'Music', 'WiFi'],
      preferences: ['No Smoking', 'Pet Friendly']
    },
    {
      id: 2,
      driver: {
        name: 'Priya Sharma',
        rating: 4.9,
        photo: '👩‍💼',
        verified: true,
        rides: 89
      },
      route: {
        from: 'Noida Sector 62',
        to: 'Delhi Karol Bagh',
        distance: '35 km',
        duration: '55 mins'
      },
      vehicle: {
        type: 'Hatchback',
        model: 'Maruti Swift',
        number: 'UP 16 CD 5678',
        color: 'Red'
      },
      timing: {
        departure: '09:00 AM',
        arrival: '09:55 AM',
        date: '2024-01-15'
      },
      pricing: {
        total: 120,
        perSeat: 120,
        seats: 2
      },
      amenities: ['AC', 'Music'],
      preferences: ['No Smoking', 'Ladies Only']
    },
    {
      id: 3,
      driver: {
        name: 'Amit Singh',
        rating: 4.7,
        photo: '👨‍🎓',
        verified: true,
        rides: 234
      },
      route: {
        from: 'Mumbai Andheri',
        to: 'Mumbai BKC',
        distance: '12 km',
        duration: '25 mins'
      },
      vehicle: {
        type: 'SUV',
        model: 'Hyundai Creta',
        number: 'MH 02 EF 9012',
        color: 'Blue'
      },
      timing: {
        departure: '08:45 AM',
        arrival: '09:10 AM',
        date: '2024-01-15'
      },
      pricing: {
        total: 200,
        perSeat: 200,
        seats: 4
      },
      amenities: ['AC', 'Music', 'WiFi', 'Charging'],
      preferences: ['No Smoking', 'Professional']
    }
  ];

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSearchData(prev => ({ ...prev, date: today }));
  }, []);

  const handleSearch = async () => {
    if (!searchData.from || !searchData.to) {
      setError('Please enter both pickup and drop locations');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRides(mockRides);
    } catch (err) {
      setError('Failed to fetch rides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = (rideId) => {
    alert(`Booking ride ${rideId}... This will redirect to booking page.`);
  };

  const filteredRides = rides.filter(ride => {
    const price = ride.pricing.perSeat;
    const rating = ride.driver.rating;
    
    return price >= filters.priceRange[0] && 
           price <= filters.priceRange[1] && 
           rating >= filters.rating;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            Find Your Perfect Ride 🚗
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#666'
          }}>
            Discover affordable rides with verified drivers
          </p>
        </div>

        {/* Search Form */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? 'repeat(5, 1fr) auto' : '1fr',
            gap: '1rem',
            alignItems: 'end'
          }}>
            {/* From */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                From 📍
              </label>
              <input
                type="text"
                placeholder="Pickup location"
                value={searchData.from}
                onChange={(e) => setSearchData({...searchData, from: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* To */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                To 🎯
              </label>
              <input
                type="text"
                placeholder="Drop location"
                value={searchData.to}
                onChange={(e) => setSearchData({...searchData, to: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Date */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Date 📅
              </label>
              <input
                type="date"
                value={searchData.date}
                onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Time */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Time ⏰
              </label>
              <input
                type="time"
                value={searchData.time}
                onChange={(e) => setSearchData({...searchData, time: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Passengers */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Passengers 👥
              </label>
              <select
                value={searchData.passengers}
                onChange={(e) => setSearchData({...searchData, passengers: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  background: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                {[1,2,3,4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                whiteSpace: 'nowrap'
              }}
              className={!loading ? "hover-scale" : ""}
            >
              {loading ? '🔍' : '🚀 Search'}
            </button>
          </div>

          {/* Filters Toggle */}
          <div style={{
            marginTop: '1rem',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: 'none',
                border: '2px solid #667eea',
                color: '#667eea',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style
                e.target.style.color = '#667eea';
              }}
            >
              🔧 {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div style={{
              marginTop: '2rem',
              padding: '2rem',
              background: '#f8f9fa',
              borderRadius: '15px',
              border: '2px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                🎛 Filter Options
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 768 ? 'repeat(4, 1fr)' : '1fr',
                gap: '2rem'
              }}>
                {/* Price Range */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}>
                    💰 Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: [0, parseInt(e.target.value)]
                    })}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#ddd',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Time Range */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}>
                    ⏰ Time Preference
                  </label>
                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="any">Any Time</option>
                    <option value="morning">Morning (6-12)</option>
                    <option value="afternoon">Afternoon (12-18)</option>
                    <option value="evening">Evening (18-24)</option>
                  </select>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}>
                    🚗 Vehicle Type
                  </label>
                  <select
                    value={filters.vehicleType}
                    onChange={(e) => setFilters({...filters, vehicleType: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="any">Any Vehicle</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                  </select>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}>
                    ⭐ Min Rating: {filters.rating}+
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.rating}
                    onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#ddd',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Loading */}
        {loading && <Loading />}

        {/* Results Header */}
        {filteredRides.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            background: 'white',
            padding: '1rem 2rem',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333',
              margin: 0
            }}>
              🎯 Found {filteredRides.length} Ride{filteredRides.length !== 1 ? 's' : ''}
            </h2>
            <div style={{
              fontSize: '0.9rem',
              color: '#666'
            }}>
              Sorted by departure time
            </div>
          </div>
        )}

        {/* Rides List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {filteredRides.map((ride) => (
            <div key={ride.id} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 15px 50px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)';
            }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 768 ? '1fr 2fr 1fr' : '1fr',
                gap: '2rem',
                alignItems: 'center'
              }}>
                {/* Driver Info */}
                <div style={{
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem'
                  }}>
                    {ride.driver.photo}
                  </div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}>
                    {ride.driver.name}
                    {ride.driver.verified && (
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem'
                      }}>
                        ✓
                      </span>
                    )}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#fbbf24' }}>⭐</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>
                      {ride.driver.rating}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                      ({ride.driver.rides} rides)
                    </span>
                  </div>
                  <div style={{
                    background: '#f3f4f6',
                    padding: '0.5rem 1rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    {ride.vehicle.type} • {ride.vehicle.model}
                  </div>
                </div>

                {/* Route & Timing */}
                <div>
                  {/* Route */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '15px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#667eea',
                        marginBottom: '0.25rem'
                      }}>
                        📍 {ride.route.from}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {ride.timing.departure}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      margin: '0 1rem'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '2px',
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        marginBottom: '0.25rem'
                      }}></div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        textAlign: 'center'
                      }}>
                        {ride.route.distance}<br/>{ride.route.duration}
                      </div>
                    </div>
                    
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#10b981',
                        marginBottom: '0.25rem'
                      }}>
                        🎯 {ride.route.to}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {ride.timing.arrival}
                      </div>
                    </div>
                  </div>

                  {/* Amenities & Preferences */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '0.5rem'
                      }}>
                        ✨ Amenities
                      </div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        {ride.amenities.map((amenity, index) => (
                          <span key={index} style={{
                            background: '#e0f2fe',
                            color: '#0891b2',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '0.5rem'
                      }}>
                        🎭 Preferences
                      </div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        {ride.preferences.map((pref, index) => (
                          <span key={index} style={{
                            background: '#f3e8ff',
                            color: '#7c3aed',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Booking */}
                <div style={{
                  textAlign: 'center',
                  borderLeft: window.innerWidth > 768 ? '2px solid #f3f4f6' : 'none',
                  borderTop: window.innerWidth <= 768 ? '2px solid #f3f4f6' : 'none',
                  paddingLeft: window.innerWidth > 768 ? '2rem' : '0',
                  paddingTop: window.innerWidth <= 768 ? '2rem' : '0'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#10b981',
                    marginBottom: '0.5rem'
                  }}>
                    ₹{ride.pricing.perSeat}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '1rem'
                  }}>
                    per seat
                  </div>
                  
                  <div style={{
                    background: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '15px',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Available Seats:</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>
                        {ride.pricing.seats}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Vehicle:</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>
                        {ride.vehicle.color} {ride.vehicle.model}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Number:</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>
                        {ride.vehicle.number}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookRide(ride.id)}
                    style={{
                      width: '100%',
                      padding: '1rem 2rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                      marginBottom: '1rem'
                    }}
                    className="hover-scale"
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                    }}
                  >
                    🚀 Book Now
                  </button>

                  <button
                    style={{
                      width: '100%',
                      padding: '0.75rem 2rem',
                      background: 'transparent',
                      color: '#667eea',
                      border: '2px solid #667eea',
                      borderRadius: '15px',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#667eea';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#667eea';
                    }}
                  >
                    💬 Contact Driver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredRides.length === 0 && rides.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🔍</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem'
            }}>
              No rides match your filters
            </h3>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              marginBottom: '2rem'
            }}>
              Try adjusting your search criteria or filters to find more rides.
            </p>
            <button
              onClick={() => setFilters({
                priceRange: [0, 1000],
                timeRange: 'any',
                vehicleType: 'any',
                rating: 0
              })}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              className="hover-scale"
            >
              🔄 Reset Filters
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && rides.length === 0 && searchData.from && searchData.to && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🚗💨</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem'
            }}>
              No rides found for your route
            </h3>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              marginBottom: '2rem'
            }}>
              Be the first to offer a ride on this route! Create a ride and help others save money.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="hover-scale"
              >
                🚗 Offer a Ride
              </button>
              <button
                onClick={() => {
                  setSearchData({
                    from: '',
                    to: '',
                    date: new Date().toISOString().split('T')[0],
                    time: '',
                    passengers: 1
                  });
                  setRides([]);
                }}
                style={{
                  padding: '1rem 2rem',
                  background: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '15px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#667eea';
                }}
              >
                🔄 Search Again
              </button>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        {rides.length === 0 && !searchData.from && !searchData.to && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            marginTop: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              💡 Quick Tips for Better Results
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
              gap: '2rem'
            }}>
              {[
                {
                  icon: '📍',
                  title: 'Be Specific',
                  desc: 'Include landmarks or area names for better matches'
                },
                {
                  icon: '⏰',
                  title: 'Flexible Timing',
                  desc: 'Consider rides ±30 minutes from your preferred time'
                },
                {
                  icon: '💰',
                  title: 'Fair Pricing',
                  desc: 'Prices are split among passengers for maximum savings'
                }
              ].map((tip, index) => (
                <div key={index} style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  borderRadius: '15px'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    marginBottom: '1rem'
                  }}>
                    {tip.icon}
                  </div>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '0.5rem'
                  }}>
                    {tip.title}
                  </h4>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    lineHeight: '1.5'
                  }}>
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindRides;