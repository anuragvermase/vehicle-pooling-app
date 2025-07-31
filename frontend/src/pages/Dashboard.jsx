import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import API from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [statsResponse, upcomingResponse] = await Promise.all([
        API.dashboard.getStats(),
        API.dashboard.getUpcomingRides()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      if (upcomingResponse.success) {
        setUpcomingRides(upcomingResponse.rides);
      }

      setLoading(false);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchRideHistory = async (page = 1, filter = 'all') => {
    try {
      setRefreshing(true);
      const response = await API.dashboard.getRideHistory(page, 10, filter);
      
      if (response.success) {
        setRideHistory(response.rides);
        setCurrentPage(response.currentPage);
      }
    } catch (error) {
      console.error('Ride history fetch error:', error);
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    if (activeTab === 'rides') {
      await fetchRideHistory(currentPage, historyFilter);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (activeTab === 'rides') {
      fetchRideHistory(1, historyFilter);
    }
  }, [activeTab, historyFilter]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠</div>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error Loading Dashboard</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
          <button
            onClick={refreshData}
            style={{
              padding: '1rem 2rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div>
      {/* Real-time Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {[
          { 
            label: 'Rides Offered', 
            value: stats?.ridesOffered || 0, 
            icon: '🚗', 
            color: '#667eea',
            change: '+12%',
            changeType: 'positive'
          },
          { 
            label: 'Rides Taken', 
            value: stats?.ridesTaken || 0, 
            icon: '🎯', 
            color: '#10b981',
            change: '+8%',
            changeType: 'positive'
          },
          { 
            label: 'Total Earnings', 
            value: `₹${stats?.totalEarnings || 0}`, 
            icon: '💰', 
            color: '#f59e0b',
            change: '+25%',
            changeType: 'positive'
          },
          { 
            label: 'Money Saved', 
            value: `₹${stats?.totalSpent ? (stats.fuelSaved - stats.totalSpent) : 0}`, 
            icon: '💸', 
            color: '#8b5cf6',
            change: '+15%',
            changeType: 'positive'
          },
          { 
            label: 'CO₂ Saved', 
            value: `${stats?.co2Saved || 0} kg`, 
            icon: '🌱', 
            color: '#059669',
            change: '+30%',
            changeType: 'positive'
          },
          { 
            label: 'Total Distance', 
            value: `${stats?.totalDistance || 0} km`, 
            icon: '📏', 
            color: '#dc2626',
            change: '+18%',
            changeType: 'positive'
          }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            textAlign: 'center',
            transition: 'transform 0.3s ease',
            border: `3px solid ${stat.color}20`,
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {/* Background gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: `linear-gradient(135deg, ${stat.color}20, transparent)`,
              borderRadius: '50%',
              transform: 'translate(30px, -30px)'
            }}></div>
            
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              position: 'relative',
              zIndex: 1
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: stat.color,
              marginBottom: '0.5rem',
              position: 'relative',
              zIndex: 1
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#666',
              fontWeight: '500',
              marginBottom: '0.5rem',
              position: 'relative',
              zIndex: 1
            }}>
              {stat.label}
            </div>
            {/* Change indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              fontSize: '0.8rem',
              color: stat.changeType === 'positive' ? '#10b981' : '#dc2626',
              fontWeight: '600',
              position: 'relative',
              zIndex: 1
            }}>
              <span>{stat.changeType === 'positive' ? '↗' : '↘'}</span>
              {stat.change} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? '2fr 1fr' : '1fr',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Monthly Performance Chart */}
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
            📊 Monthly Performance
          </h3>
          
          {/* Simple chart representation */}
          <div style={{
            display: 'flex',
            alignItems: 'end',
            gap: '1rem',
            height: '200px',
            padding: '1rem 0'
          }}>
            {stats?.monthlyData?.map((month, index) => (
              <div key={index} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {/* Earnings bar */}
                <div style={{
                  width: '100%',
                  background: '#667eea',
                  borderRadius: '5px 5px 0 0',
                  height: `${Math.max((month.earnings / 2000) * 150, 10)}px`,
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.7rem',
                  paddingBottom: '5px'
                }}>
                  ₹{month.earnings}
                </div>
                {/* Rides bar */}
                <div style={{
                  width: '100%',
                  background: '#10b981',
                  borderRadius: '0 0 5px 5px',
                  height: `${Math.max((month.ridesOffered + month.ridesTaken) * 10, 5)}px`,
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.7rem',
                  paddingTop: '5px'
                }}>
                  {month.ridesOffered + month.ridesTaken}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#666',
                  textAlign: 'center',
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap'
                }}>
                  {month.month}
                </div>
              </div>
            )) || []}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1rem',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '15px', background: '#667eea', borderRadius: '3px' }}></div>
              Earnings
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '15px', background: '#10b981', borderRadius: '3px' }}></div>
              Rides
            </div>
          </div>
        </div>

        {/* Quick Stats */}
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
            🎯 Quick Stats
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {[
              {
                label: 'Active Rides',
                value: stats?.activeRides || 0,
                icon: '🔴',
                color: '#dc2626'
              },
              {
                label: 'Completed Rides',
                value: stats?.completedRides || 0,
                icon: '✅',
                color: '#10b981'
              },
              {
                label: 'Average Rating',
                value: `${stats?.avgRatingAsDriver || 0}/5`,
                icon: '⭐',
                color: '#f59e0b'
              },
              {
                label: 'Success Rate',
                value: `${stats?.ridesOffered > 0 ? Math.round((stats.completedRides / stats.ridesOffered) * 100) : 0}%`,
                icon: '📈',
                color: '#8b5cf6'
              }
            ].map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: `${item.color}10`,
                borderRadius: '12px',
                border: `2px solid ${item.color}20`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <span style={{ color: '#333', fontWeight: '500' }}>{item.label}</span>
                </div>
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: item.color
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Rides Section */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: 0
          }}>
            🚀 Upcoming Rides
          </h3>
          <button
            onClick={refreshData}
            disabled={refreshing}
            style={{
              padding: '0.5rem 1rem',
              background: refreshing ? '#e5e7eb' : '#667eea',
              color: refreshing ? '#666' : 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {refreshing ? '🔄' : '🔃'} {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {upcomingRides.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {upcomingRides.slice(0, 5).map((ride) => (
              <div key={ride.id} style={{
                border: '2px solid #e5e7eb',
                borderRadius: '15px',
                padding: '1.5rem',
                transition: 'all 0.3s ease',
                background: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = ride.type === 'offered' ? '#667eea' : '#10b981';
                e.target.style.background = '#f8f9fa';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = 'white';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
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
                      {ride.distance && (
                        <span style={{
                          background: '#f59e0b',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          📏 {ride.distance}km
                        </span>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem',
                      flexWrap: 'wrap'
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
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        borderRadius: '1px'
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
                      color: '#666',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        📅 {new Date(ride.date).toLocaleDateString('en-IN')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ⏰ {ride.time}
                      </div>
                      {ride.type === 'offered' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          👥 {ride.passengers}/{ride.maxSeats} passengers
                        </div>
                      )}
                      {ride.type === 'booked' && ride.driver && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          👤 Driver: {ride.driver}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '1rem'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: ride.type === 'offered' ? '#10b981' : '#667eea'
                    }}>
                      {ride.type === 'offered' ? +`₹${ride.earnings || 0}` : `-₹${ride.cost || 0}`}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <button style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        color: ride.type === 'offered' ? '#667eea' : '#10b981',
                        border: `2px solid ${ride.type === 'offered' ? '#667eea' : '#10b981'}`,
                        borderRadius: '10px',
                        fontSize: '0.8rem',
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
                      {ride.type === 'offered' && (
                        <button style={{
                          padding: '0.5rem 1rem',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#dc2626';
                        }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚗</div>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>No upcoming rides scheduled</h4>
            <p style={{ marginBottom: '2rem' }}>Create a new ride or book an existing one to get started!</p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button style={{
                padding: '1rem 2rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                🚗 Offer a Ride
              </button>
              <button style={{
                padding: '1rem 2rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                🔍 Find a Ride
              </button>
            </div>
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
          {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((activity) => (
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
          )) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#666'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
              <p>No recent activity to show</p>
            </div>
          )}
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
          {['all', 'offered', 'booked', 'completed', 'cancelled'].map((filter) => (
            <button 
              key={filter} 
              onClick={() => setHistoryFilter(filter)}
              style={{
                padding: '0.75rem 1.5rem',
                background: historyFilter === filter ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                color: historyFilter === filter ? 'white' : '#667eea',
                border: `2px solid #667eea`,
                borderRadius: '15px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                if (historyFilter !== filter) {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (historyFilter !== filter) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#667eea';
                }
              }}
            >
              {filter === 'all' ? 'All Rides' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Ride History */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#333',
            margin: 0
          }}>
            📋 Ride History
          </h3>
          {refreshing && (
            <div style={{
              fontSize: '0.9rem',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>🔄</span> Loading...
            </div>
          )}
        </div>

        {rideHistory.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {rideHistory.map((ride) => (
              <div key={ride.id} style={{
                border: '2px solid #e5e7eb',
                borderRadius: '15px',
                padding: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = '#f8f9fa';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = 'white';
                e.target.style.transform = 'translateY(0)';
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
                      marginBottom: '1rem',
                      flexWrap: 'wrap'
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
                        background: ride.status === 'completed' ? '#10b981' : 
                                   ride.status === 'cancelled' ? '#dc2626' : '#f59e0b',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {ride.status === 'completed' ? '✅' : 
                         ride.status === 'cancelled' ? '❌' : '⏳'} {ride.status}
                      </span>
                      {ride.rating > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: '#f59e0b20',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px'
                        }}>
                          <span style={{ color: '#fbbf24' }}>⭐</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                            {ride.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        📍 {ride.route.from}
                      </div>
                      <div style={{
                        width: '30px',
                        height: '2px',
                        background: 'linear-gradient(90deg, #667eea, #764ba2)'
                      }}></div>
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        🎯 {ride.route.to}
                      </div>
                    </div>

                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      display: 'flex',
                      gap: '2rem',
                      flexWrap: 'wrap'
                    }}>
                      <span>📅 {new Date(ride.date).toLocaleDateString('en-IN')}</span>
                      <span>⏰ {ride.time}</span>
                      {ride.type === 'offered' && ride.passengers !== undefined && (
                        <span>👥 {ride.passengers} passengers</span>
                      )}
                      {ride.type === 'booked' && ride.driver && (
                        <span>👤 {ride.driver}</span>
                      )}
                      {ride.distance && (
                        <span>📏 {ride.distance}km</span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '1rem'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: ride.type === 'offered' ? '#10b981' : '#667eea'
                    }}>
                      {ride.type === 'offered' ? +`₹${ride.earnings || 0}` : `-₹${ride.cost || 0}`}
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
            
            {/* Pagination */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => fetchRideHistory(currentPage - 1, historyFilter)}
                disabled={currentPage <= 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: currentPage <= 1 ? '#e5e7eb' : '#667eea',
                  color: currentPage <= 1 ? '#666' : 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{ color: '#666' }}>Page {currentPage}</span>
              <button
                onClick={() => fetchRideHistory(currentPage + 1, historyFilter)}
                disabled={rideHistory.length < 10}
                style={{
                  padding: '0.5rem 1rem',
                  background: rideHistory.length < 10 ? '#e5e7eb' : '#667eea',
                  color: rideHistory.length < 10 ? '#666' : 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: rideHistory.length < 10 ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>No ride history found</h4>
            <p>Your completed rides will appear here</p>
          </div>
        )}
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
              {user?.name || 'User Name'}
            </h2>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
              justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ color: '#fbbf24' }}>⭐</span>
                <span style={{ fontWeight: '600' }}>{stats?.avgRatingAsDriver || 0}</span>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {(stats?.ridesOffered || 0) + (stats?.ridesTaken || 0)} total rides
              </div>

              <div style={{
                background: '#10b981',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                ✅ Verified
              </div>
            </div>

            <div style={{
              fontSize: '1rem',
              opacity: 0.9
            }}>
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric'
              }) : 'Recently'}
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
                { label: 'Email', value: user?.email || 'Not provided', icon: '📧' },
                { label: 'Phone', value: user?.phone || 'Not provided', icon: '📱' }
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
              🎯 Performance Stats
            </h4>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {[
                { 
                  label: 'Total Rides', 
                  value: (stats?.ridesOffered || 0) + (stats?.ridesTaken || 0), 
                  icon: '🚗' 
                },
                { 
                  label: 'Driver Rating', 
                  value: `${stats?.avgRatingAsDriver || 0}/5.0`, 
                  icon: '⭐' 
                },
                { 
                  label: 'Passenger Rating', 
                  value: `${stats?.avgRatingAsPassenger || 0}/5.0`, 
                  icon: '👤' 
                },
                { 
                  label: 'Completion Rate', 
                  value: `${stats?.ridesOffered > 0 ? Math.round((stats.completedRides / stats.ridesOffered) * 100) : 0}%`, 
                  icon: '✅' 
                }
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

                    <div 
                      style={{
                        width: '50px',
                        height: '25px',
                        borderRadius: '12px',
                        background: setting.enabled ? '#10b981' : '#e5e7eb',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => {
                        // Toggle setting (implement state management here)
                        console.log('Toggle setting:', setting.label);
                      }}
                    >
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

  const renderAnalytics = () => (
    <div>
      <div style={{
        background: 'white',
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
          textAlign: 'center'
        }}>
          📊 Advanced Analytics
        </h3>

        {/* Environmental Impact */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '15px',
          padding: '2rem',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <h4 style={{
            fontSize: '1.3rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🌍 Environmental Impact
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                value: `${stats?.co2Saved || 0} kg`,
                label: 'CO₂ Emissions Saved',
                icon: '🌱',
                description: 'Equivalent to planting trees'
              },
              {
                value: `₹${stats?.fuelSaved || 0}`,
                label: 'Fuel Cost Saved',
                icon: '⛽',
                description: 'Money saved on fuel'
              },
              {
                value: `${Math.round((stats?.totalDistance || 0) / 1000 * 2.3)} L`,
                label: 'Fuel Saved',
                icon: '🛢',
                description: 'Liters of fuel conserved'
              }
            ].map((impact, index) => (
              <div key={index} style={{
                textAlign: 'center',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {impact.icon}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {impact.value}
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  {impact.label}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  opacity: 0.8
                }}>
                  {impact.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Earnings Breakdown */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '15px',
            padding: '1.5rem'
          }}>
            <h5 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              💰 Earnings Breakdown
            </h5>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {[
                { label: 'Total Earnings', value: `₹${stats?.totalEarnings || 0}`, color: '#10b981' },
                { label: 'Total Spent', value: `₹${stats?.totalSpent || 0}`, color: '#dc2626' },
                { label: 'Net Profit', value: `₹${(stats?.totalEarnings || 0) - (stats?.totalSpent || 0)}`, color: '#667eea' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#666' }}>{item.label}</span>
                  <span style={{
                    fontWeight: 'bold',
                    color: item.color,
                    fontSize: '1.1rem'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '15px',
            padding: '1.5rem'
          }}>
            <h5 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📈 Performance Metrics
            </h5>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {[
                { 
                  label: 'Avg. Earning per Ride', 
                  value: `₹${stats?.ridesOffered > 0 ? Math.round((stats.totalEarnings || 0) / stats.ridesOffered) : 0}`, 
                  color: '#10b981' 
                },
                { 
                  label: 'Avg. Cost per Ride', 
                  value: `₹${stats?.ridesTaken > 0 ? Math.round((stats.totalSpent || 0) / stats.ridesTaken) : 0}`, 
                  color: '#dc2626' 
                },
                { 
                  label: 'Total Active Days', 
                  value: `${Math.max(stats?.ridesOffered || 0, stats?.ridesTaken || 0)} days`, 
                  color: '#667eea' 
                }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#666' }}>{item.label}</span>
                  <span style={{
                    fontWeight: 'bold',
                    color: item.color,
                    fontSize: '1.1rem'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '0.5rem',
              margin: 0
            }}>
              Dashboard 📊
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              margin: 0
            }}>
              Welcome back, {user?.name || 'User'}! Here's your ride summary.
            </p>
          </div>
          
          <button
            onClick={onLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.background = '#dc2626'}
          >
            🚪 Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'rides', label: '🚗 My Rides', icon: '🚗' },
              { id: 'analytics', label: '📈 Analytics', icon: '📈' },
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
                {window.innerWidth > 768 ? tab.label : tab.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'rides' && renderRides()}
          {activeTab === 'analytics' && renderAnalytics()}
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
              { 
                label: '🚗 Offer a Ride', 
                color: '#667eea', 
                action: () => window.location.href = '/offer-ride' 
              },
              { 
                label: '🔍 Find a Ride', 
                color: '#10b981', 
                action: () => window.location.href = '/find-rides' 
              },
              { 
                label: '💬 Contact Support', 
                color: '#f59e0b', 
                action: () => window.location.href = '/support' 
              },
              { 
                label: '📱 Download App', 
                color: '#8b5cf6', 
                action: () => window.open('https://play.google.com') 
              }
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
      </div>
    </div>
  );
};

export default Dashboard;