import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const OfferRide = ({ user, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [rideData, setRideData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: 1,
    price: '',
    carModel: '',
    carNumber: '',
    pickupPoints: '',
    description: '',
    amenities: [],
    recurringDays: [],
    isRecurring: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState({ min: 80, max: 120 });

  const amenitiesList = [
    { id: 'ac', label: 'Air Conditioning', icon: '❄' },
    { id: 'music', label: 'Music System', icon: '🎵' },
    { id: 'charging', label: 'Phone Charging', icon: '🔌' },
    { id: 'wifi', label: 'WiFi Hotspot', icon: '📶' },
    { id: 'snacks', label: 'Snacks', icon: '🍿' },
    { id: 'water', label: 'Water Bottles', icon: '💧' },
    { id: 'newspapers', label: 'Newspapers', icon: '📰' },
    { id: 'sanitizer', label: 'Hand Sanitizer', icon: '🧴' }
  ];

  const steps = [
    { id: 1, title: 'Route Details', icon: '📍' },
    { id: 2, title: 'Schedule', icon: '🕐' },
    { id: 3, title: 'Vehicle Info', icon: '🚗' },
    { id: 4, title: 'Pricing', icon: '💰' },
    { id: 5, title: 'Preferences', icon: '⚙' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRideData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      alert('🎉 Your ride has been published successfully! Passengers can now find and book your ride.');
      setIsSubmitting(false);
    }, 2000);
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

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '12px'
  };

  return (
    <div className="offer-ride-page">
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
      <div className="offer-ride-main">
        {/* Header Section */}
        <div className="offer-hero">
          <div className="hero-content">
            <h1 className="offer-title">Share Your Ride & Earn Money 🚗</h1>
            <p className="offer-subtitle">Turn your daily commute into earnings while helping others travel sustainably</p>
            
            <div className="benefits-showcase">
              <div className="benefit-card">
                <div className="benefit-icon">💰</div>
                <div className="benefit-text">
                  <div className="benefit-title">Earn Extra Income</div>
                  <div className="benefit-desc">Make ₹500-2000+ monthly</div>
                </div>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🌱</div>
                <div className="benefit-text">
                  <div className="benefit-title">Help Environment</div>
                  <div className="benefit-desc">Reduce carbon footprint</div>
                </div>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">👥</div>
                <div className="benefit-text">
                  <div className="benefit-title">Meet New People</div>
                  <div className="benefit-desc">Build your network</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="steps-container">
          <div className="steps-wrapper">
            {steps.map((step, index) => (
              <div key={step.id} className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
                <div className="step-indicator">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-number">{step.id}</span>
                </div>
                <div className="step-title">{step.title}</div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="form-container">
          <form onSubmit={handleSubmit} className="offer-form-advanced">
            
            {/* Step 1: Route Details */}
            {currentStep === 1 && (
              <div className="form-step active">
                <div className="step-header">
                  <h2>📍 Where are you going?</h2>
                  <p>Tell us about your route to help passengers find you</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-section">
                    <div className="route-input-group">
                      <div className="input-field">
                        <label className="field-label">Starting Point</label>
                        <div className="input-wrapper">
                          <span className="input-icon start-icon">🔴</span>
                          <input
                            type="text"
                            name="from"
                            value={rideData.from}
                            onChange={handleInputChange}
                            placeholder="Enter your starting location"
                            className="route-input"
                            required
                          />
                        </div>
                      </div>

                      <div className="route-connector-visual">
                        <div className="connector-line"></div>
                        <div className="connector-dots">
                          <div className="dot"></div>
                          <div className="dot"></div>
                          <div className="dot"></div>
                        </div>
                      </div>

                      <div className="input-field">
                        <label className="field-label">Destination</label>
                        <div className="input-wrapper">
                          <span className="input-icon end-icon">🎯</span>
                          <input
                            type="text"
                            name="to"
                            value={rideData.to}
                            onChange={handleInputChange}
                            placeholder="Enter your destination"
                            className="route-input"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="input-field">
                      <label className="field-label">Additional Pickup Points <span className="optional">(Optional)</span></label>
                      <input
                        type="text"
                        name="pickupPoints"
                        value={rideData.pickupPoints}
                        onChange={handleInputChange}
                        placeholder="e.g., BTM Layout, Silk Board, Bommanahalli"
                        className="pickup-input"
                      />
                      <div className="field-help">Add places where you can pick up passengers along your route</div>
                    </div>
                  </div>

                  <div className="map-preview-section">
                    <h3>Route Preview</h3>
                    <div className="map-preview-container">
                      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={{ lat: 12.9716, lng: 77.5946 }}
                          zoom={11}
                        >
                        </GoogleMap>
                      </LoadScript>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Schedule */}
            {currentStep === 2 && (
              <div className="form-step active">
                <div className="step-header">
                  <h2>🕐 When are you traveling?</h2>
                  <p>Set your departure time and travel schedule</p>
                </div>

                <div className="form-grid">
                  <div className="datetime-section">
                    <div className="input-row">
                      <div className="input-field">
                        <label className="field-label">Travel Date</label>
                        <input
                          type="date"
                          name="date"
                          value={rideData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="date-input"
                          required
                        />
                      </div>

                      <div className="input-field">
                        <label className="field-label">Departure Time</label>
                        <input
                          type="time"
                          name="time"
                          value={rideData.time}
                          onChange={handleInputChange}
                          className="time-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="recurring-option">
                      <label className="checkbox-field">
                        <input
                          type="checkbox"
                          name="isRecurring"
                          checked={rideData.isRecurring}
                          onChange={handleInputChange}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-label">This is a recurring ride</span>
                      </label>
                      <div className="field-help">Publish multiple rides for regular commutes</div>
                    </div>
                  </div>

                  <div className="schedule-preview">
                    <div className="preview-card">
                      <h4>Schedule Summary</h4>
                      <div className="schedule-details">
                        <div className="schedule-item">
                          <span className="schedule-icon">📅</span>
                          <span>{rideData.date || 'Select date'}</span>
                        </div>
                        <div className="schedule-item">
                          <span className="schedule-icon">⏰</span>
                          <span>{rideData.time || 'Select time'}</span>
                        </div>
                        <div className="schedule-item">
                          <span className="schedule-icon">🔄</span>
                          <span>{rideData.isRecurring ? 'Recurring ride' : 'One-time ride'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Vehicle Info */}
            {currentStep === 3 && (
              <div className="form-step active">
                <div className="step-header">
                  <h2>🚗 Tell us about your vehicle</h2>
                  <p>Vehicle information helps passengers identify you</p>
                </div>

                <div className="form-grid">
                  <div className="vehicle-section">
                    <div className="input-row">
                      <div className="input-field">
                        <label className="field-label">Car Model</label>
                        <input
                          type="text"
                          name="carModel"
                          value={rideData.carModel}
                          onChange={handleInputChange}
                          placeholder="e.g., Honda City, Maruti Swift, Hyundai Creta"
                          className="car-input"
                          required
                        />
                      </div>

                      <div className="input-field">
                        <label className="field-label">License Plate</label>
                        <input
                          type="text"
                          name="carNumber"
                          value={rideData.carNumber}
                          onChange={handleInputChange}
                          placeholder="e.g., KA 01 AB 1234"
                          className="car-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="amenities-section">
                      <label className="field-label">Car Amenities</label>
                      <div className="amenities-grid">
                        {amenitiesList.map((amenity) => (
                          <div
                            key={amenity.id}
                            className={`amenity-option ${rideData.amenities.includes(amenity.id) ? 'selected' : ''}`}
                            onClick={() => handleAmenityToggle(amenity.id)}
                          >
                            <span className="amenity-icon">{amenity.icon}</span>
                            <span className="amenity-label">{amenity.label}</span>
                            {rideData.amenities.includes(amenity.id) && (
                              <span className="amenity-check">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="vehicle-preview">
                    <div className="preview-card">
                      <h4>Vehicle Summary</h4>
                      <div className="vehicle-details">
                        <div className="vehicle-item">
                          <span className="vehicle-icon">🚗</span>
                          <span>{rideData.carModel || 'Enter car model'}</span>
                        </div>
                        <div className="vehicle-item">
                          <span className="vehicle-icon">🔢</span>
                          <span>{rideData.carNumber || 'Enter license plate'}</span>
                        </div>
                        <div className="vehicle-item">
                          <span className="vehicle-icon">✨</span>
                          <span>{rideData.amenities.length} amenities selected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <div className="form-step active">
                <div className="step-header">
                  <h2>💰 Set your price</h2>
                  <p>Price your ride competitively to attract more passengers</p>
                </div>

                <div className="form-grid">
                  <div className="pricing-section">
                    <div className="price-inputs">
                      <div className="input-field">
                        <label className="field-label">Available Seats</label>
                        <select
                          name="seats"
                          value={rideData.seats}
                          onChange={handleInputChange}
                          className="seats-select"
                        >
                          <option value={1}>1 Seat</option>
                          <option value={2}>2 Seats</option>
                          <option value={3}>3 Seats</option>
                          <option value={4}>4 Seats</option>
                        </select>
                      </div>

                      <div className="input-field">
                        <label className="field-label">Price per Seat</label>
                        <div className="price-input-container">
                          <span className="currency-symbol">₹</span>
                          <input
                            type="number"
                            name="price"
                            value={rideData.price}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                            step="5"
                            className="price-input"
                            required
                          />
                        </div>
                        <div className="price-suggestion">
                          Suggested: ₹{priceEstimate.min} - ₹{priceEstimate.max}
                        </div>
                      </div>
                    </div>

                    <div className="earnings-calculator">
                      <h4>Earnings Calculator</h4>
                      <div className="calculator-grid">
                        <div className="calc-item">
                          <span className="calc-label">Per passenger:</span>
                          <span className="calc-value">₹{rideData.price || 0}</span>
                        </div>
                        <div className="calc-item">
                          <span className="calc-label">Total seats:</span>
                          <span className="calc-value">{rideData.seats}</span>
                        </div>
                        <div className="calc-item total">
                          <span className="calc-label">Total earnings:</span>
                          <span className="calc-value">₹{(rideData.price || 0) * rideData.seats}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pricing-tips">
                    <div className="tips-card">
                      <h4>💡 Pricing Tips</h4>
                      <div className="tips-list">
                        <div className="tip-item">
                          <span className="tip-icon">📊</span>
                          <span>Check similar routes for competitive pricing</span>
                        </div>
                        <div className="tip-item">
                          <span className="tip-icon">⏰</span>
                          <span>Peak hours can command higher prices</span>
                        </div>
                        <div className="tip-item">
                          <span className="tip-icon">🎯</span>
                          <span>Lower prices attract more passengers</span>
                        </div>
                        <div className="tip-item">
                          <span className="tip-icon">✨</span>
                          <span>Premium amenities justify higher prices</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Preferences */}
            {currentStep === 5 && (
              <div className="form-step active">
                <div className="step-header">
                  <h2>⚙ Final details</h2>
                  <p>Add any additional information for your passengers</p>
                </div>

                <div className="form-grid">
                  <div className="preferences-section">
                    <div className="input-field">
                      <label className="field-label">Additional Notes <span className="optional">(Optional)</span></label>
                      <textarea
                        name="description"
                        value={rideData.description}
                        onChange={handleInputChange}
                        placeholder="Any special instructions, preferences, or additional information for passengers..."
                        className="description-textarea"
                        rows="6"
                      />
                    </div>

                    <div className="ride-summary-final">
                      <h4>Ride Summary</h4>
                      <div className="summary-grid">
                        <div className="summary-item">
                          <span className="summary-icon">📍</span>
                          <div className="summary-details">
                            <div className="summary-label">Route</div>
                            <div className="summary-value">{rideData.from || 'Start'} → {rideData.to || 'End'}</div>
                          </div>
                        </div>
                        <div className="summary-item">
                          <span className="summary-icon">🕐</span>
                          <div className="summary-details">
                            <div className="summary-label">Schedule</div>
                            <div className="summary-value">{rideData.date} at {rideData.time}</div>
                          </div>
                        </div>
                        <div className="summary-item">
                          <span className="summary-icon">🚗</span>
                          <div className="summary-details">
                            <div className="summary-label">Vehicle</div>
                            <div className="summary-value">{rideData.carModel} ({rideData.carNumber})</div>
                          </div>
                        </div>
                        <div className="summary-item">
                          <span className="summary-icon">💰</span>
                          <div className="summary-details">
                            <div className="summary-label">Pricing</div>
                            <div className="summary-value">₹{rideData.price} × {rideData.seats} seats = ₹{(rideData.price || 0) * rideData.seats}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="final-preview">
                    <div className="preview-card">
                                          <h4>How your ride will appear</h4>
                      <div className="ride-preview-card">
                        <div className="preview-header">
                          <div className="preview-driver">
                            <div className="preview-avatar">👤</div>
                            <div className="preview-info">
                              <div className="preview-name">{user?.name || 'Your Name'}</div>
                              <div className="preview-rating">⭐ New Driver</div>
                            </div>
                          </div>
                          <div className="preview-price">₹{rideData.price || 0}</div>
                        </div>
                        <div className="preview-route">
                          <div className="preview-from">{rideData.from || 'Starting point'}</div>
                          <div className="preview-arrow">→</div>
                          <div className="preview-to">{rideData.to || 'Destination'}</div>
                        </div>
                        <div className="preview-details">
                          <span>{rideData.date}</span> • <span>{rideData.time}</span> • <span>{rideData.seats} seats</span>
                        </div>
                        <div className="preview-amenities">
                          {rideData.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="preview-amenity">{amenity}</span>
                          ))}
                          {rideData.amenities.length > 3 && <span className="preview-more">+{rideData.amenities.length - 3} more</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              <div className="nav-buttons">
                {currentStep > 1 && (
                  <button type="button" onClick={prevStep} className="nav-btn secondary">
                    <span>←</span>
                    Previous
                  </button>
                )}
                
                <div className="nav-spacer"></div>
                
                {currentStep < steps.length ? (
                  <button type="button" onClick={nextStep} className="nav-btn primary">
                    Next
                    <span>→</span>
                  </button>
                ) : (
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="button-spinner"></div>
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Publish Your Ride</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfferRide;