import React, { useState, useEffect } from 'react';

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5001);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      case 'booking': return '🎯';
      case 'ride': return '🚗';
      case 'payment': return '💰';
      default: return '📢';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#dc2626';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'booking': return '#8b5cf6';
      case 'ride': return '#667eea';
      case 'payment': return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      maxWidth: '400px',
      width: '90%'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '1rem 1.5rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        border: `3px solid ${getColor(notification.type)}20`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{
          fontSize: '1.5rem',
          flexShrink: 0
        }}>
          {getIcon(notification.type)}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: '600',
            color: '#333',
            marginBottom: '0.25rem',
            fontSize: '1rem'
          }}>
            {notification.title}
          </div>
          <div style={{
            color: '#666',
            fontSize: '0.9rem',
            lineHeight: 1.4
          }}>
            {notification.message}
          </div>
          {notification.time && (
            <div style={{
              color: '#999',
              fontSize: '0.8rem',
              marginTop: '0.5rem'
            }}>
              {notification.time}
            </div>
          )}
        </div>
        
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#999',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;