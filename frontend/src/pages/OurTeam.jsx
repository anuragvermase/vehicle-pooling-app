import React from 'react';
import { useNavigate } from 'react-router-dom';

const OurTeam = () => {
  const navigate = useNavigate();

  const teamMembers = [
    { name: 'Rahul Sharma', role: 'CEO & Founder', image: '👨‍💼', description: 'Visionary leader with 10+ years in tech' },
    { name: 'Priya Patel', role: 'CTO', image: '👩‍💻', description: 'Tech expert specializing in scalable solutions' },
    { name: 'Amit Kumar', role: 'Head of Operations', image: '👨‍🔧', description: 'Operations guru ensuring smooth rides' },
    { name: 'Sneha Singh', role: 'Head of Marketing', image: '👩‍🎨', description: 'Creative mind building our brand' },
    { name: 'Vikram Joshi', role: 'Lead Developer', image: '👨‍💻', description: 'Full-stack developer crafting user experiences' },
    { name: 'Anita Gupta', role: 'Customer Success', image: '👩‍💼', description: 'Ensuring every user has an amazing experience' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ff7b7b 0%, #667eea 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>Meet Our Team</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', marginBottom: '3rem' }}>
            The passionate individuals building the future of ride-sharing
          </p>

          {/* Team Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {teamMembers.map((member, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                padding: '2rem',
                borderRadius: '15px',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{member.image}</div>
                <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1.3rem' }}>{member.name}</h3>
                <p style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '1rem' }}>{member.role}</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{member.description}</p>
              </div>
            ))}
          </div>

          {/* Join Us Section */}
          <div style={{ background: 'linear-gradient(135deg, #2c3e50, #34495e)', padding: '3rem', borderRadius: '15px', textAlign: 'center', color: 'white', marginTop: '3rem' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Want to Join Our Team?</h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
              We're always looking for talented individuals who share our passion for innovation and sustainability.
            </p>
            <button style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '25px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              View Open Positions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurTeam;