import React, { useState } from 'react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqCategories = [
    {
      title: '🚗 Booking & Rides',
      items: [
        {
          question: 'How do I book a ride with PoolRide?',
          answer: 'Simply open our app, enter your pickup location and destination, select your preferred ride type, and confirm your booking. You\'ll be matched with a nearby driver within minutes.'
        },
        {
          question: 'Can I schedule a ride in advance?',
          answer: 'Yes! You can schedule rides up to 7 days in advance. Just select "Schedule Later" when booking and choose your preferred date and time.'
        },
        {
          question: 'What types of rides are available?',
          answer: 'We offer Economy (shared rides), Standard (private rides), Premium (luxury vehicles), and XL (larger vehicles for groups). Each option is designed to meet different needs and budgets.'
        },
        {
          question: 'How long does it take to get a ride?',
          answer: 'Average pickup time is 3-8 minutes in busy areas and up to 15 minutes in suburban areas. You\'ll see the estimated arrival time before confirming your booking.'
        }
      ]
    },
    {
      title: '💳 Payment & Pricing',
      items: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit/debit cards, PayPal, Apple Pay, Google Pay, and cash payments in select cities. You can manage payment methods in your account settings.'
        },
        {
          question: 'How is the fare calculated?',
          answer: 'Fares are calculated based on distance, time, demand, and ride type. You\'ll see the estimated fare before confirming your ride, and the final amount after completion.'
        },
        {
          question: 'Are there any additional fees?',
          answer: 'Standard rides have no hidden fees. Additional charges may apply for tolls, airport pickups, waiting time (after 2 minutes), or cancellations after 5 minutes.'
        },
        {
          question: 'Do you offer discounts or promotions?',
          answer: 'Yes! We regularly offer promo codes, new user discounts, and loyalty rewards. Check the app\'s promotions section or follow our social media for current offers.'
        }
      ]
    },
    {
      title: '👤 Account & Profile',
      items: [
        {
          question: 'How do I create an account?',
          answer: 'Download our app and sign up with your email, phone number, or social media account. You\'ll need to verify your phone number and add a payment method to start booking rides.'
        },
        {
          question: 'Can I change my profile information?',
          answer: 'Yes, you can update your name, phone number, email, and profile photo anytime in the app settings. Some changes may require verification for security purposes.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'Go to Settings > Account > Delete Account. Please note this action is permanent and will remove all your ride history and saved information.'
        },
        {
          question: 'Is my personal information safe?',
          answer: 'Absolutely. We use bank-level encryption to protect your data and never share personal information with drivers beyond what\'s necessary for the ride.'
        }
      ]
    },
    {
      title: '🛡 Safety & Security',
      items: [
        {
          question: 'How do you ensure ride safety?',
          answer: 'All drivers undergo background checks, vehicle inspections, and safety training. Every ride is GPS-tracked, and we provide emergency buttons, ride sharing, and 24/7 support.'
        },
        {
          question: 'Can I share my ride details with someone?',
          answer: 'Yes! You can share your live trip details including driver info, vehicle details, and real-time location with trusted contacts directly from the app.'
        },
        {
          question: 'What should I do if I feel unsafe?',
          answer: 'Use the emergency button in the app to contact local authorities, call our 24/7 safety line, or use the "I don\'t feel safe" feature to get immediate assistance.'
        },
        {
          question: 'How are drivers verified?',
          answer: 'All drivers must pass comprehensive background checks, vehicle inspections, have valid insurance, clean driving records, and complete our safety certification program.'
        }
      ]
    },
    {
      title: '🚙 For Drivers',
      items: [
        {
          question: 'How do I become a PoolRide driver?',
          answer: 'Visit our driver portal, meet the requirements (21+, valid license, insurance, background check), submit your application, and complete vehicle inspection and training.'
        },
        {
          question: 'What are the vehicle requirements?',
          answer: 'Vehicles must be 2010 or newer, pass safety inspection, have valid registration and insurance, 4 doors, and seat at least 4 passengers including the driver.'
        },
        {
          question: 'How much can I earn as a driver?',
          answer: 'Earnings vary by location, hours driven, and demand. Drivers typically earn $15-25/hour before expenses. You keep 100% of tips and can cash out daily.'
        },
        {
          question: 'When do I get paid?',
          answer: 'You\'re paid weekly via direct deposit, or you can cash out instantly (up to 5 times per day) for a small fee. All earnings are tracked in real-time in the driver app.'
        }
      ]
    }
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
          ❓ Frequently Asked Questions
        </h1>
        <p style={{ 
          fontSize: '1.4rem', 
          opacity: 0.95,
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Find quick answers to the most common questions about PoolRide services, safety, and features.
        </p>
      </div>

      {/* Search Section */}
      <div style={{
        width: '100%',
        padding: '3rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '1.5rem',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            🔍 Search for Answers
          </h2>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Type your question here..."
              style={{
                width: '100%',
                padding: '1.2rem 1.5rem',
                fontSize: '1.1rem',
                border: '3px solid #667eea',
                borderRadius: '50px',
                outline: 'none',
                boxShadow: '0 5px 15px rgba(102, 126, 234, 0.2)',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.2)';
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
              Search
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Categories */}
      <div style={{
        width: '100%',
        padding: '2rem 2rem 4rem 2rem',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} style={{
              background: 'white',
              borderRadius: '15px',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  {category.title}
                </h3>
              </div>
              
              <div style={{ padding: '1rem' }}>
                {category.items.map((item, itemIndex) => {
                  const globalIndex = `${categoryIndex}-${itemIndex}`;
                  const isOpen = openItems[globalIndex];
                  
                  return (
                    <div key={itemIndex} style={{
                      border: '1px solid #eee',
                      borderRadius: '10px',
                      marginBottom: '0.5rem',
                      overflow: 'hidden',
                      transition: 'all 0.3s'
                    }}>
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        style={{
                          width: '100%',
                          padding: '1.5rem',
                          background: isOpen ? '#667eea' : '#f8f9fa',
                          color: isOpen ? 'white' : '#2c3e50',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isOpen) {
                            e.target.style.background = '#e8f0ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isOpen) {
                            e.target.style.background = '#f8f9fa';
                          }
                        }}
                      >
                        <span>{item.question}</span>
                        <span style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                          fontSize: '1.5rem'
                        }}>
                          ⌄
                        </span>
                      </button>
                      
                      {isOpen && (
                        <div style={{
                          padding: '1.5rem',
                          background: 'white',
                          borderTop: '1px solid #eee',
                          animation: 'fadeIn 0.3s ease-in-out'
                        }}>
                          <p style={{
                            color: '#666',
                            lineHeight: '1.7',
                            fontSize: '1rem',
                            margin: 0
                          }}>
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '3rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            📊 PoolRide by the Numbers
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { icon: '🚗', number: '10M+', label: 'Rides Completed' },
              { icon: '⭐', number: '4.9/5', label: 'Average Rating' },
              { icon: '🌍', number: '500+', label: 'Cities Served' },
              { icon: '👥', number: '2M+', label: 'Happy Users' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '2.5rem 1.5rem',
                borderRadius: '15px',
                textAlign: 'center',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '1.1rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Still Need Help */}
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
            🤝 Still Need Help?
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2.5rem',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Can't find what you're looking for? Our support team is available 24/7 to help you with any questions or concerns.
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
              padding: '1rem 2rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = 'none';
            }}>
              💬 Live Chat
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
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
              📧 Contact Support
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              borderRadius: '30px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
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
              📞 Call Us
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default FAQ;