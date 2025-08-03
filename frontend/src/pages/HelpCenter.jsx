import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const helpCategories = [
    { id: 'booking', name: 'Booking & Rides', icon: '🚗' },
    { id: 'payment', name: 'Payment & Pricing', icon: '💳' },
    { id: 'account', name: 'Account & Profile', icon: '👤' },
    { id: 'safety', name: 'Safety & Security', icon: '🛡' },
    { id: 'technical', name: 'Technical Issues', icon: '🔧' }
  ];

  const helpArticles = [
    { category: 'booking', title: 'How to book a ride?', content: 'Step-by-step guide to booking your first ride...' },
    { category: 'booking', title: 'How to cancel a ride?', content: 'Learn about cancellation policies and how to cancel...' },
    { category: 'payment', title: 'Payment methods accepted', content: 'We accept various payment methods including...' },
    { category: 'payment', title: 'How is pricing calculated?', content: 'Our transparent pricing model considers distance, time...' },
    { category: 'account', title: 'How to update my profile?', content: 'Keep your profile information up to date...' },
    { category: 'account', title: 'Forgot password?', content: 'Reset your password in a few simple steps...' },
    { category: 'safety', title: 'Safety guidelines for passengers', content: 'Important safety tips for a secure ride...' },
    { category: 'safety', title: 'How to report a safety issue?', content: 'Report any safety concerns immediately...' },
    { category: 'technical', title: 'App not working properly?', content: 'Troubleshooting common app issues...' },
    { category: 'technical', title: 'GPS location issues', content: 'Fix location and GPS related problems...' }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🚗</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>PoolRide</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: '#fd79a8', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '1rem', textAlign: 'center' }}>Help Center</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', textAlign: 'center', marginBottom: '3rem' }}>
            Find answers to frequently asked questions and get help quickly.
          </p>

          {/* Search Bar */}
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <input
              type="text"
              placeholder="🔍 Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '1rem 1.5rem',
                fontSize: '1.1rem',
                border: '2px solid #ddd',
                borderRadius: '25px',
                outline: 'none'
              }}
            />
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                background: selectedCategory === 'all' ? '#fd79a8' : '#f8f9fa',
                color: selectedCategory === 'all' ? 'white' : '#666',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              All Topics
            </button>
            {helpCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  background: selectedCategory === category.id ? '#fd79a8' : '#f8f9fa',
                  color: selectedCategory === category.id ? 'white' : '#666',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Help Articles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {filteredArticles.map((article, index) => (
              <div key={index} style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                border: '1px solid #eee'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem', fontSize: '1.2rem' }}>{article.title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{article.content}</p>
                <div style={{ marginTop: '1rem', color: '#fd79a8', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  Read more →
                </div>
              </div>
            ))}
          </div>

          {/* Still Need Help Section */}
          <div style={{ background: 'linear-gradient(135deg, #2c3e50, #34495e)', padding: '3rem', borderRadius: '15px', textAlign: 'center', color: 'white', marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Still Need Help?</h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/contact')} style={{
                background: '#fd79a8',
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
              <button onClick={() => navigate('/support')} style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '1rem 2rem',
                borderRadius: '25px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;