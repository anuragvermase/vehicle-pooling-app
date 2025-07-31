import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const useWebSocket = (url, user) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const socketInstance = io(url, {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id
        }
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      // Listen for ride notifications
      socketInstance.on('ride_booked', (data) => {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'booking',
          title: 'New Booking!',
          message: `${data.passengerName} booked your ride from ${data.from} to ${data.to}`,
          time: new Date().toLocaleTimeString()
        }]);
      });

      socketInstance.on('ride_cancelled', (data) => {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'warning',
          title: 'Ride Cancelled',
          message: `Your ride from ${data.from} to ${data.to} has been cancelled`,
          time: new Date().toLocaleTimeString()
        }]);
      });

      socketInstance.on('payment_received', (data) => {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'payment',
          title: 'Payment Received',
          message: `₹${data.amount} received for your ride`,
          time: new Date().toLocaleTimeString()
        }]);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [url, user]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return {
    socket,
    isConnected,
    notifications,
    removeNotification
  };
};

export default useWebSocket;