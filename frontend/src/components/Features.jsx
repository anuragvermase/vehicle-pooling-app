import React, { useState, useEffect } from 'react';
import '../styles/GlobalStyles.css'; // Fixed import path

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: '🔍',
      title: 'Smart Matching',
      description: 'AI-powered algorithm finds perfect ride matches based on your route, timing, and preferences.',
      details: ['Route optimization', 'Time-based matching', 'Preference filtering', 'Real-time updates'],
      color: '#667eea'
    },
    {
      icon: '💰',
      title: 'Cost Splitting',
      description: 'Automatically calculate and split costs fairly among passengers. Save up to 70% on travel expenses.',
      details: ['Automatic cost calculation', 'Fair splitting algorithm', 'Multiple payment options', 'Expense tracking'],
      color: '#26de81'
    },
    {
      icon: '🛡',
      title: 'Safety First',
      description: 'Verified profiles, real-time tracking, and emergency features ensure your safety every ride.',
      details: ['Profile verification', 'Real-time GPS tracking', 'Emergency SOS button', '24/7 support'],
      color: '#ff6b6b'
    },
    {
      icon: '🌱',
      title: 'Eco Friendly',
      description: 'Reduce carbon footprint by sharing rides. Track your environmental impact and earn green credits.',
      details: ['Carbon footprint tracking', 'Environmental impact reports', 'Green rewards program', 'Sustainability goals'],
      color: '#20bf6b'
    },
    {
      icon: '⚡',
      title: 'Instant Booking',
      description: 'Book rides in seconds with our quick booking system. No waiting, no hassle.',
      details: ['One-tap booking', 'Instant confirmations', 'Quick rebooking', 'Favorite routes'],
      color: '#fd79a8'
    },
    {
      icon: '📱',
      title: 'Mobile First',
      description: 'Optimized mobile experience with offline support and push notifications.',
      details: ['Responsive design', 'Offline functionality', 'Push notifications', 'App shortcuts'],
      color: '#6c5ce7'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('features');
    if (element) {
      observer.observe(element);
    }

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => {
      if (element) observer.unobserve(element);
      clearInterval(interval);
    };
  }, [features.length]);

  const handleFeatureCardHover = (e, feature, index, isEntering) => {
    if (isEntering) {
      e.target.style.transform = 'translateY(-10px) scale(1.02)';
      e.target.style.boxShadow = `0 15px 40px ${feature.color}20`;
      e.target.style.borderColor = feature.color;
    } else {
      e.target.style.transform = index === activeFeature ? 'scale(1.05)' : 'scale(1)';
      e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
      e.target.style.borderColor = '#e5e7eb';
    }
  };

  const handleNavButtonHover = (e, feature, index, isEntering) => {
    if (index !== activeFeature) {
      if (isEntering) {
        e.target.style.borderColor = feature.color;
        e.target.style.color = feature.color;
      } else {
        e.target.style.borderColor = '#e5e7eb';
        e.target.style.color = '#666';
      }
    }
  };

  return (
    <section 
      id="features"
      style={{
        padding: '5rem 0',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }}></div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        {/* Section Header */}
        <div 
          style={{
            textAlign: 'center',
            marginBottom: '4rem'
          }} 
          className={isVisible ? 'fade-in' : ''}
        >
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '1rem'
          }}>
            Why Choose{' '}
            <span style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              PoolRide
            </span>
            ? 🚀
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Experience the future of commuting with our innovative features designed 
            to make ride sharing safe, affordable, and convenient.
          </p>
        </div>

        {/* Featured Feature Showcase */}
        <div 
          style={{
            marginBottom: '4rem',
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 50px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }} 
          className={isVisible ? 'slide-up' : ''}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '3rem',
            alignItems: 'center'
          }}>
            {/* Feature Info */}
            <div>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                textAlign: window.innerWidth > 768 ? 'left' : 'center'
              }}>
                {features[activeFeature].icon}
              </div>
              
              <h3 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: features[activeFeature].color,
                marginBottom: '1rem',
                textAlign: window.innerWidth > 768 ? 'left' : 'center'
              }}>
                {features[activeFeature].title}
              </h3>
              
              <p style={{
                fontSize: '1.1rem',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '2rem',
                textAlign: window.innerWidth > 768 ? 'left' : 'center'
              }}>
                {features[activeFeature].description}
              </p>
              
              {/* Feature Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                {features[activeFeature].details.map((detail, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: `${features[activeFeature].color}10`,
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#555'
                  }}>
                    <span style={{ color: features[activeFeature].color }}>✓</span>
                    {detail}
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Visual */}
            <div style={{
              position: 'relative',
              textAlign: 'center'
            }}>
              {/* Main Circle */}
              <div style={{
                width: '250px',
                height: '250px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${features[activeFeature].color}20, ${features[activeFeature].color}05)`,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: `3px solid ${features[activeFeature].color}30`
              }}>
                <div style={{
                  fontSize: '6rem'
                }}>
                  {features[activeFeature].icon}
                </div>

                {/* Floating Elements */}
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: features[activeFeature].color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    top: `${20 + Math.sin(item * Math.PI / 2) * 100}px`,
                    left: `${120 + Math.cos(item * Math.PI / 2) * 100}px`,
                    animation: `orbit 8s linear infinite ${item * 2}s`,
                    boxShadow: `0 4px 15px ${features[activeFeature].color}40`
                  }}>
                    {['⚡', '🎯', '💡', '🔥'][item]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                style={{
                  padding: '0.5rem 1rem',
                  border: `2px solid ${index === activeFeature ? feature.color : '#e5e7eb'}`,
                  borderRadius: '25px',
                  background: index === activeFeature ? feature.color : 'white',
                  color: index === activeFeature ? 'white' : '#666',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => handleNavButtonHover(e, feature, index, true)}
                onMouseLeave={(e) => handleNavButtonHover(e, feature, index, false)}
              >
                <span>{feature.icon}</span>
                <span>{feature.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '15px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transform: index === activeFeature ? 'scale(1.05)' : 'scale(1)',
                opacity: index === activeFeature ? 1 : 0.8,
                animationDelay: `${index * 0.2}s`
              }}
              className={isVisible ? 'fade-in' : ''}
              onClick={() => setActiveFeature(index)}
              onMouseEnter={(e) => handleFeatureCardHover(e, feature, index, true)}
              onMouseLeave={(e) => handleFeatureCardHover(e, feature, index, false)}
            >
              {/* Feature Icon */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                border: `3px solid ${feature.color}30`
              }}>
                {feature.icon}
              </div>

              {/* Feature Content */}
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: feature.color,
                marginBottom: '1rem'
              }}>
                {feature.title}
              </h3>

              <p style={{
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontSize: '0.95rem'
              }}>
                {feature.description}
              </p>

              {/* Feature Badge */}
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: `${feature.color}15`,
                color: feature.color,
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                Learn More →
              </div>
            </div>
          ))}
        </div>

                {/* Statistics Section */}
        <div 
          style={{
            marginTop: '4rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '20px',
            color: 'white',
            textAlign: 'center'
          }} 
          className={isVisible ? 'slide-up' : ''}
        >
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '2rem'
          }}>
            Trusted by Thousands 🌟
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { number: '50,000+', label: 'Happy Users', icon: '👥' },
              { number: '1M+', label: 'Rides Completed', icon: '🚗' },
              { number: '₹10L+', label: 'Money Saved', icon: '💰' },
              { number: '4.8/5', label: 'User Rating', icon: '⭐' }
            ].map((stat, index) => (
              <div key={index} style={{
                padding: '1rem'
              }}>
                <div style={{ 
                  fontSize: '2rem', 
                  marginBottom: '0.5rem' 
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.9
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;