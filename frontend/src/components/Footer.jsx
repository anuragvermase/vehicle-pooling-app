import React from 'react';

const Footer = () => {
  return (
    <footer id="contact" style={{
      background: '#2c3e50',
      color: 'white',
      padding: '3rem 0 1rem 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Company Info */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '2rem' }}>🚗</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                PoolRide
              </span>
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              Making commuting affordable, sustainable, and social. 
              Join the ride-sharing revolution today!
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" style={{
                color: 'white',
                fontSize: '1.5rem',
                textDecoration: 'none'
              }}>📘</a>
              <a href="#" style={{
                color: 'white',
                fontSize: '1.5rem',
                textDecoration: 'none'
              }}>🐦</a>
              <a href="#" style={{
                color: 'white',
                fontSize: '1.5rem',
                textDecoration: 'none'
              }}>📸</a>
              <a href="#" style={{
                color: 'white',
                fontSize: '1.5rem',
                textDecoration: 'none'
              }}>💼</a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Company
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <a href="/about" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                About Us
              </a>
              <a href="/team" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Our Team
              </a>
              <a href="/support" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Support
              </a>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Support
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <a href="/help" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Help Center
              </a>
              <a href="/safety" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Safety
              </a>
              <a href="/contact" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Contact Us
              </a>
              <a href="/faq" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                FAQs
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Contact Info
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              <div>📍 Bangalore, India</div>
              <div>📞 +91 98765 43210</div>
              <div>✉ hello@poolride.com</div>
              <div>🕒 24/7 Support</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: '1rem',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.6)'
        }}>
<p>© 2025 PoolRide. All rights reserved. | <a href="/privacy" style={{color: 'rgba(255,255,255,0.6)', textDecoration: 'none'}}>Privacy Policy</a> | <a href="/terms" style={{color: 'rgba(255,255,255,0.6)', textDecoration: 'none'}}>Terms of Service</a></p>        </div>
      </div>
    </footer>
  );
};

export default Footer;