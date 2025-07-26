import React, { useState, useEffect } from 'react';
import '../styles/GlobalStyles.css'; // Fixed import path

const Hero = ({ onFindRide, onOfferRide }) => {
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const stats = [
    { number: '50K+', label: 'Happy Riders', icon: '👥' },
    { number: '₹2,50,000', label: 'Money Saved', icon: '💰' },
    { number: '5,000+', label: 'Daily Rides', icon: '🚗' },
    { number: '25+', label: 'Cities', icon: '🏙' }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const handleFindRideHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.transform = 'translateY(-3px)';
      e.target.style.boxShadow = '0 15px 40px rgba(38, 222, 129, 0.6)';
    } else {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 10px 30px rgba(38, 222, 129, 0.4)';
    }
  };

  const handleOfferRideHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.background = 'white';
      e.target.style.color = '#667eea';
      e.target.style.transform = 'translateY(-3px)';
    } else {
      e.target.style.background = 'transparent';
      e.target.style.color = 'white';
      e.target.style.transform = 'translateY(0)';
    }
  };

  const handleScrollToFeatures = () => {
    const featuresElement = document.getElementById('features');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 10s ease infinite',
    display: 'flex',
    alignItems: 'center',
    paddingTop: '80px',
    position: 'relative',
    overflow: 'hidden'
  };

  const contentStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'grid',
    gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
    gap: '4rem',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2
  };

  return (
    <section id="home" style={containerStyle}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '100px',
        height: '100px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>

      <div style={contentStyle}>
        {/* Left Side - Text Content */}
        <div className={isVisible ? 'slide-down' : ''}>
          <h1 style={{
            fontSize: window.innerWidth > 768 ? '3.5rem' : '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            lineHeight: '1.2'
          }}>
            Share Rides,
            <br />
            <span style={{
              background: 'linear-gradient(45deg, #26de81, #20bf6b)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Save Money
            </span>
            <br />
            Help the Planet{' '}
            <span 
              style={{
                display: 'inline-block',
                animation: 'bounce 2s infinite'
              }}
            >
              🌍
            </span>
          </h1>
          
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Join thousands of commuters who save money and reduce carbon footprint 
            by sharing rides. Find your perfect ride match in seconds.
          </p>
          
          {/* Animated Stats Counter */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            {stats.map((stat, index) => (
              <div 
                key={index}
                style={{
                  textAlign: 'center',
                  opacity: currentStat === index ? 1 : 0.7,
                  transform: currentStat === index ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.5s ease',
                  minWidth: '80px'
                }}
                className={currentStat === index ? 'animate-pulse' : ''}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '0.2rem'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA Buttons - Updated with onClick handlers */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={onFindRide}
              style={{
                padding: '1rem 2rem',
                background: '#26de81',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(38, 222, 129, 0.4)',
                transition: 'all 0.3s ease'
              }}
              className="hover-scale"
              onMouseEnter={(e) => handleFindRideHover(e, true)}
              onMouseLeave={(e) => handleFindRideHover(e, false)}
            >
              🚀 Find a Ride
            </button>
            
            <button 
              onClick={onOfferRide}
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              className="hover-scale"
              onMouseEnter={(e) => handleOfferRideHover(e, true)}
              onMouseLeave={(e) => handleOfferRideHover(e, false)}
            >
              💼 Offer a Ride
            </button>
          </div>
        </div>

        {/* Right Side - Visual Content */}
        <div 
          className={isVisible ? 'slide-up' : ''}
          style={{
            position: 'relative',
            textAlign: 'center'
          }}
        >
          {/* Phone Mockup */}
          <div 
            style={{
              width: '300px',
              height: '520px',
              background: 'white',
              borderRadius: '10px',
              margin: '10px auto',
              padding: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="animate-float"
          >
            {/* Phone Screen */}
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              position: 'relative'
            }}>
              {/* App Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🚗</span>
                <span style={{
                  fontWeight: 'bold',
                  color: '#667eea',
                  fontSize: '1.2rem'
                }}>
                  PoolRide
                </span>
              </div>
              
              {/* Search Section */}
              <div style={{
                background: 'white',
                padding: '15px',
                borderRadius: '15px',
                marginBottom: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666',
                  marginBottom: '10px'
                }}>
                  📍 From: New Delhi
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  📍 To: Noida
                </div>
              </div>
              
              {/* Ride Cards */}
              {[1, 2, 3].map((ride, index) => (
                <div key={ride} style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  opacity: index === 0 ? 1 : 0.7,
                  transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: ['#667eea', '#26de81', '#ff6b6b'][index],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem'
                  }}>
                    {['👨', '👩', '👨'][index]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      {['Rahul Kumar', 'Priya Singh', 'Amit Sharma'][index]}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#666'
                    }}>
                      ⭐ 4.{9-index} • ₹{80 + index*20}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Floating Action Button */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  width: '50px',
                  height: '50px',
                  background: '#26de81',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 15px rgba(38, 222, 129, 0.4)'
                }}
                className="animate-pulse"
              >
                ➕
              </div>
            </div>
          </div>
          
          {/* Floating Elements Around Phone */}
          <div 
            style={{
              position: 'absolute',
              top: '10%',
              left: '-10%',
              width: '60px',
              height: '60px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              animation: 'float 6s ease-in-out infinite'
            }}
          >
            💰
          </div>
          
          <div 
            style={{
              position: 'absolute',
              top: '20%',
              right: '-5%',
              width: '50px',
              height: '50px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              animation: 'float 6s ease-in-out infinite',
              animationDelay: '1s'
            }}
          >
            🌱
          </div>
          
          <div 
            style={{
              position: 'absolute',
              bottom: '15%',
              left: '5%',
              width: '70px',
              height: '70px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              animation: 'float 6s ease-in-out infinite',
              animationDelay: '2s'
            }}
          >
            🚗
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div 
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          textAlign: 'center',
          cursor: 'pointer',
          animation: 'bounce 2s infinite'
        }}
        onClick={handleScrollToFeatures}
      >
        <div style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
          Scroll to explore
        </div>
        <div style={{ fontSize: '1.5rem' }}>⬇</div>
      </div>
    </section>
  );
};

export default Hero;