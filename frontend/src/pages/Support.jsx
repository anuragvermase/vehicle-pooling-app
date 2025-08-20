import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import LiveChat from '../components/LiveChat';
import CallUs from '../components/CallUs';

const Support = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('submit-ticket');
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showCallUs, setShowCallUs] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // EmailJS configuration - Replace with your actual keys
  const EMAILJS_SERVICE_ID = 'service_2310';
  const EMAILJS_TEMPLATE_ID_SUPPORT = 'template_ip4mkvw';
  const EMAILJS_PUBLIC_KEY = 'HxzRBZT94MH-PcTzg';

  const issueTypes = [
    'Account Issues',
    'Ride Booking Problems',
    'Payment Issues',
    'Safety Concerns',
    'App Technical Issues',
    'Driver/Rider Complaints',
    'Refund Request',
    'Feature Request',
    'Other'
  ];

  // Handle Live Chat - Close Call Us if open
  const handleLiveChat = () => {
    setShowCallUs(false); // Close Call Us popup
    setShowLiveChat(true); // Open Live Chat
  };

  // Handle Call Us - Close Live Chat if open
  const handleCallUs = () => {
    setShowLiveChat(false); // Close Live Chat popup
    setShowCallUs(true); // Open Call Us
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    if (!formData.name || !formData.email || !formData.issueType || !formData.subject || !formData.message) {
      setStatus({ 
        type: 'error', 
        message: 'Please fill in all required fields.' 
      });
      setIsLoading(false);
      return;
    }

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        issue_type: formData.issueType,
        subject: formData.subject,
        message: formData.message,
        to_email: 'adhattarwal745@gmail.com',
        ticket_id: `SUPPORT-${Date.now()}`,
      };

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_SUPPORT,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (result.status === 200) {
        setStatus({ 
          type: 'success', 
          message: `Thank you! Your support ticket has been submitted successfully. Ticket ID: SUPPORT-${Date.now()}. We'll get back to you within 24 hours.`
        });
        setFormData({ name: '', email: '', issueType: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Support email sending failed:', error);
      setStatus({ 
        type: 'error', 
        message: 'Sorry, there was an error submitting your support ticket. Please try again or contact us directly at adhattarwal745@gmail.com' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const supportOptions = [
    { 
      icon: '🎫', 
      title: 'Submit a Ticket', 
      description: 'Get personalized help for your specific issue',
      action: () => setActiveTab('submit-ticket')
    },
    { 
      icon: '❓', 
      title: 'FAQ', 
      description: 'Find quick answers to common questions',
      action: () => navigate('/faq')
    },
    { 
      icon: '💬', 
      title: 'Live Chat', 
      description: 'Chat with our AI assistant instantly',
      action: handleLiveChat // Updated to use new handler
    },
    { 
      icon: '📞', 
      title: 'Call Us', 
      description: 'Speak directly with our support team',
      action: handleCallUs // Updated to use new handler
    }
  ];

  const quickHelp = [
    { title: 'How to book a ride?', link: '/help#booking' },
    { title: 'Payment issues', link: '/help#payment' },
    { title: 'Account settings', link: '/help#account' },
    { title: 'Safety guidelines', link: '/safety' },
    { title: 'Cancellation policy', link: '/help#cancellation' },
    { title: 'Driver requirements', link: '/help#driver' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      width: '100%',
      margin: 0,
      padding: 0
    }}>
      {/* Header - Full Width */}
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        padding: '1rem 0', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%'
      }}>
        <div style={{ 
          width: '100%',
          padding: '0 2rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide Support</span>
          </div>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: '#74b9ff', 
              color: 'white', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content - Full Width */}
      <div style={{ 
        width: '100%', 
        padding: '2rem 1rem' // Reduced padding for full width
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '15px', 
          padding: '2rem', // Reduced padding
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: 'none' // Remove max-width constraint
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            color: '#2c3e50', 
            marginBottom: '1rem', 
            textAlign: 'center' 
          }}>
            🆘 Support Center
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#666', 
            textAlign: 'center', 
            marginBottom: '3rem' 
          }}>
            We're here to help! Choose how you'd like to get support.
          </p>

          {/* Support Options - Full Width Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Increased min width
            gap: '2rem', 
            marginBottom: '3rem',
            width: '100%'
          }}>
            {supportOptions.map((option, index) => (
              <div 
                key={index} 
                onClick={option.action}
                style={{
                  background: activeTab === 'submit-ticket' && option.title === 'Submit a Ticket' 
                    ? 'linear-gradient(135deg, #74b9ff, #0984e3)' 
                    : 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  color: activeTab === 'submit-ticket' && option.title === 'Submit a Ticket' ? 'white' : '#2c3e50',
                  padding: '2rem',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!(activeTab === 'submit-ticket' && option.title === 'Submit a Ticket')) {
                    e.target.style.transform = 'translateY(-5px)';
                    e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{option.icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{option.title}</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>{option.description}</p>
              </div>
            ))}
          </div>

          {/* Support Ticket Form - Full Width */}
          {activeTab === 'submit-ticket' && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '2rem', 
              borderRadius: '15px', 
              marginBottom: '3rem',
              width: '100%'
            }}>
              <h2 style={{ color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>🎫 Submit Support Ticket</h2>
              
              {/* Status Message */}
              {status.message && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  background: status.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: status.type === 'success' ? '#155724' : '#721c24',
                  border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                  fontSize: '0.95rem',
                  width: '100%'
                }}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '1rem', 
                  marginBottom: '1rem',
                  width: '100%'
                }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Full Name *"
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
                      borderColor: formData.name ? '#74b9ff' : '#ddd',
                      width: '100%'
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email Address *"
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
                      borderColor: formData.email ? '#74b9ff' : '#ddd',
                      width: '100%'
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '1rem', 
                  marginBottom: '1rem',
                  width: '100%'
                }}>
                  <select
                    name="issueType"
                    value={formData.issueType}
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
                      borderColor: formData.issueType ? '#74b9ff' : '#ddd',
                      background: 'white',
                      width: '100%'
                    }}
                  >
                    <option value="">Select Issue Type *</option>
                    {issueTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject/Brief Description *"
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
                      borderColor: formData.subject ? '#74b9ff' : '#ddd',
                      width: '100%'
                    }}
                  />
                </div>

                <textarea
                name="message"
                  placeholder="Describe your issue in detail *"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
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
                    borderColor: formData.message ? '#74b9ff' : '#ddd',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />

                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{
                    background: isLoading ? '#ccc' : 'linear-gradient(135deg, #74b9ff, #0984e3)',
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
                    transition: 'all 0.3s'
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
                      Submitting Ticket...
                    </>
                  ) : (
                    <>
                      🎫 Submit Support Ticket
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quick Help Section - Full Width */}
          <div style={{ marginBottom: '3rem', width: '100%' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>🚀 Quick Help</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '1rem',
              width: '100%'
            }}>
              {quickHelp.map((item, index) => (
                <div 
                  key={index}
                  onClick={() => navigate(item.link)}
                  style={{
                    background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                    padding: '1rem 1.5rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #74b9ff, #0984e3)';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #fff, #f8f9fa)';
                    e.target.style.color = '#2c3e50';
                    e.target.style.transform = 'translateX(0px)';
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: '500' }}>{item.title}</span>
                  <span style={{ fontSize: '1.2rem' }}>→</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact - Full Width */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fd79a8, #e84393)', 
            color: 'white', 
            padding: '2rem',
            borderRadius: '15px', 
            textAlign: 'center',
            marginBottom: '2rem',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🚨 Emergency Support</h3>
            <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
              For urgent issues that require immediate attention
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => window.open('tel:123457890')}
                style={{ 
                  color: 'white', 
                  textDecoration: 'none', 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                📞 Call: 123-457-890
              </button>
              <a 
                href="mailto:adhattarwal745@gmail.com" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none', 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '25px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ✉ Email: Emergency Support
              </a>
            </div>
          </div>

          {/* Support Statistics - Full Width */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            width: '100%'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #00b894, #00a085)', 
              color: 'white', 
              padding: '2rem', 
              borderRadius: '15px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>2-4 hrs</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Average Response Time</div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #fdcb6e, #e17055)', 
              color: 'white', 
              padding: '2rem', 
              borderRadius: '15px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>😊</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>98%</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Customer Satisfaction</div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)', 
              color: 'white', 
              padding: '2rem', 
              borderRadius: '15px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>24/7</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Support Available</div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #74b9ff, #0984e3)', 
              color: 'white', 
              padding: '2rem', 
              borderRadius: '15px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>95%</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>First Contact Resolution</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Component - Positioned in right middle */}
      <LiveChat 
        isOpen={showLiveChat} 
        onClose={() => setShowLiveChat(false)} 
      />

      {/* Call Us Component - Positioned in right middle */}
      <CallUs 
        isOpen={showCallUs} 
        onClose={() => setShowCallUs(false)} 
      />

      {/* Add CSS for animations */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          } 40% {
            transform: scale(1);
          }
        }
        
        input:focus, textarea:focus, select:focus {
          border-color: #74b9ff !important;
          box-shadow: 0 0 0 3px rgba(116, 185, 255, 0.1) !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(116, 185, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Support;