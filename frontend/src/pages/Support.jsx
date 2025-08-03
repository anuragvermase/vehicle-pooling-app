import React, { useState, useRef } from 'react';
import LiveChat from '../components/LiveChat';
import CallUs from '../components/CallUs';

const Support = () => {
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showCallUs, setShowCallUs] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    priority: 'Medium',
    subject: '',
    description: ''
  });
  
  const supportTicketRef = useRef(null);

  const handleLiveChat = () => {
    setShowCallUs(false);
    setShowLiveChat(true);
  };

  const handleCallUs = () => {
    setShowLiveChat(false);
    setShowCallUs(true);
  };

  const handleRedirectToSupport = () => {
    // Scroll to support ticket section
    if (supportTicketRef.current) {
      supportTicketRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Support ticket submitted successfully! We will get back to you within 24 hours.');
    setFormData({
      name: '',
      email: '',
      category: '',
      priority: 'Medium',
      subject: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '1400px', 
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          color: 'white'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🆘 PoolRide Support Center
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            We're here to help! Choose how you'd like to get support.
          </p>
        </div>

        {/* Support Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Live Chat Option */}
          <div 
            onClick={handleLiveChat}
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              border: '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-10px) scale(1.02)';
              e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
              e.target.style.borderColor = '#74b9ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              fontSize: '2.5rem'
            }}>
              💬
            </div>
            <h3 style={{ 
              color: '#2c3e50', 
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              Live Chat
            </h3>
            <p style={{ 
              color: '#666', 
              marginBottom: '1.5rem',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              Get instant help from our AI assistant or connect with a human agent for personalized support.
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              display: 'inline-block',
              fontWeight: 'bold'
            }}>
              Start Chat →
            </div>
          </div>

          {/* Phone Support Option */}
          <div 
            onClick={handleCallUs}
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              border: '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-10px) scale(1.02)';
              e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
              e.target.style.borderColor = '#00b894';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #00b894, #00a085)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              fontSize: '2.5rem'
            }}>
              📞
            </div>
            <h3 style={{ 
              color: '#2c3e50', 
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              Call Support
            </h3>
            <p style={{ 
              color: '#666', 
              marginBottom: '1.5rem',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              Speak directly with our support team. Choose from different departments for specialized help.
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #00b894, #00a085)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              display: 'inline-block',
              fontWeight: 'bold'
            }}>
              Call Now →
            </div>
          </div>

          {/* Email Support Option */}
          <div 
            onClick={handleRedirectToSupport}
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              border: '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-10px) scale(1.02)';
              e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
              e.target.style.borderColor = '#e17055';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              e.target.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #e17055, #d63031)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              fontSize: '2.5rem'
            }}>
              ✉
            </div>
            <h3 style={{ 
              color: '#2c3e50', 
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              Submit Ticket
            </h3>
            <p style={{ 
              color: '#666', 
              marginBottom: '1.5rem',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              Send us a detailed message about your issue. We'll respond within 24 hours with a solution.
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #e17055, #d63031)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              display: 'inline-block',
              fontWeight: 'bold'
            }}>
              Submit Ticket →
            </div>
          </div>
        </div>

        {/* Support Ticket Form */}
        <div 
          ref={supportTicketRef}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '3rem',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
            marginBottom: '3rem'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ 
              color: '#2c3e50', 
              marginBottom: '1rem',
              fontSize: '2.2rem'
            }}>
              🎫 Submit Support Ticket
            </h2>
            <p style={{ 
              color: '#666', 
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {/* Name Field */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#2c3e50',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#74b9ff'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#2c3e50',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#74b9ff'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  placeholder="Enter your email address"
                />
              </div>

              {/* Category Field */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#2c3e50',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#74b9ff'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                >
                  <option value="">Select a category</option>
                  <option value="booking">🚗 Booking Issues</option>
                  <option value="payment">💳 Payment & Billing</option>
                  <option value="account">👤 Account Problems</option>
                  <option value="safety">🛡 Safety Concerns</option>
                  <option value="driver">👨‍💼 Driver Support</option>
                  <option value="technical">🔧 Technical Issues</option>
                  <option value="other">❓ Other</option>
                </select>
              </div>

              {/* Priority Field */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#2c3e50',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}>
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    background: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#74b9ff'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                >
                  <option value="Low">🟢 Low - General inquiry</option>
                  <option value="Medium">🟡 Medium - Standard issue</option>
                  <option value="High">🟠 High - Urgent matter</option>
                  <option value="Critical">🔴 Critical - Emergency</option>
                </select>
              </div>
            </div>

            {/* Subject Field */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#2c3e50',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#74b9ff'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                placeholder="Brief description of your issue"
              />
            </div>

            {/* Description Field */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#2c3e50',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="6"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#74b9ff'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                placeholder="Please provide detailed information about your issue, including steps to reproduce the problem if applicable..."
              />
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #e17055, #d63031)',
                  color: 'white',
                  border: 'none',
                  padding: '1.2rem 3rem',
                  borderRadius: '30px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 5px 15px rgba(225, 112, 85, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(225, 112, 85, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 5px 15px rgba(225, 112, 85, 0.4)';
                }}
              >
                🎫 Submit Support Ticket
              </button>
            </div>
          </form>
        </div>

        {/* FAQ Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ 
              color: '#2c3e50', 
              marginBottom: '1rem',
              fontSize: '2.2rem'
            }}>
              ❓ Frequently Asked Questions
            </h2>
            <p style={{ 
              color: '#666', 
              fontSize: '1.1rem'
            }}>
              Quick answers to common questions
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                question: "How do I book a ride?",
                answer: "Open the app, enter your pickup and destination, choose your ride type, and confirm your booking. You'll see driver details once matched."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept credit/debit cards, PayPal, Apple Pay, Google Pay, and cash (in select cities). You can manage payment methods in your account settings."
              },
              {
                question: "How do I cancel a ride?",
                answer: "You can cancel through the app before your driver arrives. Cancellations within 5 minutes are free, after that a small fee may apply."
              },
              {
                question: "What if I left something in the vehicle?",
                answer: "Contact the driver through the app first. If unsuccessful, use our lost items form in the app or contact support immediately."
              },
              {
                question: "How do I become a driver?",
                answer: "Visit our driver signup page, meet the requirements (age 21+, valid license, insurance, clean record), and complete the application process."
              },
              {
                question: "Is my ride safe?",
                answer: "Yes! All drivers undergo background checks, vehicles are inspected, and we provide real-time GPS tracking, emergency buttons, and 24/7 support."
              }
            ].map((faq, index) => (
              <div key={index} style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #eee'
              }}>
                <h4 style={{
                  color: '#2c3e50',
                  marginBottom: '1rem',
                  fontSize: '1.1rem'
                }}>
                  {faq.question}
                </h4>
                <p style={{
                  color: '#666',
                  lineHeight: '1.6',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Chat Component */}
      <LiveChat 
        isOpen={showLiveChat} 
        onClose={() => setShowLiveChat(false)} 
      />

      {/* Call Us Component */}
      <CallUs 
        isOpen={showCallUs} 
        onClose={() => setShowCallUs(false)}
        onOpenLiveChat={handleLiveChat}
        onRedirectToSupport={handleRedirectToSupport}
      />
    </div>
  );
};

export default Support;