import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';

const OfferRides = () => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: 1,
    price: '',
    vehicle: {
      type: '',
      model: '',
      number: '',
      color: ''
    },
    amenities: [],
    preferences: [],
    description: '',
    recurring: false,
    recurringDays: []
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const vehicleTypes = ['Hatchback', 'Sedan', 'SUV', 'MUV'];
  const availableAmenities = ['AC', 'Music', 'WiFi', 'Charging Port', 'Water', 'Snacks'];
  const availablePreferences = ['No Smoking', 'Pet Friendly', 'Ladies Only', 'Professional Only', 'Students Only'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return formData.from && formData.to && formData.date && formData.time;
      case 2:
        return formData.vehicle.type && formData.vehicle.model && formData.seats && formData.price;
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('🎉 Your ride has been posted successfully! You will be notified when someone books it.');
      
      // Reset form
      setFormData({
        from: '',
        to: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        seats: 1,
        price: '',
        vehicle: {
          type: '',
          model: '',
          number: '',
          color: ''
        },
        amenities: [],
        preferences: [],
        description: '',
        recurring: false,
        recurringDays: []
      });
      setStep(1);
    } catch (err) {
      setError('Failed to post ride. Please try again.');
    } finally {
      setLoading(false);
      }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  if (loading) return <Loading />;

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🎉</div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#10b981',
            marginBottom: '1rem'
          }}>
            Ride Posted Successfully!
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            {success}
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setSuccess('')}
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
              🚗 Post Another Ride
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
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
              📊 View Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem 0'
    }}>
      <div style={{
        maxWidth: '800px',
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
            Offer a Ride 🚗
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#666'
          }}>
            Share your journey and earn money while helping others
          </p>
        </div>

        {/* Progress Indicator */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: step >= stepNumber ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e5e7eb',
                  color: step >= stepNumber ? 'white' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div style={{
                    flex: 1,
                    height: '4px',
                    background: step > stepNumber ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e5e7eb',
                    margin: '0 1rem',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease'
                  }}></div>
                )}
              </div>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            color: '#666',
            fontWeight: '500'
          }}>
            <span style={{ color: step >= 1 ? '#667eea' : '#9ca3af' }}>Route & Time</span>
            <span style={{ color: step >= 2 ? '#667eea' : '#9ca3af' }}>Vehicle & Pricing</span>
            <span style={{ color: step >= 3 ? '#667eea' : '#9ca3af' }}>Preferences</span>
          </div>
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

        {/* Form */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Step 1: Route & Time */}
            {step === 1 && (
              <div>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '2rem',
                  textAlign: 'center'
                }}>
                  🗺 Route & Timing Details
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
                  gap: '2rem',
                  marginBottom: '2rem'
                }}>
                  {/* From */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      📍 From (Pickup Location) *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      value={formData.from}
                      onChange={(e) => handleInputChange('from', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      required
                    />
                  </div>

                  {/* To */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      🎯 To (Drop Location) *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter drop location"
                      value={formData.to}
                      onChange={(e) => handleInputChange('to', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      required
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      📅 Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      required
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      ⏰ Departure Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      required
                    />
                  </div>
                </div>

                {/* Recurring Ride Option */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '2rem',
                  borderRadius: '15px',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={formData.recurring}
                      onChange={(e) => handleInputChange('recurring', e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                    <label htmlFor="recurring" style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#333',
                      cursor: 'pointer'
                    }}>
                      🔄 Make this a recurring ride
                    </label>
                  </div>
                  
                  {formData.recurring && (
                    <div>
                      <p style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '1rem'
                      }}>
                        Select the days when you want to offer this ride:
                      </p>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '0.5rem'
                      }}>
                        {weekDays.map((day) => (
                          <label key={day} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            background: formData.recurringDays.includes(day) ? '#667eea' : 'white',
                            color: formData.recurringDays.includes(day) ? 'white' : '#333',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                            <input
                              type="checkbox"
                              checked={formData.recurringDays.includes(day)}
                              onChange={() => handleArrayChange('recurringDays', day)}
                              style={{ display: 'none' }}
                            />
                            {day.slice(0, 3)}
                          </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Vehicle & Pricing */}
            {step === 2 && (
              <div>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '2rem',
                  textAlign: 'center'
                }}>
                  🚗 Vehicle & Pricing Details
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
                  gap: '2rem',
                  marginBottom: '2rem'
                }}>
                  {/* Vehicle Type */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      🚙 Vehicle Type *
                    </label>
                    <select
                      value={formData.vehicle.type}
                      onChange={(e) => handleInputChange('vehicle.type', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      required
                    >
                      <option value="">Select vehicle type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type} value={type.toLowerCase()}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Model */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      🏷 Vehicle Model *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Honda City, Maruti Swift"
                      value={formData.vehicle.model}
                      onChange={(e) => handleInputChange('vehicle.model', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      required
                    />
                  </div>

                  {/* Vehicle Number */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      🔢 Vehicle Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., DL 8C AB 1234"
                      value={formData.vehicle.number}
                      onChange={(e) => handleInputChange('vehicle.number', e.target.value.toUpperCase())}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {/* Vehicle Color */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      🎨 Vehicle Color
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., White, Silver, Black"
                      value={formData.vehicle.color}
                      onChange={(e) => handleInputChange('vehicle.color', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {/* Available Seats */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      👥 Available Seats *
                    </label>
                    <select
                      value={formData.seats}
                      onChange={(e) => handleInputChange('seats', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      required
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} seat{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price per Seat */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      💰 Price per Seat (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="Enter price per seat"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      min="1"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      required
                    />
                  </div>
                </div>

                {/* Pricing Helper */}
                {formData.price && (
                  <div style={{
                    background: '#f0f9ff',
                    border: '2px solid #0ea5e9',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#0ea5e9',
                      marginBottom: '1rem'
                    }}>
                      💡 Pricing Summary
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem'
                    }}>
                      <div>
                        <span style={{ color: '#666' }}>Price per seat:</span>
                        <span style={{ fontWeight: '600', color: '#333', marginLeft: '0.5rem' }}>
                          ₹{formData.price}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>Total if all seats booked:</span>
                        <span style={{ fontWeight: '600', color: '#10b981', marginLeft: '0.5rem' }}>
                          ₹{formData.price * formData.seats}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>Platform fee (5%):</span>
                        <span style={{ fontWeight: '600', color: '#f59e0b', marginLeft: '0.5rem' }}>
                          ₹{Math.round(formData.price * formData.seats * 0.05)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>You'll receive:</span>
                        <span style={{ fontWeight: '600', color: '#059669', marginLeft: '0.5rem' }}>
                          ₹{Math.round(formData.price * formData.seats * 0.95)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <div>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '2rem',
                  textAlign: 'center'
                }}>
                  ⚙ Preferences & Amenities
                </h2>

                {/* Amenities */}
                <div style={{ marginBottom: '3rem' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '1rem'
                  }}>
                    ✨ Available Amenities
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '1.5rem'
                  }}>
                    Select the amenities you can provide to make the ride more comfortable:
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {availableAmenities.map((amenity) => (
                      <label key={amenity} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: formData.amenities.includes(amenity) ? '#667eea' : '#f8f9fa',
                        color: formData.amenities.includes(amenity) ? 'white' : '#333',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '2px solid',
                        borderColor: formData.amenities.includes(amenity) ? '#667eea' : '#e5e7eb'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleArrayChange('amenities', amenity)}
                          style={{ display: 'none' }}
                        />
                        <span style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          background: formData.amenities.includes(amenity) ? 'white' : '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: formData.amenities.includes(amenity) ? '#667eea' : 'transparent',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </span>
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div style={{ marginBottom: '3rem' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '1rem'
                  }}>
                    🎭 Ride Preferences
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '1.5rem'
                  }}>
                    Set your preferences for co-passengers:
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {availablePreferences.map((preference) => (
                      <label key={preference} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: formData.preferences.includes(preference) ? '#10b981' : '#f8f9fa',
                        color: formData.preferences.includes(preference) ? 'white' : '#333',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '2px solid',
                        borderColor: formData.preferences.includes(preference) ? '#10b981' : '#e5e7eb'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.preferences.includes(preference)}
                          onChange={() => handleArrayChange('preferences', preference)}
                          style={{ display: 'none' }}
                        />
                        <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          background: formData.preferences.includes(preference) ? 'white' : '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: formData.preferences.includes(preference) ? '#10b981' : 'transparent',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </span>
                        {preference}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Description */}
                <div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '1rem'
                  }}>
                    📝 Additional Information
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '1rem'
                  }}>
                    Add any additional details about your ride (optional):
                  </p>
                  <textarea
                    placeholder="e.g., Pickup point details, route preferences, contact instructions..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '15px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '3rem',
              gap: '1rem'
            }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
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
                  ⬅ Previous
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                  className="hover-scale"
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  Next ➡
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '1rem 2rem',
                    background: loading ? '#ccc' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: loading ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                  className={!loading ? "hover-scale" : ""}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                >
                  {loading ? '🚀 Publishing...' : '🚀 Publish Ride'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            💡 Tips for a Successful Ride
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
            gap: '2rem'
          }}>
            {[
              {
                icon: '💰',
                title: 'Fair Pricing',
                desc: 'Price your ride competitively. Consider fuel costs, tolls, and your time.',
                tip: 'Check similar routes for pricing reference'
              },
              {
                icon: '📱',
                title: 'Stay Connected',
                desc: 'Respond quickly to booking requests and keep passengers updated.',
                tip: 'Enable push notifications for instant alerts'
              },
              {
                icon: '⭐',
                title: 'Build Rating',
                desc: 'Provide a clean car, be punctual, and maintain a friendly attitude.',
                tip: 'Good ratings lead to more bookings'
              }
            ].map((tip, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '15px',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
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
                  lineHeight: '1.5',
                  marginBottom: '1rem'
                }}>
                  {tip.desc}
                </p>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#667eea',
                  fontWeight: '500',
                  background: '#f0f4ff',
                  padding: '0.5rem',
                  borderRadius: '8px'
                }}>
                  💡 {tip.tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferRides;