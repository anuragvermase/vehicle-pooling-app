import React, { useState, useEffect } from 'react';
import '../styles/GlobalStyles.css';

const LandingNavbar = ({ onShowLogin, onShowRegister }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: isScrolled ? 'blur(10px)' : 'blur(5px)',
      boxShadow: isScrolled ? '0 2px 20px rgba(0,0,0,0.1)' : 'none',
      zIndex: 1000,
      padding: isScrolled ? '0.5rem 0' : '1rem 0',
      transition: 'all 0.3s ease'
    }} className="animate-fadeIn">
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        position: 'relative'
      }}>
        {/* Logo */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}
          className="hover-scale"
          onClick={() => scrollToSection('home')}
        >
          <span style={{ 
            fontSize: '2rem',
            animation: 'bounce 2s infinite'
          }}>
            🚗
          </span>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: isScrolled ? '#667eea' : 'white',
            transition: 'color 0.3s ease'
          }}>
            PoolRide
          </span>
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
          }}>
            {['home', 'features', 'how-it-works', 'contact'].map((section) => (
              <button 
                key={section}
                onClick={() => scrollToSection(section)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isScrolled ? '#333' : 'white',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize',
                  fontSize: '0.9rem'
                }}
                className="smooth-transition hover-scale"
                onMouseEnter={(e) => {
                  e.target.style.background = isScrolled ? '#f8f9fa' : 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                {section.replace('-', ' ')}
              </button>
            ))}
          </div>
        )}

        {/* Auth Buttons - Desktop */}
          <div style={{
            display: 'flex',
            gap: '1rem'
          }}>
            <button 
              onClick={onShowLogin}
              style={{
                padding: '0.5rem 1.5rem',
                border: `2px solid ${isScrolled ? '#667eea' : 'white'}`,
                background: 'transparent',
                color: isScrolled ? '#667eea' : 'white',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              className="hover-scale"
              onMouseEnter={(e) => {
                e.target.style.background = isScrolled ? '#667eea' : 'white';
                e.target.style.color = isScrolled ? 'white' : '#667eea';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = isScrolled ? '#667eea' : 'white';
              }}
            >
              Login
            </button>
            <button 
              onClick={onShowRegister}
              style={{
                padding: '0.5rem 1.5rem',
                border: 'none',
                background: '#25D67C',
                color: 'white',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              className="hover-scale animate-pulse"
              
            >
              Sign Up Free
            </button>
          </div>

        {/* Mobile Hamburger */}
        {isMobile && (
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div style={{
              width: '25px',
              height: '3px',
              background: isScrolled ? '#333' : 'white',
              margin: '2px 0',
              transition: 'all 0.3s ease',
              borderRadius: '2px',
              transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }}></div>
            <div style={{
              width: '25px',
              height: '3px',
              background: isScrolled ? '#333' : 'white',
              margin: '2px 0',
              transition: 'all 0.3s ease',
              borderRadius: '2px',
              opacity: isMenuOpen ? 0 : 1
            }}></div>
            <div style={{
              width: '25px',
              height: '3px',
              background: isScrolled ? '#333' : 'white',
              margin: '2px 0',
              transition: 'all 0.3s ease',
              borderRadius: '2px',
              transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
            }}></div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            borderRadius: '0 0 15px 15px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }} className="animate-fadeIn">
            {['home', 'features', 'how-it-works', 'contact'].map((section) => (
              <button 
                key={section}
                onClick={() => scrollToSection(section)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#333',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  textAlign: 'left',
                  textTransform: 'capitalize',
                  borderRadius: '8px',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                {section.replace('-', ' ')}
              </button>
            ))}
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '1rem',
              justifyContent: 'center'
            }}>
              <button 
                onClick={onShowLogin}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: '2px solid #667eea',
                  background: 'transparent',
                  color: '#667eea',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  flex: 1
                }}
              >
                Login
              </button>
              <button 
                onClick={onShowRegister}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  background: '#667eea',
                  color: 'white',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  flex: 1
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNavbar;