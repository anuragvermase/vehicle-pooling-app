import React from 'react';

const OurTeam = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      position: 'Chief Executive Officer',
      bio: 'Visionary leader with 15+ years in tech and transportation. Former VP at Uber.',
      image: '👩‍💼',
      linkedin: '#',
      twitter: '#',
      email: 'sarah@poolride.com'
    },
    {
      name: 'Michael Chen',
      position: 'Chief Technology Officer',
      bio: 'Expert in scalable systems and AI. Previously led engineering teams at Google.',
      image: '👨‍💻',
      linkedin: '#',
      twitter: '#',
      email: 'michael@poolride.com'
    },
    {
      name: 'Emily Rodriguez',
      position: 'Head of Operations',
      bio: 'Operations specialist ensuring smooth rides across all markets. MBA from Stanford.',
      image: '👩‍🔧',
      linkedin: '#',
      twitter: '#',
      email: 'emily@poolride.com'
    },
    {
      name: 'David Kim',
      position: 'Head of Safety',
      bio: 'Former police chief dedicated to rider and driver safety. 20+ years in public safety.',
      image: '👨‍🚓',
      linkedin: '#',
      twitter: '#',
      email: 'david@poolride.com'
    },
    {
      name: 'Lisa Zhang',
      position: 'Head of Product',
      bio: 'Product visionary focused on user experience. Former product lead at Lyft.',
      image: '👩‍🎨',
      linkedin: '#',
      twitter: '#',
      email: 'lisa@poolride.com'
    },
    {
      name: 'James Wilson',
      position: 'Head of Marketing',
      bio: 'Growth marketing expert. Built marketing teams at several successful startups.',
      image: '👨‍💼',
      linkedin: '#',
      twitter: '#',
      email: 'james@poolride.com'
    }
  ];

  const advisors = [
    {
      name: 'Dr. Amanda Foster',
      position: 'Transportation Policy Advisor',
      bio: 'Former DOT official and urban planning expert',
      image: '👩‍🎓'
    },
    {
      name: 'Robert Martinez',
      position: 'Technology Advisor',
      bio: 'AI and machine learning pioneer, Stanford professor',
      image: '👨‍🔬'
    },
    {
      name: 'Jennifer Lee',
      position: 'Business Strategy Advisor',
      bio: 'Former McKinsey partner specializing in mobility',
      image: '👩‍💼'
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
          👥 Meet Our Team
        </h1>
        <p style={{ 
          fontSize: '1.4rem', 
          opacity: 0.95,
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          The passionate individuals behind PoolRide, working together to revolutionize transportation and build safer, more connected communities.
        </p>
      </div>

      {/* Leadership Team */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '3rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            🌟 Leadership Team
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '3rem'
          }}>
            {teamMembers.map((member, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '20px',
                padding: '2.5rem',
                textAlign: 'center',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem auto',
                  fontSize: '4rem'
                }}>
                  {member.image}
                </div>
                
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold'
                }}>
                  {member.name}
                </h3>
                
                <div style={{
                  color: '#667eea',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem'
                }}>
                  {member.position}
                </div>
                
                <p style={{
                  color: '#666',
                  lineHeight: '1.6',
                  fontSize: '1rem',
                  marginBottom: '2rem'
                }}>
                  {member.bio}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem'
                }}>
                  <a href={member.linkedin} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '45px',
                    height: '45px',
                    background: '#0077b5',
                    color: 'white',
                    borderRadius: '50%',
                    textDecoration: 'none',
                    fontSize: '1.2rem',
                    transition: 'transform 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}>
                    💼
                  </a>
                  <a href={member.twitter} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '45px',
                    height: '45px',
                    background: '#1da1f2',
                    color: 'white',
                    borderRadius: '50%',
                    textDecoration: 'none',
                    fontSize: '1.2rem',
                    transition: 'transform 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}>
                    🐦
                  </a>
                  <a href={`mailto:${member.email}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '45px',
                    height: '45px',
                    background: '#ea4335',
                    color: 'white',
                    borderRadius: '50%',
                    textDecoration: 'none',
                    fontSize: '1.2rem',
                    transition: 'transform 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}>
                    📧
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advisors */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '3rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            🎯 Advisory Board
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {advisors.map((advisor, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #fdcb6e, #e17055)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '3rem'
                }}>
                  {advisor.image}
                </div>
                
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '1.3rem',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold'
                }}>
                  {advisor.name}
                </h3>
                
                <div style={{
                  color: '#e17055',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  {advisor.position}
                </div>
                
                <p style={{
                  color: '#666',
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}>
                  {advisor.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Culture */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '3rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            🏢 Our Culture & Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '🎯',
                title: 'Mission-Driven',
                description: 'We are passionate about making transportation safer, more affordable, and environmentally friendly.',
                color: '#74b9ff'
              },
              {
                icon: '🤝',
                title: 'Collaborative',
                description: 'We believe in the power of teamwork and diverse perspectives to solve complex challenges.',
                color: '#00b894'
              },
              {
                icon: '🚀',
                title: 'Innovation-First',
                description: 'We embrace cutting-edge technology and creative solutions to revolutionize ridesharing.',
                color: '#fdcb6e'
              },
              {
                icon: '💙',
                title: 'Community-Focused',
                description: 'We prioritize the needs of our riders, drivers, and the communities we serve.',
                color: '#fd79a8'
              },
              {
                icon: '🌱',
                title: 'Growth Mindset',
                description: 'We encourage continuous learning, experimentation, and personal development.',
                color: '#a29bfe'
              },
              {
                icon: '⚖',
                title: 'Ethical & Transparent',
                description: 'We operate with integrity, fairness, and transparency in everything we do.',
                color: '#e17055'
              }
            ].map((value, index) => (
              <div key={index} style={{
                background: 'white',
                border: `3px solid ${value.color}`,
                borderRadius: '20px',
                padding: '2.5rem',
                textAlign: 'center',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = value.color;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#2c3e50';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{value.icon}</div>
                <h3 style={{ 
                  fontSize: '1.4rem', 
                  marginBottom: '1rem',
                  fontWeight: 'bold'
                }}>
                  {value.title}
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  opacity: 0.9
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Join Our Team */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🚀</div>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1.5rem',
            fontWeight: 'bold'
          }}>
            Join Our Mission
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2.5rem',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            We're always looking for talented, passionate individuals who want to make a difference in transportation. 
            Join us in building the future of ridesharing.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {[
              { icon: '💻', title: 'Engineering', positions: '12 open positions' },
              { icon: '🎨', title: 'Design & UX', positions: '3 open positions' },
              { icon: '📊', title: 'Data & Analytics', positions: '5 open positions' },
              { icon: '🚗', title: 'Operations', positions: '8 open positions' },
              { icon: '💼', title: 'Business Development', positions: '4 open positions' },
              { icon: '🎯', title: 'Marketing', positions: '6 open positions' }
            ].map((dept, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '2rem',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{dept.icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {dept.title}
                </h3>
                <p style={{ opacity: 0.8, fontSize: '1rem' }}>{dept.positions}</p>
              </div>
            ))}
          </div>

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
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = 'none';
            }}>
              🔍 View Open Positions
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
              transition: 'all 0.3s'
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
              📧 Join Talent Network
            </button>
          </div>
        </div>
      </div>

      {/* Team Benefits */}
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
            🎁 Why Work With Us
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '🏥',
                title: 'Comprehensive Benefits',
                description: 'Full health, dental, vision insurance plus wellness programs'
              },
              {
                icon: '🏠',
                title: 'Flexible Work',
                description: 'Remote-first culture with flexible hours and work-life balance'
              },
              {
                icon: '💰',
                title: 'Competitive Compensation',
                description: 'Market-leading salaries plus equity and performance bonuses'
              },
              {
                icon: '📚',
                title: 'Learning & Development',
                description: 'Professional development budget and mentorship programs'
              },
              {
                icon: '🌴',
                title: 'Unlimited PTO',
                description: 'Take the time you need to recharge and spend with family'
              },
              {
                icon: '🍕',
                title: 'Amazing Perks',
                description: 'Free meals, gym membership, commuter benefits, and more'
              }
            ].map((benefit, index) => (
              <div key={index} style={{
                background: 'white',
                border: '2px solid #f0f0f0',
                borderRadius: '15px',
                padding: '2rem',
                textAlign: 'center',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#f0f0f0';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{benefit.icon}</div>
                <h3 style={{ 
                  color: '#2c3e50',
                  fontSize: '1.3rem', 
                  marginBottom: '1rem',
                  fontWeight: 'bold'
                }}>
                  {benefit.title}
                </h3>
                <p style={{ 
                  color: '#666',
                  fontSize: '1rem', 
                  lineHeight: '1.6'
                }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Team */}
      <div style={{
        width: '100%',
        padding: '4rem 2rem',
        background: '#f8f9fa',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '1.5rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            📞 Get In Touch
          </h2>
          <p style={{
            color: '#666',
            fontSize: '1.2rem',
            marginBottom: '3rem',
            lineHeight: '1.6'
          }}>
            Have questions about our team, careers, or want to connect? We'd love to hear from you!
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              minWidth: '200px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Email Us</h3>
              <p style={{ color: '#667eea', fontWeight: 'bold' }}>team@poolride.com</p>
            </div>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              minWidth: '200px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💼</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Careers</h3>
              <p style={{ color: '#667eea', fontWeight: 'bold' }}>careers@poolride.com</p>
            </div>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              minWidth: '200px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Partnerships</h3>
              <p style={{ color: '#667eea', fontWeight: 'bold' }}>partners@poolride.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurTeam;