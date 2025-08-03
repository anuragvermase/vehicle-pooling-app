import React from 'react';
import { useNavigate } from 'react-router-dom';

const Safety = () => {
  const navigate = useNavigate();

  const safetyFeatures = [
    { icon: '🛡', title: 'Verified Drivers', description: 'All drivers undergo background checks and verification' },
    { icon: '📍', title: 'Real-time Tracking', description: 'Live GPS tracking for all rides with location sharing' },
    { icon: '🚨', title: 'Emergency Button', description: 'Quick access to emergency services when needed' },
    { icon: '⭐', title: 'Rating System', description: 'Community-driven ratings help maintain high standards' },
    { icon: '📱', title: 'In-app Communication', description: 'Secure messaging without sharing personal numbers' },
    { icon: '🔒', title: 'Secure Payments', description: 'Encrypted payment processing for your protection' }
  ];

  const safetyTips = [
    'Always verify the driver and vehicle details before getting in',
    'Share your trip details with friends or family',
    'Trust your instincts - if something feels wrong, don\'t hesitate to exit',
    'Keep your phone charged and accessible during rides',
    'Use the in-app messaging feature instead of sharing personal contact',
    'Report any suspicious behavior immediately through the app'
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#00b894', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>Your Safety First</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', marginBottom: '3rem' }}>
            We've built comprehensive safety features to ensure every ride is secure and comfortable.
          </p>

          {/* Safety Features */}
          <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>Safety Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {safetyFeatures.map((feature, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                padding: '2rem',
                borderRadius: '15px',
                textAlign: 'center',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>{feature.title}</h3>
                <p style={{ color: '#666' }}>{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Safety Tips */}
          <div style={{ background: 'linear-gradient(135deg, #dfe6e9, #b2bec3)', padding: '3rem', borderRadius: '15px', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>Safety Tips</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {safetyTips.map((tip, index) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ 
                    background: '#00b894', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '30px', 
                    height: '30px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {index + 1}
                  </div>
                  <p style={{ color: '#2c3e50', margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Section */}
          <div style={{ background: 'linear-gradient(135deg, #e17055, #d63031)', padding: '3rem', borderRadius: '15px', textAlign: 'center', color: 'white' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚨 Emergency Support</h3>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
              In case of emergency, immediately contact local authorities and report the incident to us.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                background: 'white',
                color: '#d63031',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '25px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                📞 Emergency Hotline
              </button>
              <button style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '1rem 2rem',
                borderRadius: '25px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                📧 Report Incident
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;