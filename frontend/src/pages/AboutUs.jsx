import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#3498db', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>About PoolRide</h1>
          
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555', marginBottom: '3rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              PoolRide is revolutionizing the way people travel by making ride-sharing accessible, affordable, and environmentally friendly. 
              Founded with the vision of reducing traffic congestion and carbon emissions, we connect drivers and passengers heading in the same direction.
            </p>
            
            <p style={{ marginBottom: '1.5rem' }}>
              Our platform uses advanced algorithms to match compatible riders, ensuring safe, comfortable, and cost-effective journeys for everyone. 
              Whether you're commuting to work, traveling between cities, or exploring new places, PoolRide makes it easy to share the ride and split the cost.
            </p>
          </div>

          {/* Mission & Vision */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Our Mission</h3>
              <p style={{ color: '#666' }}>To make transportation more sustainable, affordable, and social by connecting people who share similar routes.</p>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Our Vision</h3>
              <p style={{ color: '#666' }}>A world where every journey is shared, sustainable, and builds connections between communities.</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)', padding: '2rem', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Our Impact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>10K+</div>
                <div>Happy Users</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>50K+</div>
                <div>Rides Shared</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>2M+</div>
                <div>KM Traveled</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>500T</div>
                <div>CO₂ Saved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;