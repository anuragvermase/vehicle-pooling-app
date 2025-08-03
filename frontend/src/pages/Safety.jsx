import React from 'react';

const Safety = () => {
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

  const helplineInfo = [
    {
      icon: '🚨',
      title: 'Emergency Helpline',
      number: '911',
      description: 'For immediate life-threatening emergencies',
      color: '#e74c3c'
    },
    {
      icon: '📞',
      title: 'PoolRide Safety Line',
      number: '+1 (555) 123-SAFE',
      description: 'Available 24/7 for safety concerns',
      color: '#3498db'
    },
    {
      icon: '👮',
      title: 'Police Non-Emergency',
      number: '311',
      description: 'For non-urgent safety reports',
      color: '#9b59b6'
    },
    {
      icon: '📧',
      title: 'Safety Support Email',
      number: 'safety@poolride.com',
      description: 'Report incidents or safety concerns',
      color: '#27ae60'
    }
  ];

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
      margin: 0,
      padding: 0
    }}>
      {/* Hero Section */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.9), rgba(0, 160, 133, 0.9))',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '4rem', 
          marginBottom: '1.5rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          margin: 0,
          paddingBottom: '1.5rem'
        }}>
          🛡 Your Safety First
        </h1>
        <p style={{ 
          fontSize: '1.4rem', 
          opacity: 0.95,
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          We've built comprehensive safety features to ensure every ride is secure and comfortable for all our users.
        </p>
      </div>

      {/* Safety Features */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            color: '#2c3e50', 
            marginBottom: '3rem', 
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            🔒 Safety Features
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '2.5rem'
          }}>
            {safetyFeatures.map((feature, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '20px',
                textAlign: 'center',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#00b894';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1.5rem',
                  background: 'linear-gradient(135deg, #00b894, #00a085)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  color: '#2c3e50', 
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: '#666',
                  lineHeight: '1.6',
                  fontSize: '1.1rem'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            color: '#2c3e50', 
            marginBottom: '3rem', 
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            💡 Safety Tips
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem'
          }}>
            {safetyTips.map((tip, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #00b894, #00a085)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <p style={{ 
                  color: '#2c3e50', 
                  margin: 0,
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Helpline Information */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            color: '#2c3e50',
            marginBottom: '2rem',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            📞 Safety & Support Contacts
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            textAlign: 'center',
            marginBottom: '3rem',
            lineHeight: '1.6'
          }}>
            Keep these important contacts handy for any safety concerns or emergencies
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {helplineInfo.map((info, index) => (
              <div key={index} style={{
                background: 'white',
                border: `3px solid ${info.color}`,
                borderRadius: '20px',
                padding: '2.5rem',
                textAlign: 'center',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: info.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem auto',
                  fontSize: '2.5rem'
                }}>
                  {info.icon}
                </div>
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.4rem',
                  marginBottom: '1rem',
                  fontWeight: 'bold'
                }}>
                  {info.title}
                </h3>
                <div style={{
                  color: info.color,
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  fontFamily: 'monospace'
                }}>
                  {info.number}
                </div>
                <p style={{
                  color: '#666',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Safety Information */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #2c3e50, #34495e)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🤝</div>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1.5rem',
            fontWeight: 'bold'
          }}>
            We're Here for You
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2.5rem',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Your safety is our top priority. Our dedicated safety team works around the clock to ensure 
            every ride meets our high safety standards. Don't hesitate to reach out if you ever feel 
            unsafe or need assistance.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {[
              { icon: '🔍', title: 'Background Checks', desc: 'Comprehensive screening for all drivers' },
              { icon: '📱', title: '24/7 Monitoring', desc: 'Round-the-clock safety monitoring' },
              { icon: '🚨', title: 'Instant Response', desc: 'Immediate action on safety reports' },
              { icon: '🛡', title: 'Insurance Coverage', desc: 'Full protection for every ride' }
            ].map((item, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '2rem',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  marginBottom: '0.5rem',
                  fontWeight: 'bold'
                }}>
                  {item.title}
                </h3>
                <p style={{ 
                  opacity: 0.8, 
                  fontSize: '1rem',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;