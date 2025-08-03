import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // EmailJS configuration - Replace with your actual keys
  const EMAILJS_SERVICE_ID = 'service_2310'; // Replace with your Service ID
  const EMAILJS_TEMPLATE_ID = 'template_y0tvylj'; // Replace with your Template ID
  const EMAILJS_PUBLIC_KEY = 'HxzRBZT94MH-PcTzg'; // Replace with your Public Key

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      setIsLoading(false);
      return;
    }

    try {
      // Prepare template parameters for EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || 'Not provided',
        subject: formData.subject,
        message: formData.message,
        to_email: 'adhattarwal745@gmail.com', // Your receiving email
      };

      console.log('Sending email with params:', templateParams);

      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully:', result);

      if (result.status === 200) {
        setStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.'
        });
        // Reset form
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      setStatus({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again or contact us directly at adhattarwal745@gmail.com'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    { icon: '📍', title: 'Address', info: 'Bangalore, Karnataka, India 560001' },
    { icon: '📞', title: 'Phone', info: '+91 98765 43210' },
    { icon: '✉', title: 'Email', info: 'adhattarwal745@gmail.com' },
    { icon: '🕒', title: 'Support Hours', info: '24/7 Available' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)', width: '100%', margin: 0, padding: 0 }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%' }}>
        <div style={{ width: '100%', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#a29bfe', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ width: '100%', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>Contact Us</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', marginBottom: '3rem' }}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '3rem', width: '100%' }}>
            {/* Contact Form */}
            <div style={{ width: '100%' }}>
              <h3 style={{ fontSize: '1.8rem', color: '#2c3e50', marginBottom: '2rem' }}>Send us a Message</h3>
              
              {/* Status Message */}
              {status.message && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  background: status.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: status.type === 'success' ? '#155724' : '#721c24',
                  border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                  fontSize: '0.95rem'
                }}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    style={{
                      padding: '1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      opacity: isLoading ? 0.6 : 1,
                      transition: 'border-color 0.3s',
                      borderColor: formData.name ? '#6c5ce7' : '#ddd'
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    style={{
                      padding: '1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      opacity: isLoading ? 0.6 : 1,
                      transition: 'border-color 0.3s',
                      borderColor: formData.email ? '#6c5ce7' : '#ddd'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                    style={{
                      padding: '1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      opacity: isLoading ? 0.6 : 1,
                      transition: 'border-color 0.3s',
                      borderColor: formData.phone ? '#6c5ce7' : '#ddd'
                    }}
                  />
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject *"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    style={{
                      padding: '1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      opacity: isLoading ? 0.6 : 1,
                      transition: 'border-color 0.3s',
                      borderColor: formData.subject ? '#6c5ce7' : '#ddd'
                    }}
                  />
                </div>
                <textarea
                  name="message"
                  placeholder="Your Message *"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    resize: 'vertical',
                    outline: 'none',
                    opacity: isLoading ? 0.6 : 1,
                    transition: 'border-color 0.3s',
                    borderColor: formData.message ? '#6c5ce7' : '#ddd',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: isLoading ? '#ccc' : '#6c5ce7',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.3s'
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      📤 Send Message
                    </>
                  )}
                </button>
              </form>

              {/* Quick Response Guarantee - Added directly below the form with no gap */}
              <div style={{ 
                background: 'linear-gradient(135deg, #e8f5e8, #f0fff0)', 
                padding: '1.5rem', 
                borderRadius: '10px', 
                border: '2px solid #28a745',
                position: 'relative',
                overflow: 'hidden',
                margin: 0
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#28a745',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '0 0 0 10px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  ⚡ GUARANTEED
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                  <div style={{ fontSize: '2rem' }}>🚀</div>
                  <h4 style={{ color: '#155724', margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Quick Response Guarantee
                  </h4>
                </div>
                <div style={{ color: '#155724', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span>⏰</span>
                    <strong>Business Hours:</strong> Response within 2-4 hours
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span>🌙</span>
                    <strong>After Hours:</strong> Response within 24 hours
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🆘</span>
                    <strong>Emergency:</strong> Immediate support available 24/7
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ width: '100%' }}>
              <h3 style={{ fontSize: '1.8rem', color: '#2c3e50', marginBottom: '2rem' }}>Get in Touch</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {contactInfo.map((info, index) => (
                  <div key={index} style={{
                    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'transform 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
                  >
                    <div style={{ fontSize: '2rem' }}>{info.icon}</div>
                    <div>
                      <h4 style={{ color: '#2c3e50', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{info.title}</h4>
                      <p style={{ color: '#666', margin: 0 }}>{info.info}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Office Hours */}
              <div style={{ background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)', padding: '2rem', borderRadius: '15px', marginTop: '2rem', color: 'white', textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>📅 Office Hours</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div>Monday - Friday: 9:00 AM - 8:00 PM</div>
                  <div>Saturday: 10:00 AM - 6:00 PM</div>
                  <div>Sunday: 10:00 AM - 4:00 PM</div>
                  <div>🚨 Emergency Support: 24/7</div>
                </div>
              </div>

              {/* Additional Support Info */}
              <div style={{ background: '#fff3cd', padding: '1.5rem', borderRadius: '10px', marginTop: '1rem', border: '1px solid #ffeaa7' }}>
                <h4 style={{ color: '#856404', margin: '0 0 0.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  💬 Multiple Ways to Reach Us
                </h4>
                <p style={{ color: '#856404', margin: 0, fontSize: '0.9rem' }}>
                  Contact us via form, email, or phone. We're here to help with rides, 
                  technical support, and any questions about PoolRide services.
                </p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div style={{ marginTop: '3rem', background: '#f8f9fa', padding: '2rem', borderRadius: '15px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>🗺 Find Us</h3>
            <div style={{
              background: 'linear-gradient(135deg, #e9ecef, #dee2e6)',
              height: '300px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '1.1rem',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '3rem' }}>🏢</div>
              <div>
                <strong>PoolRide Headquarters</strong><br />
                Bangalore, Karnataka, India<br />
                <small style={{ color: '#888' }}>Interactive map coming soon</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for loading spinner animation */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus, textarea:focus {
          border-color: #6c5ce7 !important;
          box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1) !important;
        }
        
        button:hover:not(:disabled) {
          background: #5b4cdb !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default ContactUs;