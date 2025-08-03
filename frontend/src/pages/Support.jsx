import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', issue: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Support ticket submitted! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', issue: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const supportOptions = [
    { icon: '💬', title: 'Live Chat', description: 'Chat with our support team instantly', action: 'Start Chat' },
    { icon: '📞', title: 'Phone Support', description: 'Call us at +91 98765 43210', action: 'Call Now' },
    { icon: '📧', title: 'Email Support', description: 'Send us an email at support@poolride.com', action: 'Send Email' },
    { icon: '📋', title: 'Submit Ticket', description: 'Create a support ticket for detailed issues', action: 'Create Ticket' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#74b9ff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>Support Center</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', marginBottom: '3rem' }}>
            We're here to help! Choose how you'd like to get support.
          </p>

          {/* Support Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {supportOptions.map((option, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                padding: '2rem',
                borderRadius: '15px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{option.icon}</div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>{option.title}</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>{option.description}</p>
                <button style={{
                  background: '#74b9ff',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  {option.action}
                </button>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div style={{ background: 'linear-gradient(135deg, #dfe6e9, #b2bec3)', padding: '3rem', borderRadius: '15px' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '2rem', textAlign: 'center', fontSize: '1.8rem' }}>Send us a Message</h3>
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ padding: '1rem', border: 'none', borderRadius: '8px', fontSize: '1rem' }}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ padding: '1rem', border: 'none', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>
              <select
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: '8px', fontSize: '1rem', marginBottom: '1rem' }}
              >
                <option value="">Select Issue Type</option>
                <option value="payment">Payment Issues</option>
                <option value="booking">Booking Problems</option>
                <option value="safety">Safety Concerns</option>
                <option value="account">Account Issues</option>
                <option value="other">Other</option>
              </select>
              <textarea
                name="message"
                placeholder="Describe your issue..."
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: '8px', fontSize: '1rem', marginBottom: '1rem', resize: 'vertical' }}
              />
              <button type="submit" style={{
                background: '#0984e3',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%'
              }}>
                Submit Support Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;