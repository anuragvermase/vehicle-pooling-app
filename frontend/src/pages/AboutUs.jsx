import React from 'react';

const AboutUs = () => {
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      margin: 0,
      padding: 0
    }}>
      {/* Hero Section */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          marginBottom: '1.5rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          margin: 0,
          paddingBottom: '1.5rem'
        }}>
          About PoolRide
        </h1>
        <p style={{ 
          fontSize: '1.4rem', 
          opacity: 0.95,
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Revolutionizing transportation through innovative ride-sharing solutions that connect communities and reduce environmental impact.
        </p>
      </div>

      {/* Mission Section */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ 
                color: '#2c3e50', 
                marginBottom: '2rem',
                fontSize: '2.5rem',
                fontWeight: 'bold'
              }}>
                Our Mission
              </h2>
              <p style={{ 
                color: '#666', 
                fontSize: '1.2rem',
                lineHeight: '1.8',
                marginBottom: '2rem'
              }}>
                At PoolRide, we believe transportation should be accessible, affordable, and sustainable. 
                We're committed to creating a world where getting around is easy, safe, and environmentally responsible.
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                {['🌍 Eco-Friendly', '💰 Affordable', '🚗 Convenient', '👥 Community'].map((item, index) => (
                  <div key={index} style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '20px',
              padding: '3rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚗</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem', margin: 0, paddingBottom: '1rem' }}>10M+</h3>
              <p style={{ fontSize: '1.2rem', margin: 0 }}>Rides Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center',
            color: '#2c3e50', 
            marginBottom: '3rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            Our Core Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '🛡',
                title: 'Safety First',
                description: 'Every ride is monitored with GPS tracking, driver verification, and 24/7 emergency support.'
              },
              {
                icon: '🌱',
                title: 'Sustainability',
                description: 'Reducing carbon footprint by optimizing routes and promoting shared transportation.'
              },
              {
                icon: '🤝',
                title: 'Community',
                description: 'Building connections between neighbors and creating a sense of shared responsibility.'
              },
              {
                icon: '💡',
                title: 'Innovation',
                description: 'Continuously improving our platform with cutting-edge technology and user feedback.'
              }
            ].map((value, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>{value.icon}</div>
                <h3 style={{ 
                  color: '#2c3e50', 
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {value.title}
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '2rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            Our Story
          </h2>
          <p style={{ 
            color: '#666', 
            fontSize: '1.2rem',
            lineHeight: '1.8',
            marginBottom: '3rem'
          }}>
            Founded in 2020, PoolRide started with a simple idea: make transportation more efficient and sustainable. 
            What began as a small startup has grown into a platform serving millions of users worldwide, 
            all while maintaining our commitment to safety, affordability, and environmental responsibility.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {[
              { number: '50+', label: 'Cities' },
              { number: '100K+', label: 'Drivers' },
              { number: '1M+', label: 'Users' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '15px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '1.2rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1.5rem',
            fontWeight: 'bold'
          }}>
            Join the PoolRide Community
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2.5rem',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Whether you're looking for a ride or want to become a driver, 
            PoolRide offers opportunities to connect, earn, and make a positive impact.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <button style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = 'none';
            }}>
              🚗 Book a Ride
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(0px)';
            }}>
              👨‍💼 Become a Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;