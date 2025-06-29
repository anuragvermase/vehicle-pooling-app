import React, { useState, useEffect } from 'react';
import '../styles/GlobalStyles.css';

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: 1,
      title: 'Sign Up',
      description: 'Create your account in seconds with email or phone number. Verify your profile for safety.',
      icon: '📝',
      details: ['Quick registration', 'Profile verification', 'Add preferences', 'Upload photo'],
      color: '#667eea'
    },
    {
      step: 2,
      title: 'Find Rides',
      description: 'Search for rides by entering your pickup and drop locations. Filter by time, price, and preferences.',
      icon: '🔍',
      details: ['Enter destinations', 'Set time preferences', 'Filter options', 'View matches'],
      color: '#26de81'
    },
    {
      step: 3,
      title: 'Book & Pay',
      description: 'Select your preferred ride and book instantly. Pay securely through multiple payment options.',
      icon: '💳',
      details: ['Choose ride', 'Instant booking', 'Secure payment', 'Get confirmation'],
      color: '#ff6b6b'
    },
    {
      step: 4,
      title: 'Enjoy Ride',
      description: 'Track your ride in real-time, connect with your co-passengers, and enjoy the journey safely.',
      icon: '🚗',
      details: ['Real-time tracking', 'Chat with riders', 'Safe journey', 'Rate & review'],
      color: '#20bf6b'
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

    const element = document.getElementById('how-it-works');
    if (element) {
      observer.observe(element);
    }
    // Auto-advance steps
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => {
      if (element) observer.unobserve(element);
      clearInterval(interval);
    };
  }, []);

  return (
    <section 
      id="how-it-works" 
      style={{
        padding: '5rem 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Animation */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        animation: 'moveBackground 20s linear infinite'
      }}></div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }} className={isVisible ? 'animate-fadeIn' : ''}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}>
            How PoolRide Works 🚀
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Getting started is easy! Follow these simple steps to start saving money 
            and traveling smarter.
          </p>
        </div>

        {/* Interactive Timeline */}
        <div style={{
          marginBottom: '4rem'
        }} className={isVisible ? 'animate-slideInUp' : ''}>
          {/* Desktop Timeline */}
          {window.innerWidth > 768 && (
            <div style={{
              position: 'relative',
              padding: '2rem 0'
            }}>
              {/* Timeline Line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '4px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                transform: 'translateY(-50%)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${((activeStep + 1) / steps.length) * 100}%`,
                  background: 'white',
                  borderRadius: '2px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>

              {/* Timeline Steps */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 10%'
              }}>
                {steps.map((step, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setActiveStep(index)}
                  >
                    {/* Step Circle */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: index <= activeStep ? 'white' : 'rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      marginBottom: '1rem',
                      transition: 'all 0.3s ease',
                      border: `4px solid ${index <= activeStep ? 'white' : 'rgba(255,255,255,0.5)'}`,
                      transform: index === activeStep ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: index === activeStep ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'
                    }} className={index === activeStep ? 'animate-bounce' : ''}>
                      {step.icon}
                    </div>

                    {/* Step Info */}
                    <div style={{
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{
                        fontSize: '0.9rem',
                        opacity: 0.8,
                        marginBottom: '0.25rem'
                      }}>
                        Step {step.step}
                      </div>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '600'
                      }}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Timeline */}
          {window.innerWidth <= 768 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {steps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: index === activeStep ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setActiveStep(index)}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: index <= activeStep ? 'white' : 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ color: 'white' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Step {step.step}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{step.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Step Details */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          marginBottom: '3rem'
        }} className={isVisible ? 'animate-slideInUp' : ''}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '3rem',
            alignItems: 'center'
          }}>
            {/* Step Content */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${steps[activeStep].color}, ${steps[activeStep].color}CC)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  color: 'white'
                }}>
                  {steps[activeStep].step}
                </div>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '0.25rem'
                  }}>
                    Step {steps[activeStep].step}
                  </div>
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: steps[activeStep].color,
                    margin: 0
                  }}>
                    {steps[activeStep].title}
                  </h3>
                </div>
              </div>

              <p style={{
                fontSize: '1.1rem',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '2rem'
              }}>
                {steps[activeStep].description}
              </p>

              {/* Step Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                {steps[activeStep].details.map((detail, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: `${steps[activeStep].color}10`,
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    color: '#555'
                  }}>
                    <span style={{ 
                      color: steps[activeStep].color,
                      fontSize: '1.2rem'
                    }}>
                      ✓
                    </span>
                    {detail}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Visualization */}
            <div style={{
              position: 'relative',
              textAlign: 'center'
            }}>
              <div style={{
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: `conic-gradient(${steps[activeStep].color} ${((activeStep + 1) / steps.length) * 360}deg, #f3f4f6 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                position: 'relative'
              }}>
                <div style={{
                  width: '250px',
                  height: '250px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6rem'
                }} className="animate-float">
                  {steps[activeStep].icon}
                </div>

                {/* Progress Text */}
                <div style={{
                  position: 'absolute',
                  bottom: '-2rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: steps[activeStep].color,
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}>
                  {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{
          textAlign: 'center'
        }} className={isVisible ? 'animate-fadeIn' : ''}>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}>
            Ready to Start Your Journey? 🌟
          </h3>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem'
          }}>
            Join thousands of happy commuters saving money and time every day!
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button style={{
              padding: '1rem 2rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            className="hover-scale"
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.05)';
              e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}
            >
              <span>🚀</span>
              Start Now - It's Free!
            </button>
            
            <button style={{
              padding: '1rem 2rem',
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            className="hover-scale"
            onMouseEnter={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(-3px) scale(1.05)';
            }}

            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(0) scale(1)';
            }}
            >
              <span>📱</span>
              Download App
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        animation: 'float 8s ease-in-out infinite 2s'
      }}></div>
    </section>
  );
};

export default HowItWorks;