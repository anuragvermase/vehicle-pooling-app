import React, { useState } from 'react';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const helpCategories = [
    {
      id: 'booking',
      title: '🚗 Booking & Rides',
      icon: '🚗',
      color: '#74b9ff',
      articles: [
        { title: 'How to book your first ride', views: '25k', time: '2 min read' },
        { title: 'Scheduling rides in advance', views: '18k', time: '3 min read' },
        { title: 'Choosing the right ride type', views: '22k', time: '4 min read' },
        { title: 'Cancelling or modifying bookings', views: '15k', time: '2 min read' }
      ]
    },
    {
      id: 'payment',
      title: '💳 Payment & Billing',
      icon: '💳',
      color: '#00b894',
      articles: [
        { title: 'Adding and managing payment methods', views: '30k', time: '3 min read' },
        { title: 'Understanding your fare breakdown', views: '20k', time: '2 min read' },
        { title: 'Promotional codes and discounts', views: '35k', time: '2 min read' },
        { title: 'Disputing charges and refunds', views: '12k', time: '5 min read' }
      ]
    },
    {
      id: 'safety',
      title: '🛡 Safety & Security',
      icon: '🛡',
      color: '#fd79a8',
      articles: [
        { title: 'Safety features and emergency contacts', views: '40k', time: '4 min read' },
        { title: 'Sharing your trip with others', views: '28k', time: '2 min read' },
        { title: 'Reporting safety concerns', views: '15k', time: '3 min read' },
        { title: 'Driver verification process', views: '18k', time: '3 min read' }
      ]
    },
    {
      id: 'account',
      title: '👤 Account Management',
      icon: '👤',
      color: '#fdcb6e',
      articles: [
        { title: 'Creating and verifying your account', views: '45k', time: '3 min read' },
        { title: 'Updating profile information', views: '32k', time: '2 min read' },
        { title: 'Privacy settings and data control', views: '25k', time: '4 min read' },
        { title: 'Deleting your account', views: '8k', time: '2 min read' }
      ]
    },
    {
      id: 'driver',
      title: '🚙 Driver Information',
      icon: '🚙',
      color: '#e17055',
      articles: [
        { title: 'How to become a PoolRide driver', views: '60k', time: '5 min read' },
        { title: 'Vehicle requirements and inspection', views: '35k', time: '4 min read' },
        { title: 'Driver earnings and payment schedule', views: '50k', time: '3 min read' },
        { title: 'Driver safety guidelines', views: '28k', time: '4 min read' }
      ]
    },
    {
      id: 'technical',
      title: '🔧 Technical Support',
      icon: '🔧',
      color: '#a29bfe',
      articles: [
        { title: 'App troubleshooting and common issues', views: '42k', time: '3 min read' },
        { title: 'GPS and location services', views: '30k', time: '2 min read' },
        { title: 'Notification settings', views: '25k', time: '2 min read' },
        { title: 'Updating the PoolRide app', views: '38k', time: '1 min read' }
      ]
    }
  ];

  const quickActions = [
    { icon: '🚗', title: 'Book a Ride', description: 'Start your journey now', color: '#74b9ff' },
    { icon: '💬', title: 'Live Chat', description: '24/7 instant support', color: '#fd79a8' },
    { icon: '📞', title: 'Call Support', description: 'Speak with an agent', color: '#00b894' },
    { icon: '📝', title: 'Submit Ticket', description: 'Report an issue', color: '#fdcb6e' }
  ];

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      margin: 0,
      padding: 0
    }}>
      {/* Hero Section */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          marginBottom: '1.5rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          margin: 0,
          paddingBottom: '1.5rem'
        }}>
          🆘 Help Center
        </h1>
        <p style={{ 
          fontSize: '1.4rem', 
          opacity: 0.95,
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          Find answers, get support, and learn how to make the most of PoolRide
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for help articles, guides, and FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '1.2rem 1.5rem',
                fontSize: '1.1rem',
                border: 'none',
                borderRadius: '50px',
                outline: 'none',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                e.target.style.transform = 'translateY(0px)';
              }}
            />
            <button style={{
              position: 'absolute',
              right: '5px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}>
              🔍 Search
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        width: '100%',
        padding: '3rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '2.5rem',
            fontSize: '2.2rem',
            fontWeight: 'bold'
          }}>
            ⚡ Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {quickActions.map((action, index) => (
              <div key={index} style={{
                background: 'white',
                border: `3px solid ${action.color}`,
                borderRadius: '15px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = action.color;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#2c3e50';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{action.icon}</div>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  marginBottom: '0.5rem',
                  fontWeight: 'bold'
                }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: '1rem', opacity: 0.8 }}>{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{
        width: '100%',
        padding: '2rem 2rem 0 2rem',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                background: selectedCategory === 'all' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                color: selectedCategory === 'all' ? 'white' : '#2c3e50',
                border: selectedCategory === 'all' ? 'none' : '2px solid #ddd',
                padding: '0.8rem 1.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
            >
              📚 All Categories
            </button>
            {helpCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  background: selectedCategory === category.id ? category.color : 'white',
                  color: selectedCategory === category.id ? 'white' : '#2c3e50',
                  border: selectedCategory === category.id ? 'none' : '2px solid #ddd',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
              >
                {category.icon} {category.title.split(' ').slice(1).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div style={{
        width: '100%',
        padding: '0 2rem 4rem 2rem',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {helpCategories
              .filter(category => selectedCategory === 'all' || selectedCategory === category.id)
              .map((category, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
              }}>
                <div style={{
                  background: category.color,
                  color: 'white',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{category.icon}</div>
                  <h3 style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    margin: 0
                  }}>
                    {category.title}
                  </h3>
                </div>
                
                <div style={{ padding: '1.5rem' }}>
                  {category.articles.map((article, articleIndex) => (
                    <div key={articleIndex} style={{
                      padding: '1rem',
                      borderBottom: articleIndex < category.articles.length - 1 ? '1px solid #f0f0f0' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.3s',
                      borderRadius: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}>
                      <h4 style={{
                        color: '#2c3e50',
                        fontSize: '1.1rem',
                        marginBottom: '0.5rem',
                        fontWeight: '600'
                      }}>
                        {article.title}
                      </h4>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                        color: '#666'
                      }}>
                        <span>👁 {article.views} views</span>
                        <span>⏱ {article.time}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button style={{
                      background: 'transparent',
                      color: category.color,
                      border: `2px solid ${category.color}`,
                      padding: '0.8rem 1.5rem',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = category.color;
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = category.color;
                    }}>
                      View All Articles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Articles */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '3rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            🔥 Most Popular Articles
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { title: 'How to book your first ride', category: 'Booking', views: '125k', rating: 4.9, color: '#74b9ff' },
              { title: 'Safety features and emergency contacts', category: 'Safety', views: '98k', rating: 4.8, color: '#fd79a8' },
              { title: 'Adding payment methods', category: 'Payment', views: '87k', rating: 4.7, color: '#00b894' },
              { title: 'Becoming a PoolRide driver', category: 'Driver', views: '156k', rating: 4.9, color: '#e17055' },
              { title: 'Understanding fare calculations', category: 'Payment', views: '76k', rating: 4.6, color: '#00b894' },
              { title: 'App troubleshooting guide', category: 'Technical', views: '65k', rating: 4.5, color: '#a29bfe' }
            ].map((article, index) => (
              <div key={index} style={{
                background: 'white',
                border: `2px solid ${article.color}`,
                borderRadius: '15px',
                padding: '2rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = article.color;
                e.currentTarget.style.borderWidth = '3px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderWidth = '2px';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    background: article.color,
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {article.category}
                  </span>
                  <span style={{ marginLeft: 'auto', color: '#666', fontSize: '0.9rem' }}>
                    👁 {article.views}
                  </span>
                </div>
                
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.3rem',
                  marginBottom: '1rem',
                  fontWeight: 'bold',
                  lineHeight: '1.4'
                }}>
                  {article.title}
                </h3>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#666'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>⭐ {article.rating}</span>
                    <span>•</span>
                    <span>3 min read</span>
                  </div>
                  <button style={{
                    background: article.color,
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    Read →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1.5rem',
            fontWeight: 'bold'
          }}>
            🤝 Need More Help?
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2.5rem',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Our support team is available 24/7 to assist you with any questions or issues you might have.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <button style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '1.2rem 2.5rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = 'none';
            }}>
              💬 Start Live Chat
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '1.2rem 2.5rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(0px)';
            }}>
              📧 Email Support
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '1.2rem 2.5rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(0px)';
            }}>
              📞 Call Support
            </button>
          </div>
          
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            textAlign: 'left'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1rem',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              📞 Support Hours
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              fontSize: '1rem'
            }}>
              <div>
                <strong>Live Chat:</strong><br />
                24/7 Available
              </div>
              <div>
                <strong>Phone Support:</strong><br />
                Mon-Fri: 6AM - 10PM<br />
                Sat-Sun: 8AM - 8PM
              </div>
              <div>
                <strong>Email Support:</strong><br />
                Response within 2-4 hours
              </div>
              <div>
                <strong>Emergency Line:</strong><br />
                24/7 for urgent safety issues
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;