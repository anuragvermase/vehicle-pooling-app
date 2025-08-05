import React, { useState } from 'react';
import Loading from '../components/Loading';
import API from '../services/api';
import hideLogo from '../assets/hide.png';
import viewLogo from '../assets/view.png';  

const Register = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    suggestions: [],
    requirements: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false
    }
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  // Name validation function
  const validateName = (value) => {
    const alphabetRegex = /^[a-zA-Z\s]*$/;
    if (!alphabetRegex.test(value)) {
      setNameError('Name must only contain letters and spaces. No numbers or special characters allowed.');
      return false;
    } else if (value.trim().length > 0 && value.trim().length < 2) {
      setNameError('Name must be at least 2 characters long.');
      return false;
    } else if (value.length > 50) {
      setNameError('Name cannot exceed 50 characters.');
      return false;
    } else {
      setNameError('');
      return true;
    }
  };

  // Password strength validation
  const validatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;

    const suggestions = [];
    if (!requirements.length) suggestions.push('Use at least 8 characters');
    if (!requirements.lowercase) suggestions.push('Add lowercase letters (a-z)');
    if (!requirements.uppercase) suggestions.push('Add uppercase letters (A-Z)');
    if (!requirements.number) suggestions.push('Add numbers (0-9)');
    if (!requirements.special) suggestions.push('Add special characters (!@#$%^&*)');

    const strengthData = {
      score,
      suggestions,
      requirements
    };

    setPasswordStrength(strengthData);
    return strengthData;
  };

  const getPasswordStrengthLabel = (score) => {
    if (score === 0) return { label: '', color: '' };
    if (score <= 2) return { label: 'Weak', color: '#dc2626' };
    if (score <= 3) return { label: 'Fair', color: '#f59e0b' };
    if (score <= 4) return { label: 'Good', color: '#10b981' };
    return { label: 'Strong', color: '#059669' };
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  // Updated name change handler
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    // Update formData
    setFormData({
      ...formData,
      name: value
    });

    // Validate name
    validateName(value);

    // Clear general error if any
    if (error) setError('');
  };

  // Password change handler
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      password: value
    });

    // Validate password strength
    validatePasswordStrength(value);

    // Clear general error if any
    if (error) setError('');
  };

  const validateStep1 = () => {
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!validateName(formData.name)) {
      isValid = false;
    }

    // Validate email
    if (!formData.email) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return isValid;
  };

  const validateStep2 = () => {
    if (!formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (passwordStrength.score < 3) {
      setError('Please create a stronger password');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await API.auth.register(registerData);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      onRegister(response.user, response.token);

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');

      // For testing without backend
      if (err.message && err.message.includes('fetch')) {
        const testUser = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };
        onRegister(testUser, 'temp-token');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Creating your account..." />;
  }

  const strengthInfo = getPasswordStrengthLabel(passwordStrength.score);

  return (
    <div style={{ width: '100%',
      maxHeight: '80vh',    // Show at most 90% of the viewport
    overflowY: 'auto',    // Scroll if content overflows vertically
    paddingRight: '8px'
     }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{
          color: '#667eea',
          fontSize: '1.8rem',
          fontWeight: '600',
          marginBottom: '0.5rem'
        }}>
          Join PoolRide! 🎉
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '0.9rem'
        }}>
          Start saving money and help the environment
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <span style={{
            fontSize: '0.8rem',
            color: step >= 1 ? '#667eea' : '#9ca3af',
            fontWeight: step >= 1 ? '600' : '400'
          }}>
            Basic Info
          </span>
          <span style={{
            fontSize: '0.8rem',
            color: step >= 2 ? '#667eea' : '#9ca3af',
            fontWeight: step >= 2 ? '600' : '400'
          }}>
            Security
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          background: '#e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(step / 2) * 100}%`,
            height: '100%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }} className="animate-fadeIn">
          <span>❌</span>
          {error}
        </div>
      )}

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
        {step === 1 && (
          <div className="animate-slideInLeft">
            {/* Name Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleNameChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: `2px solid ${nameError ? '#dc2626' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!nameError) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = nameError ? '#dc2626' : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <span style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '0.75rem',
                  fontSize: '1.1rem'
                }}>
                  👤
                </span>
              </div>
              {nameError && (
                <p style={{
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span>⚠</span>
                  {nameError}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <span style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.1rem'
                }}>
                  📧
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={nameError || !formData.name.trim()}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: (nameError || !formData.name.trim())
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (nameError || !formData.name.trim()) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: (nameError || !formData.name.trim())
                  ? 'none'
                  : '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              className="hover-scale"
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slideInRight">
            {/* Phone Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Phone Number *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <span style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.1rem'
                }}>
                  📱
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 3rem 0.75rem 2.5rem',
                    border: `2px solid ${formData.password && passwordStrength.score < 3 ? '#f59e0b' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = formData.password && passwordStrength.score < 3 ? '#f59e0b' : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <span style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.1rem'
                }}>
                  🔒
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  <img
  src={showPassword ? hideLogo : viewLogo}
  alt={showPassword ? 'Hide password' : 'Show password'}
  style={{ width: 24, height: 24 }}
/>

                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div style={{ marginTop: '0.75rem' }}>
                  {/* Strength Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '4px',
                      background: '#e5e7eb',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        height: '100%',
                        background: strengthInfo.color,
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    {strengthInfo.label && (
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: strengthInfo.color
                      }}>
                        {strengthInfo.label}
                      </span>
                    )}
                  </div>

                  {/* Requirements Checklist */}
                  <div style={{
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#374151'
                    }}>
                      Password Requirements:
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.25rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: passwordStrength.requirements.length ? '#059669' : '#6b7280'
                      }}>
                        <span>{passwordStrength.requirements.length ? '✅' : '⭕'}</span>
                        At least 8 characters
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: passwordStrength.requirements.lowercase ? '#059669' : '#6b7280'
                      }}>
                        <span>{passwordStrength.requirements.lowercase ? '✅' : '⭕'}</span>
                        Lowercase letter (a-z)
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: passwordStrength.requirements.uppercase ? '#059669' : '#6b7280'
                      }}>
                        <span>{passwordStrength.requirements.uppercase ? '✅' : '⭕'}</span>
                        Uppercase letter (A-Z)
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: passwordStrength.requirements.number ? '#059669' : '#6b7280'
                      }}>
                        <span>{passwordStrength.requirements.number ? '✅' : '⭕'}</span>
                        Number (0-9)
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: passwordStrength.requirements.special ? '#059669' : '#6b7280'
                      }}>
                        <span>{passwordStrength.requirements.special ? '✅' : '⭕'}</span>
                        Special character (!@#$%)
                      </div>
                    </div>

                    {/* Suggestions */}
                    {passwordStrength.suggestions.length > 0 && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '4px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          color: '#856404',
                          fontSize: '0.75rem'
                        }}>
                          💡 To make your password stronger:
                        </div>
                        <ul style={{
                          margin: 0,
                          paddingLeft: '1rem',
                          color: '#856404'
                        }}>
                          {passwordStrength.suggestions.map((suggestion, index) => (
                            <li key={index} style={{ fontSize: '0.75rem' }}>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Strong Password Tips */}
                    {passwordStrength.score >= 4 && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#d1fae5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '4px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: '#065f46',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          <span>🎉</span>
                          Excellent! Your password is strong and secure.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: `2px solid ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? '#dc2626'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? '#10b981'
                        : '#e5e7eb'
                    }`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? '#dc2626'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? '#10b981'
                      : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
                <span style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.1rem'
                }}>
                  🔐
                </span>
                {formData.confirmPassword && (
                  <span style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1rem'
                  }}>
                    {formData.password === formData.confirmPassword ? '✅' : '❌'}
                  </span>
                )}
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p style={{
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span>⚠</span>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#6b7280'
              }}>
                <input
                  type="checkbox"
                  style={{
                    marginTop: '0.1rem'
                  }}
                  required
                />
                <span>
                  I agree to the{' '}
                  <a href="#" style={{ color: '#667eea', textDecoration: 'underline' }}>
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" style={{ color: '#667eea', textDecoration: 'underline' }}>
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="hover-scale"
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#667eea';
                }}
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={passwordStrength.score < 3 || formData.password !== formData.confirmPassword}
                style={{
                  flex: 2,
                  padding: '0.875rem',
                  background: (passwordStrength.score < 3 || formData.password !== formData.confirmPassword)
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (passwordStrength.score < 3 || formData.password !== formData.confirmPassword)
                    ? 'not-allowed'
                    : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: (passwordStrength.score < 3 || formData.password !== formData.confirmPassword)
                    ? 'none'
                    : '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
                className="hover-scale"
                onMouseEnter={(e) => {
                  if (passwordStrength.score >= 3 && formData.password === formData.confirmPassword) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (passwordStrength.score >= 3 && formData.password === formData.confirmPassword) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                🎉 Create Account
              </button>
            </div>
          </div>
        )}

      </form>

      {/* Benefits Section */}
      {/* <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#667eea',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🎯 Why Join PoolRide?
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          fontSize: '0.8rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>Save Money</div>
            <div style={{ color: '#6b7280' }}>Up to 70% on travel</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌱</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>Go Green</div>
            <div style={{ color: '#6b7280' }}>Reduce carbon footprint</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>Meet People</div>
            <div style={{ color: '#6b7280' }}>Make new connections</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>Quick Match</div>
            <div style={{ color: '#6b7280' }}>Find rides instantly</div>
          </div>
        </div>
      </div> */}

      {/* Security Tips */}
      {/* {step === 2 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '8px',
          border: '1px solid #bfdbfe'
        }}>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#1e40af',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🛡 Security Tips
          </h4>

          <div style={{
            fontSize: '0.8rem',
            color: '#1e40af',
            lineHeight: '1.4'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              ✓ Use a unique password you don't use elsewhere
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              ✓ Consider using a passphrase like "Coffee@Morning123!"
            </div>
            <div>
              ✓ We'll never ask for your password via email or phone
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Register;
