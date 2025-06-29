import React from 'react';
import '../styles/GlobalStyles.css';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      gap: '1rem'
    }}>
      {/* Animated Car Loading */}
      <div style={{
        fontSize: '3rem',
        animation: 'bounce 1s infinite'
      }}>
        🚗
      </div>
      
      {/* Loading Spinner */}
      <div className="spinner"></div>
      
      {/* Loading Message */}
      <p style={{
        color: '#667eea',
        fontSize: '1.1rem',
        fontWeight: '500'
      }}>
        {message}
      </p>
      
      {/* Loading Dots Animation */}
      <div style={{
        display: 'flex',
        gap: '0.3rem'
      }}>
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#667eea',
              animation: `bounce 1.4s ease-in-out ${dot * 0.16}s infinite both`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;