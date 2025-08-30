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
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Notify parent of successful login (if provided)
        if (typeof onLogin === 'function') {
          onLogin(response.user, response.token);
        }

        // ✅ Stay on Home page after login
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Google Identity Services (ID Token flow) ---
  useEffect(() => {
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!CLIENT_ID) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google button will be disabled.');
      return;
    }

    // Load the GIS script once
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && !gisInitialized.current) {
        gisInitialized.current = true;
        setGoogleReady(true);
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity script.');
      setGoogleReady(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleClick = () => {
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleReady || !window.google || !CLIENT_ID) {
      setError('Google Login is not ready. Please refresh and try again.');
      return;
    }
    setError('');

    // Initialize a renderless Google One Tap/popup flow; we only use its callback.
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response) => {
        const idToken = response?.credential;
        if (!idToken) {
          setError('Google sign-in failed. Please try again.');
          return;
        }

        setLoading(true);
        try {
          const res = await API.auth.loginWithGoogle({ idToken });
          if (res?.token && res?.user) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            if (typeof onLogin === 'function') onLogin(res.user, res.token);
            navigate('/');
          } else {
            throw new Error('Invalid response from server.');
          }
        } catch (err) {
          const msg = err?.message || 'Google sign-in failed. Please try again.';
          setError(msg);
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      use_fedcm_for_prompt: true,
    });

    // Prompt shows a small dialog/popup; if blocked, GIS handles the UX fallback.
    window.google.accounts.id.prompt();
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
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
            <input
              type="checkbox"
              style={{ marginRight: '0.25rem' }}
            />
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
            onClick={() => alert('Forgot Password flow')} // replace with your action
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.875rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
          className="hover-scale"
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          Sign In
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: '#6b7280' }}>
            Don’t have an account?{' '}
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

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              cursor: googleReady ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              opacity: googleReady ? 1 : 0.6
            }}
            className="hover-scale"
            onMouseEnter={(e) => {
              if (!googleReady) return;
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = 'none';
            }}
            onClick={handleGoogleClick} // 🔗 now wired to Google
            title={googleReady ? 'Sign in with Google' : 'Google Login not ready'}
          >
            <img
              src={googleLogo}
              alt="Google Logo"
              style={{
                width: '15px',
                height: '15px',
                objectFit: 'contain',
                display: 'inline-block',
                verticalAlign: 'middle'
              }}
            />
            Google
          </button>

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
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = 'none';
            }}
            onClick={() => alert('Phone login flow')} // replace with real phone auth
          >
            <span role="img" aria-label="phone">📱</span> Phone
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;