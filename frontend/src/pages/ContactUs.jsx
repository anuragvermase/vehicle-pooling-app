import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    { icon: '📍', title: 'Address', info: 'Bangalore, Karnataka, India 560001' },
    { icon: '📞', title: 'Phone', info: '+91 98765 43210' },
    { icon: '✉', title: 'Email', info: 'hello@poolride.com' },
    { icon: '🕒', title: 'Support Hours', info: '24/7 Available' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>Contact Us</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', marginBottom: '3rem' }}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '3rem' }}>
            {/* Contact Form */}
            <div>
              <h3 style={{ fontSize: '1.8rem', color: '#2c3e50', marginBottom: '2rem' }}>Send us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ padding: '1rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ padding: '1rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ padding: '1rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                  />
                  <input
                    type="text" 
                    name="subject"
                    placeholder="Subject *"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{ padding: '1rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
                <textarea
                  name="message"
                  placeholder="Your Message *"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  style={{ width: '100%', padding: '1rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', marginBottom: '1rem', resize: 'vertical', outline: 'none' }}
                />
                <button type="submit" style={{
                  background: '#6c5ce7',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%'
                }}>
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h3 style={{ fontSize: '1.8rem', color: '#2c3e50', marginBottom: '2rem' }}>Get in Touch</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {contactInfo.map((info, index) => (
                  <div key={index} style={{
                    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
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
                <h4 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Office Hours</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div>Monday - Friday: 9:00 AM - 8:00 PM</div>
                  <div>Saturday: 10:00 AM - 6:00 PM</div>
                  <div>Sunday: 10:00 AM - 4:00 PM</div>
                  <div>Emergency Support: 24/7</div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div style={{ marginTop: '3rem', background: '#f8f9fa', padding: '2rem', borderRadius: '15px', textAlign: 'center' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Find Us</h3>
            <div style={{ 
              background: '#ddd', 
              height: '300px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#666',
              fontSize: '1.1rem'
            }}>
              🗺 Interactive Map Coming Soon<br />
              <small>Located in the heart of Bangalore</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;