// frontend/src/pages/Login.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import API from '../services/api';
import googleLogo from '../assets/google-logo.png';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Google state
  const [googleReady, setGoogleReady] = useState(false);
  const gisInitialized = useRef(false);
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Form submission handler (email/password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.auth.login(formData);
      // Ensure response contains token and user object
      if (response.token) {
        // store ONLY token; parent will fetch live user
        localStorage.setItem('token', response.token);
        if (typeof onLogin === 'function') {
          onLogin(response.user || null, response.token);
        }
        navigate('/');
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      let message = 'Login failed. Please try again.';
      if (err?.response?.status === 401) {
        message = 'Invalid email or password';
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Google callback function
  const handleGoogleResponse = async (response) => {
    const idToken = response?.credential;
    if (!idToken) {
      setError('Google sign-in failed. No token received.');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending Google token to backend...');
      const res = await API.auth.loginWithGoogle({ idToken });
      
      if (res?.token) {
        localStorage.setItem('token', res.token);
        if (typeof onLogin === 'function') onLogin(res.user || null, res.token);
        navigate('/');
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      const msg = err?.message || 'Google sign-in failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!CLIENT_ID) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google button will be disabled.');
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    
    const initializeGoogle = () => {
      if (window.google && !gisInitialized.current) {
        try {
          gisInitialized.current = true;
          
          // Initialize Google Identity Services
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin',
            ux_mode: 'popup',
            use_fedcm_for_prompt: false, // Changed to false for better compatibility
          });

          // Render the button if the ref exists
          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(
              googleButtonRef.current,
              {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: 200,
              }
            );
          }

          setGoogleReady(true);
          console.log('Google Sign-In initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
          setGoogleReady(false);
        }
      }
    };

    if (existingScript) {
      // Script already loaded
      initializeGoogle();
    } else {
      // Load the script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        console.error('Failed to load Google Identity script.');
        setGoogleReady(false);
      };

      document.body.appendChild(script);
    }

    return () => {
      // Cleanup - but don't remove the script to avoid re-loading
      if (gisInitialized.current && window.google) {
        try {
          // Clean up any Google Sign-In state if needed
        } catch (error) {
          console.warn('Error during Google Sign-In cleanup:', error);
        }
      }
    };
  }, []);

  // Manual Google Sign-In trigger (fallback)
  const handleGoogleClick = () => {
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!googleReady || !window.google || !CLIENT_ID) {
      setError('Google Login is not ready. Please refresh the page and try again.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Try to trigger the Google Sign-In flow
      window.google.accounts.id.prompt((notification) => {
        console.log('Google prompt notification:', notification);
        
        if (notification.isNotDisplayed()) {
          setLoading(false);
          setError('Google sign-in popup was blocked. Please allow popups and try again.');
        } else if (notification.isSkippedMoment()) {
          setLoading(false);
          setError('Google sign-in was cancelled.');
        } else if (notification.isDismissedMoment()) {
          setLoading(false);
          setError('Google sign-in was dismissed.');
        }
      });
    } catch (err) {
      console.error('Google prompt error:', err);
      setError('Failed to open Google sign-in. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Signing you in..." />;
  }

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{
        textAlign: 'center',
        color: '#667eea',
        marginBottom: '2rem',
        fontSize: '1.8rem',
        fontWeight: '600'
      }}>
        Welcome Back!
      </h2>

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
          <span>❌</span> {error}
          <button
            onClick={() => setError('')}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* email */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#374151',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}>
            Email Address
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
                outline: 'none',
                boxSizing: 'border-box'
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

        {/* password */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#374151',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 3rem 0.75rem 2.5rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease',
                outline: 'none',
                boxSizing: 'border-box'
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
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '🙉'}
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            color: '#6b7280'
          }}>
            <input type="checkbox" style={{ marginRight: '0.25rem' }} />
            Remember me
          </label>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => alert('Forgot Password flow')}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            opacity: loading ? 0.7 : 1
          }}
          className="hover-scale"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: '#6b7280' }}>
            Don't have an account?{' '}
          </span>
          <a
            href="/register"
            style={{
              color: '#667eea',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Register here
          </a>
        </div>
      </form>

      {/* Social Login Options */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Or continue with
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          {/* Google Sign-In Button Container */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            {/* Official Google Button (rendered by Google) */}
            <div 
              ref={googleButtonRef}
              style={{ 
                opacity: googleReady ? 1 : 0.6,
                transition: 'opacity 0.3s ease'
              }}
            />
            
            {/* Fallback Custom Button */}
            {!googleReady && (
              <button
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  opacity: 0.6
                }}
                disabled
                title="Google Login is loading..."
              >
                <img
                  src={googleLogo}
                  alt="Google Logo"
                  style={{ width: '15px', height: '15px', objectFit: 'contain' }}
                />
                Loading Google...
              </button>
            )}
          </div>

          <button
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
            className="hover-scale"
            onClick={() => alert('Phone login flow')}
          >
            <span role="img" aria-label="phone">📱</span> Phone
          </button>
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
            <p>Google Ready: {googleReady ? '✅' : '❌'}</p>
            <p>Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅' : '❌'}</p>
            {!googleReady && (
              <button
                onClick={handleGoogleClick}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Try Manual Google Login
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;