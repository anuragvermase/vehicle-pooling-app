import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';

const LiveChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const messagesEndRef = useRef(null);

  // EmailJS configuration
  const EMAILJS_SERVICE_ID = 'your_service_id';
  const EMAILJS_TEMPLATE_ID = 'your_template_id';
  const EMAILJS_PUBLIC_KEY = 'your_public_key';

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          text: "Hi there! 👋 I'm your PoolRide AI assistant. What's your name?",
          sender: 'bot',
          timestamp: new Date()
        }]);
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showTypingIndicator = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (!userName && !lowerMessage.includes('book') && !lowerMessage.includes('help')) {
      setUserName(message);
      return `Nice to meet you, ${message}! 😊 How can I help you today?`;
    }

    if (lowerMessage.includes('book') || lowerMessage.includes('ride') || lowerMessage.includes('trip')) {
      return "🚗 To book a ride:\n1. Open our app or website\n2. Enter pickup & destination\n3. Choose ride type\n4. Confirm booking\n\nNeed help with a specific step?";
    }

    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('bill') || lowerMessage.includes('charge')) {
      return "💳 For payment issues:\n• Check your payment method\n• Verify billing details\n• Contact support for refunds\n\nNeed to speak with billing team?";
    }

    if (lowerMessage.includes('account') || lowerMessage.includes('login') || lowerMessage.includes('password') || lowerMessage.includes('profile')) {
      return "👤 Account help:\n• Reset password via 'Forgot Password'\n• Update profile in settings\n• Contact us for account issues\n\nWhat specific account issue are you facing?";
    }

    if (lowerMessage.includes('safety') || lowerMessage.includes('emergency') || lowerMessage.includes('unsafe') || lowerMessage.includes('danger')) {
      return "🚨 Safety is our priority!\n• Emergency: Call 911 immediately\n• Report unsafe driver/rider\n• Share trip details with contacts\n\nFor immediate safety concerns, please call our emergency line: 123-457-890";
    }

    if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
      return "❌ Cancellation policy:\n• Free cancellation within 5 minutes\n• Small fee after 5 minutes\n• Full refund for driver cancellation\n\nNeed help canceling a ride?";
    }

    if (lowerMessage.includes('driver') || lowerMessage.includes('become driver') || lowerMessage.includes('drive')) {
      return "🚗 Driver information:\n• Age 21+ required\n• Valid license & insurance\n• Background check\n• Vehicle inspection\n\nInterested in becoming a driver?";
    }

    if (lowerMessage.includes('human') || lowerMessage.includes('agent') || lowerMessage.includes('support') || lowerMessage.includes('help me') || lowerMessage.includes('speak to someone')) {
      setShowContactForm(true);
      return "🙋‍♂ I'd be happy to connect you with a human agent! Please provide your email address and I'll have someone contact you within 2-4 hours.";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello ${userName || 'there'}! 👋 I'm here to help with:\n🚗 Ride booking\n💳 Payment issues\n👤 Account problems\n🛡 Safety concerns\n\nWhat can I help you with?`;
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! 😊 Is there anything else I can help you with today?";
    }

    return "I'm here to help! 🤖 You can ask me about:\n• Booking rides\n• Payment issues\n• Account problems\n• Safety concerns\n• Driver information\n\nOr type 'human' to speak with our support team!";
  };

  const sendMessage = () => {
    if (inputMessage.trim() === '') return;

    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    showTypingIndicator();

    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage = {
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1500);
  };

  const sendQuickReply = (reply) => {
    setInputMessage(reply);
    setTimeout(() => sendMessage(), 100);
  };

  const sendContactRequest = async () => {
    if (!userEmail) {
      alert('Please enter your email address');
      return;
    }

    try {
      const templateParams = {
        from_name: userName || 'Chat User',
        from_email: userEmail,
        message: `User requested human support via live chat. Chat history: ${messages.map(m => `${m.sender}: ${m.text}`).join('\n')}`,
        to_email: 'adhattarwal745@gmail.com'
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      const confirmMessage = {
        text: `Perfect! 📧 I've sent your request to our support team. Someone will contact you at ${userEmail} within 2-4 hours. Is there anything else I can help you with right now?`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
      setShowContactForm(false);
    } catch (error) {
      console.error('Failed to send contact request:', error);
      const errorMessage = {
        text: "Sorry, there was an error sending your request. Please email us directly at adhattarwal745@gmail.com or call 123-457-890",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const quickReplies = [
    "Book a ride",
    "Payment issue",
    "Account help",
    "Safety concern",
    "Speak to human"
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          style={{
            width: '90%',
            maxWidth: '900px',
            height: '85vh',
            maxHeight: '700px',
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: '#00b894',
                borderRadius: '50%'
              }}></div>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>💬 Live Chat Support</span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            background: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '75%',
                  padding: '1rem 1.25rem',
                  borderRadius: message.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                  background: message.sender === 'user' 
                    ? 'linear-gradient(135deg, #74b9ff, #0984e3)' 
                    : 'white',
                  color: message.sender === 'user' ? 'white' : '#2c3e50',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-line',
                  fontSize: '1rem',
                  lineHeight: '1.4'
                }}>
                  {message.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'white',
                  padding: '1rem 1.25rem',
                  borderRadius: '20px 20px 20px 5px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  display: 'flex',
                  gap: '0.4rem',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    background: '#74b9ff',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite'
                  }}></div>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    background: '#74b9ff',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite 0.2s'
                  }}></div>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    background: '#74b9ff',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite 0.4s'
                  }}></div>
                </div>
              </div>
            )}

            {/* Contact Form */}
            {showContactForm && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '15px',
                marginBottom: '1rem',
                boxShadow: '0 3px 15px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>📧 Connect with Human Support</h4>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={sendContactRequest}
                  style={{
                    background: 'linear-gradient(135deg, #00b894, #00a085)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    width: '100%',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 5px 15px rgba(0, 184, 148, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  📧 Request Human Support
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {!showContactForm && (
            <div style={{
              padding: '1rem 1.5rem',
              background: 'white',
              borderTop: '1px solid #eee'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
                justifyContent: 'center'
              }}>
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => sendQuickReply(reply)}
                    style={{
                      background: 'linear-gradient(135deg, #e17055, #d63031)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 3px 10px rgba(225, 112, 85, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0px)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '1.5rem',
            background: 'white',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '1rem',
                border: '2px solid #ddd',
                borderRadius: '30px',
                outline: 'none',
                fontSize: '1rem',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#74b9ff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
                color: 'white',
                border: 'none',
                width: '55px',
                height: '55px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 5px 15px rgba(116, 185, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              📤
            </button>
          </div>

          {/* CSS Animations */}
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
              } 40% {
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      </div>
    </>
  );
};

export default LiveChat;