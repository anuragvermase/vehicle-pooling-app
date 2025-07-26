import React, { useState } from 'react';
import Loading from '../components/Loading';
import API from '../services/api';
import googleLogo from '../assets/google-logo.png'; 

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🛠 THIS FUNCTION MUST EXIST
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  console.log("📤 Form Data:", formData);

  try {
    const response = await API.auth.login(formData);

    // ✅ Only proceed if response is valid
    if (response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      onLogin(response.user, response.token); // ✅ THIS ONLY RUNS IF RESPONSE IS VALID
    } else {
      throw new Error('Invalid response from server.');
    }

  } catch (err) {
    let message = 'Login failed. Please try again.';

    // ✅ Handle structured backend errors (Axios-style)
    if (err?.response?.status === 401) {
      message = 'Invalid email or password';
    } else if (err?.response?.data?.message) {
      message = err.response.data.message;
    } else if (err?.message) {
      message = err.message;
    }

    setError(message); // ✅ Show the error to the user
    console.error(err);
  } finally {
    setLoading(false); // ✅ Keep the login form on screen
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
          <span>❌</span>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            alignItems: 'left',
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
              style={{
                marginRight: '0.25rem'
              }}
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

      {/* Demo Credentials
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '0.8rem'
      }}>
        <p style={{ 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          color: '#667eea'
        }}>
          🧪 Demo Credentials:
        </p>
        <p>Email: demo@poolride.com</p>
        <p>Password: demo123</p>
      </div> */}

      {/* Social Login Options */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#6b7280',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          Or continue with
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button style={{
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
/> Google

          </button>
          
          <button style={{
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
          >
            <span>📱</span> Phone
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;