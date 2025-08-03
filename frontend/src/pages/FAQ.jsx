import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqData = [
    {
      category: 'General',
      questions: [
        { q: 'What is PoolRide?', a: 'PoolRide is a ride-sharing platform that connects drivers and passengers traveling in the same direction, making transportation more affordable and sustainable.' },
        { q: 'How does PoolRide work?', a: 'Simply sign up, search for available rides or offer your own ride. Our matching system connects you with compatible travel companions.' },
        { q: 'Is PoolRide safe?', a: 'Yes! We have verified drivers, real-time tracking, rating systems, and 24/7 support to ensure your safety.' }
      ]
    },
    {
      category: 'Booking',
      questions: [
        { q: 'How do I book a ride?', a: 'Search for rides by entering your pickup and destination points, select a suitable ride, and confirm your booking.' },
        { q: 'Can I cancel my booking?', a: 'Yes, you can cancel up to 2 hours before the ride. Cancellation policies may apply depending on timing.' },
        { q: 'How do I offer a ride?', a: 'Click on "Offer Ride", enter your route details, set your preferences, and publish your ride for others to join.' }
      ]
    },
    {
      category: 'Payment',
      questions: [
        { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards, UPI, net banking, and digital wallets like Paytm, PhonePe, and Google Pay.' },
        { q: 'When am I charged?', a: 'Payment is processed after the ride is completed. For drivers, earnings are transferred within 24-48 hours.' },
        { q: 'Are there any hidden fees?', a: 'No hidden fees! Our pricing is transparent. You only pay the amount shown during booking plus applicable taxes.' }
      ]
    },
    {
      category: 'Account',
      questions: [
        { q: 'How do I create an account?', a: 'Click on "Sign Up", provide your details, verify your phone number and email, and you\'re ready to go!' },
        { q: 'I forgot my password', a: 'Click on "Forgot Password" on the login page, enter your email, and follow the instructions to reset your password.' },
        { q: 'How do I update my profile?', a: 'Go to your profile section in the app, click edit, make your changes, and save them.' }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenFAQ(openFAQ === key ? null : key);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#fdcb6e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', marginBottom: '3rem' }}>
            Find answers to the most common questions about PoolRide.
          </p>

          {/* FAQ Categories */}
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.8rem', 
                color: '#2c3e50', 
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                {category.category}
              </h2>
              
              {category.questions.map((faq, questionIndex) => {
                const isOpen = openFAQ === `${categoryIndex}-${questionIndex}`;
                return (
                  <div key={questionIndex} style={{
                    background: '#f8f9fa',
                    marginBottom: '1rem',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #eee'
                  }}>
                    <div
                      onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                      style={{
                        padding: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isOpen ? '#e17055' : '#f8f9fa',
                        color: isOpen ? 'white' : '#2c3e50',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{faq.q}</h3>
                      <span style={{ fontSize: '1.5rem', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                        +
                      </span>
                    </div>
                    {isOpen && (
                      <div style={{ padding: '1.5rem', background: 'white', color: '#666', lineHeight: '1.6' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Still Have Questions */}
          <div style={{ background: 'linear-gradient(135deg, #2c3e50, #34495e)', padding: '3rem', borderRadius: '15px', textAlign: 'center', color: 'white', marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Still Have Questions?</h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
              Can't find the answer you're looking for? We're here to help!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/contact')} style={{
                background: '#fdcb6e',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '25px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Contact Support
              </button>
              <button onClick={() => navigate('/help')} style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '1rem 2rem',
                borderRadius: '25px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;