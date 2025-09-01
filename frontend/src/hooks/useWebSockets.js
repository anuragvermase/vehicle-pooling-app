import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const useWebSocket = (url, user) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!user || socketRef.current) return;

    try {
      const socketInstance = io(url, {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id || user._id
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      socketRef.current = socketInstance;

      socketInstance.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        console.log('🔗 Connected to server');
      });

      socketInstance.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log('❌ Disconnected from server:', reason);
        
        // Auto-reconnect unless manually disconnected
        if (reason !== 'io client disconnect') {
          attemptReconnect();
        }
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        attemptReconnect();
      });

      // ADD: heartbeat reply for server ping
      socketInstance.on('server:ping', () => {
        try { socketInstance.emit('client:pong'); } catch {}
      });

      // Ride-related notifications
      socketInstance.on('ride_booked', (data) => {
        addNotification({
          type: 'booking',
          title: 'New Booking! 🎉',
          message: `${data.passengerName} booked ${data.seatsBooked} seat(s) for your ride from ${data.from} to ${data.to}`,
          data: data,
          priority: 'high'
        });
        
        showBrowserNotification('New Ride Booking!', `${data.passengerName} booked your ride`);
      });

      socketInstance.on('ride_cancelled', (data) => {
        addNotification({
          type: 'warning',
          title: 'Ride Cancelled ⚠',
          message: `Your ride from ${data.from} to ${data.to} has been cancelled. Reason: ${data.reason}`,
          data: data,
          priority: 'high'
        });
      });

      socketInstance.on('booking_cancelled', (data) => {
        addNotification({
          type: 'info',
          title: 'Booking Cancelled',
          message: `${data.passengerName} cancelled their booking for your ride`,
          data: data,
          priority: 'medium'
        });
      });

      socketInstance.on('ride_started', (data) => {
        addNotification({
          type: 'success',
          title: 'Ride Started! 🚗',
          message: `Your ride from ${data.from} to ${data.to} has started`,
          data: data,
          priority: 'high'
        });
      });

      socketInstance.on('ride_completed', (data) => {
        addNotification({
          type: 'success',
          title: 'Ride Completed! ✅',
          message: `Your ride from ${data.from} to ${data.to} has been completed successfully`,
          data: data,
          priority: 'medium'
        });
      });

      // Payment notifications
      socketInstance.on('payment_received', (data) => {
        addNotification({
          type: 'payment',
          title: 'Payment Received! 💰',
          message: `₹${data.amount} received from ${data.passengerName}`,
          data: data,
          priority: 'high'
        });
      });

      socketInstance.on('payment_failed', (data) => {
        addNotification({
          type: 'error',
          title: 'Payment Failed ❌',
          message: `Payment of ₹${data.amount} failed. Please try again.`,
          data: data,
          priority: 'high'
        });
      });

      // Real-time location updates
      socketInstance.on('location_update', (data) => {
        console.log('📍 Location update:', data);
        // Handle driver location updates for passengers
      });

      socketInstance.on('driver_approaching', (data) => {
        addNotification({
          type: 'info',
          title: 'Driver Approaching 🚗',
          message: `${data.driverName} is ${data.distance} away and will arrive in ${data.eta} minutes`,
          data: data,
          priority: 'high'
        });
        
        showBrowserNotification('Driver Approaching', `${data.driverName} will arrive in ${data.eta} minutes`);
      });

      // Chat messages
      socketInstance.on('new_message', (data) => {
        setMessages(prev => [...prev, {
          id: data._id,
          rideId: data.rideId,
          senderId: data.sender._id,
          senderName: data.sender.name,
          senderAvatar: data.sender.profilePicture,
          content: data.content,
          type: data.type,
          metadata: data.metadata,
          timestamp: data.createdAt,
          isRead: false
        }]);

        if (data.sender._id !== (user.id || user._id)) {
          addNotification({
            type: 'message',
            title: 'New Message 💬',
            message: `${data.sender.name}: ${data.content}`,
            data: data,
            priority: 'low'
          });
        }
      });

      socketInstance.on('message_read', (data) => {
        console.log('Message read:', data);
      });

      socketInstance.on('message_deleted', (data) => {
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
      });

      // Typing indicators
      socketInstance.on('user_typing', (data) => {
        setTypingUsers(prev => {
          if (!prev.find(u => u.userId === data.userId)) {
            return [...prev, data];
          }
          return prev;
        });
      });

      socketInstance.on('user_stopped_typing', (data) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      // Online users
      socketInstance.on('users_online', (users) => {
        setOnlineUsers(users);
      });

      // Emergency notifications
      socketInstance.on('emergency_alert', (data) => {
        addNotification({
          type: 'emergency',
          title: 'Emergency Alert! 🚨',
          message: data.message,
          data: data,
          priority: 'critical'
        });

        showBrowserNotification('Emergency Alert!', data.message, {
          requireInteraction: true,
          tag: 'emergency'
        });
      });

      // Ride matching notifications
      socketInstance.on('ride_match_found', (data) => {
        addNotification({
          type: 'info',
          title: 'Perfect Match Found! 🎯',
          message: `We found a ride that matches your search from ${data.from} to ${data.to}`,
          data: data,
          priority: 'medium'
        });
      });

      // Trip tracking events
      socketInstance.on('trip_started', (data) => {
        addNotification({
          type: 'info',
          title: 'Trip Started 🚀',
          message: `Your trip has started. Have a safe journey!`,
          data: data,
          priority: 'medium'
        });
      });

      socketInstance.on('trip_completed', (data) => {
        addNotification({
          type: 'success',
          title: 'Trip Completed! 🏁',
          message: `Your trip has been completed. Don't forget to rate your experience!`,
          data: data,
          priority: 'medium'
        });
      });

      // Booking status updates
      socketInstance.on('booking_status_updated', (data) => {
        addNotification({
          type: 'info',
          title: 'Booking Updated',
          message:  `Your booking status has been updated to: ${data.status}`,
          data: data,
          priority: 'medium'
        });
      });

      // User joined/left ride
      socketInstance.on('user_joined_ride', (data) => {
        console.log(`${data.userName} joined the ride as ${data.userType}`);
      });

      socketInstance.on('user_left_ride', (data) => {
        console.log(`${data.userName} left the ride`);
      });

      setSocket(socketInstance);

    } catch (error) {
      console.error('Failed to create socket connection:', error);
      setConnectionError(error.message);
    }
  }, [url, user]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      setConnectionError('Unable to connect to server. Please refresh the page.');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    console.log(`Attempting to reconnect in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setSocket(null);
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  // Initialize connection
  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Helper functions
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications
  }, []);

  const showBrowserNotification = useCallback((title, body, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        ...options
      });
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const sendMessage = useCallback((rideId, content, type = 'text', metadata = {}) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        rideId,
        content,
        type,
        metadata,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Socket not connected');
    }
  }, [socket, isConnected]);

  const joinRideRoom = useCallback((rideId) => {
    if (socket && isConnected) {
      socket.emit('join_ride', { rideId });
    }
  }, [socket, isConnected]);

  const leaveRideRoom = useCallback((rideId) => {
    if (socket && isConnected) {
      socket.emit('leave_ride', { rideId });
    }
  }, [socket, isConnected]);

  const updateLocation = useCallback((rideId, location) => {
    if (socket && isConnected) {
      socket.emit('update_location', {
        rideId,
        location,
        timestamp: new Date().toISOString()
      });
    }
  }, [socket, isConnected]);

  const sendEmergencyAlert = useCallback((rideId, type, description, location) => {
    if (socket && isConnected) {
      socket.emit('emergency_alert', {
        rideId,
        type,
        description,
        location,
        timestamp: new Date().toISOString()
      });
    }
  }, [socket, isConnected]);

  const startTyping = useCallback((rideId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { rideId });
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((rideId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { rideId });
    }
  }, [socket, isConnected]);

  const updateUserStatus = useCallback((status) => {
    if (socket && isConnected) {
      socket.emit('update_status', { status });
    }
  }, [socket, isConnected]);

  const markMessageAsRead = useCallback((messageId) => {
    if (socket && isConnected) {
      socket.emit('mark_message_read', { messageId });
    }
  }, [socket, isConnected]);

  const updateRideStatus = useCallback((rideId, status, reason = '') => {
    if (socket && isConnected) {
      socket.emit('update_ride_status', { rideId, status, reason });
    }
  }, [socket, isConnected]);

  const updateBookingStatus = useCallback((bookingId, status, reason = '') => {
    if (socket && isConnected) {
      socket.emit('update_booking_status', { bookingId, status, reason });
    }
  }, [socket, isConnected]);

  // Computed values
  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadMessages = messages.filter(m => !m.isRead && m.senderId !== (user?.id || user?._id));

  return {
    // Connection state
    socket,
    isConnected,
    connectionError,
    
    // Data
    notifications,
    messages,
    onlineUsers,
    typingUsers,
    unreadNotifications,
    unreadMessages,
    
    // Notification actions
    removeNotification,
    markNotificationAsRead,
    clearAllNotifications,
    
    // Message actions
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping,
    
    // Ride actions
    joinRideRoom,
    leaveRideRoom,
    updateLocation,
    updateRideStatus,
    updateBookingStatus,
    
    // Emergency
    sendEmergencyAlert,
    
    // User status
    updateUserStatus,
    
    // Connection control
    connect,
    disconnect
  };
};

export default useWebSocket;