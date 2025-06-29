import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    rating: 4.8,
    totalRides: 156,
    verified: true,
    joinDate: '2023-06-15'
  });

  const [stats, setStats] = useState({
    ridesOffered: 45,
    ridesTaken: 111,
    totalEarnings: 15680,
    totalSavings: 8940,
    co2Saved: 245,
    totalKms: 12400
  });

  const [upcomingRides, setUpcomingRides] = useState([
    {
      id: 1,
      type: 'offered',
      route: { from: 'Connaught Place', to: 'Gurgaon Cyber City' },
      date: '2024-01-16',
      time: '08:30 AM',
      passengers: 2,
      maxSeats: 3,
      earnings: 300,
      status: 'confirmed'
    },
    {
      id: 2,
      type: 'booked',
      route: { from: 'Noida Sector 62', to: 'Delhi Karol Bagh' },
      date: '2024-01-17',
      time: '09:00 AM',
      driver: 'Priya Sharma',
      cost: 120,
      status: 'confirmed'
    }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'booking_received',
      message: 'New booking from Amit Singh for Delhi to Gurgaon',
      time: '2 hours ago',
      icon: '🎯'
    },
    {
      id: 2,
      type: 'ride_completed',
      message: 'Ride to Mumbai BKC completed successfully',
      time: '1 day ago',
      icon: '✅'
    },
    {
      id: 3,
      type: 'payment_received',
      message: 'Payment of ₹450 received for Pune ride',
      time: '2 days ago',
      icon: '💰'
    },
    {
      id: 4,
      type: 'rating_received',
      message: 'Received 5-star rating from Neha Gupta',
      time: '3 days ago',
      icon: '⭐'
    }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) return <Loading />;

  const renderOverview = () => (
    <div>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {[
          { label: 'Rides Offered', value: stats.ridesOffered, icon: '🚗', color: '#667eea' },
          { label: 'Rides Taken', value: stats.ridesTaken, icon: '🎯', color: '#10b981' },
          { label: 'Total Earnings', value: `₹${stats.totalEarnings}`, icon: '💰', color: '#f59e0b' },
          { label: 'Money Saved', value: `₹${stats.totalSavings}`, icon: '💸', color: '#8b5cf6' },
          { label: 'CO₂ Saved', value: `${stats.co2Saved} kg`, icon: '🌱', color: '#059669' },
          { label: 'Total Distance', value: `${stats.totalKms} km`, icon: '📏', color: '#dc2626' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            textAlign: 'center',
            transition: 'transform 0.3s ease',
            border: `3px solid ${stat.color}20`
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: stat.color,
              marginBottom: '0.5rem'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#666',
              fontWeight: '500'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Rides */}
      <div style={{background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🚀 Upcoming Rides
        </h3>
        
        {upcomingRides.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {upcomingRides.map((ride) => (
              <div key={ride.id} style={{
                border: '2px solid #e5e7eb',
                borderRadius: '15px',
                padding: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = ride.type === 'offered' ? '#667eea' : '#10b981';
                e.target.style.background = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = 'white';
              }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{
                        background: ride.type === 'offered' ? '#667eea' : '#10b981',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {ride.type === 'offered' ? '🚗 Offering' : '🎯 Booked'}
                      </span>
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        ✅ {ride.status}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        📍 {ride.route.from}
                      </div>
                      <div style={{
                        width: '30px',
                        height: '2px',
                        background: 'linear-gradient(90deg, #667eea, #764ba2)'
                      }}></div>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        🎯 {ride.route.to}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      gap: '2rem',
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      <div>📅 {ride.date}</div>
                      <div>⏰ {ride.time}</div>
                      {ride.type === 'offered' && (
                        <div>👥 {ride.passengers}/{ride.maxSeats} passengers</div>
                      )}
                      {ride.type === 'booked' && (
                        <div>👤 Driver: {ride.driver}</div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: ride.type === 'offered' ? '#10b981' : '#667eea',
                      marginBottom: '0.5rem'
                    }}>
                      {ride.type === 'offered' ? +`₹${ride.earnings}` : `-₹${ride.cost}`}
                    </div>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: 'transparent',
                      color: ride.type === 'offered' ? '#667eea' : '#10b981',
                      border: `2px solid ${ride.type === 'offered' ? '#667eea' : '#10b981'}`,
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = ride.type === 'offered' ? '#667eea' : '#10b981';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = ride.type === 'offered' ? '#667eea' : '#10b981';
                    }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
            <p>No upcoming rides scheduled</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📈 Recent Activity
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {recentActivity.map((activity) => (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f0f4ff'}
            onMouseLeave={(e) => e.target.style.background = '#f8f9fa'}
            >
              <div style={{
                fontSize: '1.5rem',
                width: '40px',
                textAlign: 'center'
              }}>
                {activity.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '1rem',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  {activity.message}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#666'
                }}>
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRides = () => (
    <div>
      {/* Ride Filters */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {['All Rides', 'Offered', 'Booked', 'Completed', 'Cancelled'].map((filter) => (
            <button key={filter} style={{
              padding: '0.75rem 1.5rem',
              background: filter === 'All Rides' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
              color: filter === 'All Rides' ? 'white' : '#667eea',
              border: `2px solid #667eea`,
              borderRadius: '15px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (filter !== 'All Rides') {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== 'All Rides') {
                e.target.style.background = 'transparent';
                e.target.style.color = '#667eea';
              }
            }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Sample Ride History */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '2rem'
        }}>
          📋 Ride History
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {[
            {
              id: 1,
              type: 'offered',
              route: { from: 'Delhi CP', to: 'Gurgaon' },
              date: '2024-01-10',
              passengers: 3,
              earnings: 450,
              status: 'completed',
              rating: 4.9
            },
            {
              id: 2,
              type: 'booked',
              route: { from: 'Noida', to: 'Delhi' },
              date: '2024-01-08',
              driver: 'Amit Sharma',
              cost: 180,
              status: 'completed',
              rating: 5.0
            }
          ].map((ride) => (
            <div key={ride.id} style={{
              border: '2px solid #e5e7eb',
              borderRadius: '15px',
              padding: '1.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.background = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = 'white';
            }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      background: ride.type === 'offered' ? '#667eea' : '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {ride.type === 'offered' ? '🚗 Offered' : '🎯 Booked'}
                    </span>
                    <span style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      ✅ {ride.status}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{ color: '#fbbf24' }}>⭐</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                        {ride.rating}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div>📍 {ride.route.from}</div>
                    <div style={{
                      width: '30px',
                      height: '2px',
                      background: 'linear-gradient(90deg, #667eea, #764ba2)'
                    }}></div>
                    <div>🎯 {ride.route.to}</div>
                  </div>
                  
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    📅 {ride.date}
                    {ride.type === 'offered' && ` • 👥 ${ride.passengers} passengers`}
                    {ride.type === 'booked' && ` • 👤 ${ride.driver}`}
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '1.5rem',fontWeight: 'bold',
                    color: ride.type === 'offered' ? '#10b981' : '#667eea',
                    marginBottom: '0.5rem'
                  }}>
                    {ride.type === 'offered' ? +`₹${ride.earnings}` : `-₹${ride.cost}`}
                  </div>
                  <button style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#667eea';
                  }}
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          👤 Profile Information
        </h3>
        
        {/* Profile Header */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth > 768 ? 'row' : 'column',
          alignItems: 'center',
          gap: '2rem',
          marginBottom: '3rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '20px',
          color: 'white'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: '#667eea'
          }}>
            👤
          </div>
          
          <div style={{ flex: 1, textAlign: window.innerWidth > 768 ? 'left' : 'center' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {user.name}
            </h2>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
              justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ color: '#fbbf24' }}>⭐</span>
                <span style={{ fontWeight: '600' }}>{user.rating}</span>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {user.totalRides} rides
              </div>
              
              {user.verified && (
                <div style={{
                  background: '#10b981',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  ✅ Verified
                </div>
              )}
            </div>
            
            <div style={{
              fontSize: '1rem',
              opacity: 0.9
            }}>
              Member since {new Date(user.joinDate).toLocaleDateString('en-IN', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
          gap: '2rem'
        }}>
          <div>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1.5rem'
            }}>
              📧 Contact Information
            </h4>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {[
                { label: 'Email', value: user.email, icon: '📧' },
                { label: 'Phone', value: user.phone, icon: '📱' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '12px'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#666',
                      marginBottom: '0.25rem'
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1.5rem'
            }}>
              🎯 Quick Stats
            </h4>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {[
                { label: 'Total Rides', value: user.totalRides, icon: '🚗' },
                { label: 'Average Rating', value: `${user.rating}/5.0`, icon: '⭐' },
                { label: 'Account Status', value: user.verified ? 'Verified' : 'Pending', icon: '✅' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '12px'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#666',
                      marginBottom: '0.25rem'
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '3rem',
          flexWrap: 'wrap'
        }}>
          {[
            { label: '✏ Edit Profile', color: '#667eea' },
            { label: '🔒 Change Password', color: '#10b981' },
            { label: '📊 Download Data', color: '#f59e0b' }
          ].map((button, index) => (
            <button key={index} style={{
              padding: '1rem 2rem',
              background: 'transparent',
              color: button.color,
              border: `2px solid ${button.color}`,
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = button.color;
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = button.color;
            }}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          ⚙ Settings & Preferences
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {[
            {
              title: '📱 Notifications',
              description: 'Manage your notification preferences',
              settings: [
                { label: 'Email Notifications', enabled: true },
                { label: 'SMS Notifications', enabled: false },
                { label: 'Push Notifications', enabled: true },
                { label: 'Marketing Updates', enabled: false }
              ]
            },
            {
              title: '🔒 Privacy',
              description: 'Control your privacy settings',
              settings: [
                { label: 'Show Phone Number', enabled: true },
                { label: 'Show Email', enabled: false },
                { label: 'Public Profile', enabled: true },
                { label: 'Location Sharing', enabled: true }
              ]
            },
            {
              title: '🚗 Ride Preferences',
              description: 'Set your default ride preferences',
              settings: [
                { label: 'Auto-approve Bookings', enabled: false },
                { label: 'Instant Booking', enabled: true },
                { label: 'Female-only Rides', enabled: false },
                { label: 'Pet-friendly Rides', enabled: true }
              ]
            }
          ].map((section, sectionIndex) => (
            <div key={sectionIndex} style={{
              border: '2px solid #e5e7eb',
              borderRadius: '15px',
              padding: '2rem'
            }}>
              <h4 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                {section.title}
              </h4>
              
              <p style={{
                fontSize: '0.9rem',
                color: '#666',
                marginBottom: '1.5rem'
              }}>
                {section.description}
              </p>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {section.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '10px'
                  }}>
                    <span style={{
                      fontSize: '1rem',
                      color: '#333'
                    }}>
                      {setting.label}
                    </span>
                    
                    <div style={{
                      width: '50px',
                      height: '25px',
                      borderRadius: '12px',
                      background: setting.enabled ? '#10b981' : '#e5e7eb',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        width: '21px',
                        height: '21px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '2px',
                        left: setting.enabled ? '27px' : '2px',
                        transition: 'all 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            Dashboard 📊
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#666'
          }}>
            Welcome back, {user.name}! Here's your ride summary.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          < div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>{[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'rides', label: '🚗 My Rides', icon: '🚗' },
              { id: 'profile', label: '👤 Profile', icon: '👤' },
              { id: 'settings', label: '⚙ Settings', icon: '⚙' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 2rem',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                    : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#667eea',
                  border: `2px solid ${activeTab === tab.id ? '#667eea' : '#e5e7eb'}`,
                  borderRadius: '15px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.background = '#f0f4ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'rides' && renderRides()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'settings' && renderSettings()}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '2rem'
          }}>
            🚀 Quick Actions
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { label: '🚗 Offer a Ride', color: '#667eea', action: () => window.location.href = '/offer-ride' },
              { label: '🔍 Find a Ride', color: '#10b981', action: () => window.location.href = '/find-rides' },
              { label: '💬 Contact Support', color: '#f59e0b', action: () => window.location.href = '/support' },
              { label: '📱 Download App', color: '#8b5cf6', action: () => window.open('https://play.google.com') }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                style={{
                  padding: '1rem 2rem',
                  background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 15px ${action.color}40`
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = `0 8px 25px ${action.color}60`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = `0 4px 15px ${action.color}40`;
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Stats */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '20px',
          padding: '2rem',
          marginTop: '2rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '2rem'
          }}>
            🌟 Your Impact
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { 
                value: `${stats.co2Saved} kg`, 
                label: 'CO₂ Reduced', 
                icon: '🌱',
                description: 'Equivalent to planting 5 trees'
              },
              { 
                value: `${stats.totalKms} km`, 
                label: 'Distance Shared', 
                icon: '🛣',
                description: 'That\'s like Delhi to Mumbai!'
              },
              { 
                value: `₹${stats.totalSavings + stats.totalEarnings}`, 
                label: 'Money Impact', 
                icon: '💰',
                description: 'Saved + Earned combined'
              },
              { 
                value: `${Math.round(stats.totalKms / stats.ridesOffered + stats.ridesTaken)} km`, 
                label: 'Avg. Trip Distance', 
                icon: '📏',
                description: 'Per ride average'
              }
            ].map((impact, index) => (
              <div key={index} style={{
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.5rem'
                }}>
                  {impact.icon}
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {impact.value}
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {impact.label}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  opacity: 0.8
                }}>
                  {impact.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;