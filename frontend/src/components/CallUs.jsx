import React, { useState } from 'react';

const CallUs = ({ isOpen, onClose, onOpenLiveChat, onRedirectToSupport }) => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const departments = [
    {
      id: 'general',
      name: 'General Support',
      icon: '🎧',
      phone: '123-457-890',
      hours: '24/7 Available',
      description: 'General inquiries and basic support',
      color: 'linear-gradient(135deg, #74b9ff, #0984e3)'
    },
    {
      id: 'emergency',
      name: 'Emergency Support',
      icon: '🚨',
      phone: '123-457-890',
      hours: '24/7 Available',
      description: 'Urgent safety concerns and emergencies',
      color: 'linear-gradient(135deg, #e17055, #d63031)'
    },
    {
      id: 'booking',
      name: 'Booking Help',
      icon: '🚗',
      phone: '123-457-890',
      hours: 'Mon-Fri: 6AM-10PM',
      description: 'Help with ride bookings and trips',
      color: 'linear-gradient(135deg, #00b894, #00a085)'
    },
    {
      id: 'billing',
      name: 'Billing & Payments',
      icon: '💳',
      phone: '123-457-890',
      hours: 'Mon-Fri: 9AM-6PM',
      description: 'Payment issues and billing questions',
      color: 'linear-gradient(135deg, #fdcb6e, #e17055)'
    },
    {
      id: 'driver',
      name: 'Driver Support',
      icon: '👨‍💼',
      phone: '123-457-890',
      hours: 'Mon-Sun: 8AM-8PM',
      description: 'Support for driver partners',
      color: 'linear-gradient(135deg, #a29bfe, #6c5ce7)'
    }
  ];

  const handleEmailSupport = () => {
    onClose(); // Close Call Us popup
    if (onRedirectToSupport) {
      onRedirectToSupport(); // Redirect to support page
    }
  };

  const handleLiveChat = () => {
    onClose(); // Close Call Us popup
    if (onOpenLiveChat) {
      onOpenLiveChat(); // Open Live Chat
    }
  };

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
            maxWidth: '800px',
            maxHeight: '90vh',
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
            background: 'linear-gradient(135deg, #00b894, #00a085)',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📞</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Call Support</span>
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

          {/* Content */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            background: '#f8f9fa'
          }}>
            {!selectedDepartment ? (
              <>
                {/* Department Selection */}
                <h3 style={{ 
                  color: '#2c3e50', 
                  marginBottom: '1.5rem', 
                  textAlign: 'center',
                  fontSize: '1.3rem'
                }}>
                  Choose Your Department
                </h3>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept)}
                      style={{
                        background: 'white',
                        padding: '1.2rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid transparent',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          background: dept.color,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem'
                        }}>
                          {dept.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            margin: 0, 
                            marginBottom: '0.3rem', 
                            color: '#2c3e50',
                            fontSize: '1.1rem'
                          }}>
                            {dept.name}
                          </h4>
                          <p style={{ 
                            margin: 0, 
                            color: '#666', 
                            fontSize: '0.9rem',
                            marginBottom: '0.3rem'
                          }}>
                            {dept.description}
                          </p>
                          <p style={{ 
                            margin: 0, 
                            color: '#00b894', 
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}>
                            {dept.hours}
                          </p>
                        </div>
                        <div style={{ fontSize: '1.5rem', color: '#666' }}>→</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Selected Department */}
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '15px',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: selectedDepartment.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    margin: '0 auto 1.5rem auto'
                  }}>
                    {selectedDepartment.icon}
                  </div>
                  
                  <h3 style={{ 
                    color: '#2c3e50', 
                    marginBottom: '0.5rem',
                    fontSize: '1.5rem'
                  }}>
                    {selectedDepartment.name}
                  </h3>
                  
                  <p style={{ 
                    color: '#666', 
                    marginBottom: '1.5rem',
                    fontSize: '1rem'
                  }}>
                    {selectedDepartment.description}
                  </p>

                  <div style={{
                    background: selectedDepartment.color,
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📱</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                      {selectedDepartment.phone}
                    </div>
                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                      {selectedDepartment.hours}
                    </div>
                  </div>

                  {/* Call Action Button */}
                  <button
                    onClick={() => window.open(`tel:${selectedDepartment.phone.replace(/[-\s]/g, '')}`)}
                    style={{
                      background: selectedDepartment.color,
                      color: 'white',
                      border: 'none',
                      padding: '1rem 2rem',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s',
                      width: '100%',
                      marginBottom: '1rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0px)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    📞 Call {selectedDepartment.name}
                  </button>

                  <button
                    onClick={() => setSelectedDepartment(null)}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'all 0.3s'
                    }}
                  >
                    ← Back to Departments
                  </button>
                </div>

                {/* Alternative Contact Methods */}
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h4 style={{ 
                    color: '#2c3e50', 
                    marginBottom: '1rem',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                  }}>
                    📱 Other Ways to Reach Us
                  </h4>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    <button
                      onClick={handleEmailSupport}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 5px 15px rgba(116, 185, 255, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>✉</span>
                      Submit Support Ticket
                    </button>
                    
                    <button
                      onClick={handleLiveChat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #00b894, #00a085)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}
                        onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 5px 15px rgba(0, 184, 148, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>💬</span>
                      Start Live Chat
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CallUs;