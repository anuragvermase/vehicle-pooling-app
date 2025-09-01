import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import Booking from '../models/Booking.js';
import Message from '../models/Message.js';
import { logger } from '../utils/logger.js';
import { calculateDistance } from '../services/googleMapsService.js';

// ✅ NEW: login devices / sessions tracking
import Session from '../models/Session.js';

const connectedUsers = new Map();
const rideRooms = new Map();

export const initializeSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    logger.info(`User connected: ${socket.user.name} (${socket.userId})`);
    
    // Store connected user
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date(),
      isOnline: true
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // ===== Heartbeat: server ping → client pong (keeps sockets fresh) =====
    let alive = true;
    const heartbeat = setInterval(() => {
      if (!alive) {
        try { socket.disconnect(true); } catch {}
        return;
      }
      alive = false;
      socket.emit('server:ping');
    }, 15000);
    socket.on('client:pong', () => { alive = true; });
    // =====================================================================

    // ✅ NEW: create/update Session document (login devices list)
    try {
      const ua = socket.handshake.headers['user-agent'] || '';
      const ip =
        socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        socket.handshake.address ||
        '';
      await Session.findOneAndUpdate(
        { user: socket.userId, sessionId: socket.id },
        {
          user: socket.userId,
          sessionId: socket.id,
          device: ua,
          ip,
          current: true,
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      logger.error('Session upsert error:', e);
    }

    // Broadcast updated online users list
    broadcastOnlineUsers(io);

    // Handle joining ride rooms
    socket.on('join_ride', async (data) => {
      try {
        const { rideId } = data;
        const ride = await Ride.findById(rideId).populate('driver bookings');
        
        if (!ride) {
          socket.emit('error', { message: 'Ride not found' });
          return;
        }

        // Check if user is driver or passenger
        const isDriver = ride.driver._id.toString() === socket.userId;
        const isPassenger = ride.bookings.some(booking => 
          booking.passenger && booking.passenger.toString() === socket.userId
        );

        if (!isDriver && !isPassenger) {
          socket.emit('error', { message: 'Unauthorized to join this ride' });
          return;
        }

        socket.join(`ride_${rideId}`);
        
        // Add to ride room tracking
        if (!rideRooms.has(rideId)) {
          rideRooms.set(rideId, new Set());
        }
        rideRooms.get(rideId).add(socket.userId);

        logger.info(`User ${socket.user.name} joined ride ${rideId}`);
        
        // Notify others in the room
        socket.to(`ride_${rideId}`).emit('user_joined_ride', {
          userId: socket.userId,
          userName: socket.user.name,
          userType: isDriver ? 'driver' : 'passenger'
        });

      } catch (error) {
        logger.error('Join ride error:', error);
        socket.emit('error', { message: 'Failed to join ride' });
      }
    });

    // Handle leaving ride rooms
    socket.on('leave_ride', (data) => {
      const { rideId } = data;
      socket.leave(`ride_${rideId}`);
      
      if (rideRooms.has(rideId)) {
        rideRooms.get(rideId).delete(socket.userId);
        if (rideRooms.get(rideId).size === 0) {
          rideRooms.delete(rideId);
        }
      }

      socket.to(`ride_${rideId}`).emit('user_left_ride', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Handle real-time location updates
    socket.on('update_location', async (data) => {
      try {
        const { rideId, location } = data;
        
        const ride = await Ride.findById(rideId);
        if (!ride) {
          socket.emit('error', { message: 'Ride not found' });
          return;
        }

        // Verify user is the driver
        if (ride.driver.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only driver can update location' });
          return;
        }

        // Update ride location
        await ride.updateLocation(location.lat, location.lng);

        // Broadcast location to all passengers in the ride
        socket.to(`ride_${rideId}`).emit('location_update', {
          rideId,
          driverLocation: location,
          timestamp: new Date().toISOString(),
          driverName: socket.user.name
        });

        // Calculate ETA and distance for each passenger
        const bookings = await Booking.find({ 
          ride: rideId, 
          status: { $in: ['confirmed', 'active'] } 
        }).populate('passenger');

        for (const booking of bookings) {
          if (booking.pickupLocation && booking.pickupLocation.coordinates) {
            // Calculate distance and ETA to passenger pickup
            const distance = calculateDistance(
              location.lat, 
              location.lng,
              booking.pickupLocation.coordinates.lat,
              booking.pickupLocation.coordinates.lng
            );

            // Notify passenger if driver is close (within 1km)
            if (distance <= 1) {
              const eta = Math.round(distance * 3); // Rough ETA in minutes
              
              io.to(`user_${booking.passenger._id}`).emit('driver_approaching', {
                rideId,
                driverName: socket.user.name,
                distance: `${distance.toFixed(1)} km`,
                eta: eta,
                driverLocation: location
              });
            }
          }
        }

      } catch (error) {
        logger.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      try {
        const { rideId, content, type = 'text', metadata } = data;
        
        const ride = await Ride.findById(rideId);
        if (!ride) {
          socket.emit('error', { message: 'Ride not found' });
          return;
        }

        // Verify user is part of the ride
        const isDriver = ride.driver.toString() === socket.userId;
        const bookings = await Booking.find({ 
          ride: rideId, 
          passenger: socket.userId 
        });
        const isPassenger = bookings.length > 0;

        if (!isDriver && !isPassenger) {
          socket.emit('error', { message: 'Unauthorized to send messages' });
          return;
        }

        // Get all participants
        const participants = [ride.driver];
        const rideBookings = await Booking.find({ ride: rideId }).populate('passenger');
        rideBookings.forEach(booking => {
          if (booking.passenger) {
            participants.push(booking.passenger._id);
          }
        });

        // Create message
        const message = new Message({
          ride: rideId,
          sender: socket.userId,
          recipients: participants.filter(p => p.toString() !== socket.userId),
          content,
          type,
          metadata
        });

        await message.save();
        await message.populate('sender', 'name profilePicture');

        const messageData = {
          _id: message._id,
          rideId,
          sender: {
            _id: message.sender._id,
            name: message.sender.name,
            profilePicture: message.sender.profilePicture
          },
          content: message.content,
          type: message.type,
          metadata: message.metadata,
          createdAt: message.createdAt,
          isRead: false
        };

        // Broadcast message to all users in the ride room
        io.to(`ride_${rideId}`).emit('new_message', messageData);

      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read status
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        await message.markAsRead(socket.userId);

        // Notify sender about read status
        socket.to(`user_${message.sender}`).emit('message_read', {
          messageId,
          readBy: socket.userId,
          readAt: new Date()
        });

      } catch (error) {
        logger.error('Mark message read error:', error);
      }
    });

    // Handle emergency alerts
    socket.on('emergency_alert', async (data) => {
      try {
        const { rideId, type, description, location } = data;
        
        const ride = await Ride.findById(rideId).populate('driver bookings');
        if (!ride) {
          socket.emit('error', { message: 'Ride not found' });
          return;
        }

        const emergencyData = {
          alertId: Date.now(),
          rideId,
          userId: socket.userId,
          userName: socket.user.name,
          type,
          description,
          location,
          timestamp: new Date().toISOString(),
          severity: 'high'
        };

        // Notify all users in the ride
        io.to(`ride_${rideId}`).emit('emergency_alert', emergencyData);

        // Notify emergency contacts
        if (socket.user.emergencyContacts) {
          socket.user.emergencyContacts.forEach(contact => {
            // Send SMS/Email to emergency contacts
            // Implementation depends on your notification service
          });
        }

        // Log emergency
        logger.warn(`Emergency alert from ${socket.user.name} in ride ${rideId}: ${type} - ${description}`);

      } catch (error) {
        logger.error('Emergency alert error:', error);
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Handle ride status updates
    socket.on('update_ride_status', async (data) => {
      try {
        const { rideId, status, reason } = data;
        
        const ride = await Ride.findById(rideId).populate('bookings');
        if (!ride) {
          socket.emit('error', { message: 'Ride not found' });
          return;
        }

        // Verify user is the driver
        if (ride.driver.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only driver can update ride status' });
          return;
        }

        // Update ride status
        ride.status = status;
        await ride.save();

        const statusData = {
          rideId,
          status,
          reason,
          driverName: socket.user.name,
          from: ride.startLocation.name,
          to: ride.endLocation.name,
          timestamp: new Date().toISOString()
        };

        // Notify all passengers
        for (const booking of ride.bookings) {
          if (booking.passenger) {
            io.to(`user_${booking.passenger}`).emit(`ride_${status}`, statusData);
          }
        }

        // Broadcast to ride room
        socket.to(`ride_${rideId}`).emit(`ride_${status}`, statusData);

      } catch (error) {
        logger.error('Ride status update error:', error);
        socket.emit('error', { message: 'Failed to update ride status' });
      }
    });

    // Handle booking status updates
    socket.on('update_booking_status', async (data) => {
      try {
        const { bookingId, status, reason } = data;
        
        const booking = await Booking.findById(bookingId)
          .populate('passenger', 'name')
          .populate('ride');
        
        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        // Verify user can update this booking
        const canUpdate = booking.ride.driver.toString() === socket.userId || 
                         booking.passenger._id.toString() === socket.userId;

        if (!canUpdate) {
          socket.emit('error', { message: 'Not authorized to update this booking' });
          return;
        }

        // Update booking status
        booking.status = status;
        if (reason) {
          booking.cancellation = {
            reason,
            cancelledBy: socket.userId,
            cancelledAt: new Date()
          };
        }
        await booking.save();

        const statusData = {
          bookingId,
          status,
          reason,
          updatedBy: socket.user.name,
          timestamp: new Date().toISOString()
        };

        // Notify the other party
        const otherParty = booking.ride.driver.toString() === socket.userId ? 
                          booking.passenger._id : booking.ride.driver;
        
        io.to(`user_${otherParty}`).emit('booking_status_updated', statusData);

      } catch (error) {
        logger.error('Booking status update error:', error);
        socket.emit('error', { message: 'Failed to update booking status' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { rideId } = data;
      socket.to(`ride_${rideId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      const { rideId } = data;
      socket.to(`ride_${rideId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Handle user status updates
    socket.on('update_status', (data) => {
      const { status } = data; // 'online', 'busy', 'away'
      
      if (connectedUsers.has(socket.userId)) {
        connectedUsers.get(socket.userId).status = status;
        broadcastOnlineUsers(io);
      }
    });

    // Handle user disconnection
    socket.on('disconnect', async () => {
      // clear heartbeat
      clearInterval(heartbeat);

      logger.info(`User disconnected: ${socket.user.name} (${socket.userId})`);
      
      // Update user status
      if (connectedUsers.has(socket.userId)) {
        connectedUsers.get(socket.userId).isOnline = false;
        connectedUsers.get(socket.userId).lastSeen = new Date();
      }

      // ✅ NEW: mark session as not current
      try {
        await Session.findOneAndUpdate(
          { user: socket.userId, sessionId: socket.id },
          { current: false, lastActive: new Date() }
        );
      } catch (e) {
        logger.error('Session disconnect update error:', e);
      }
      
      // Remove from all ride rooms
      for (const [rideId, users] of rideRooms.entries()) {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          socket.to(`ride_${rideId}`).emit('user_left_ride', {
            userId: socket.userId,
            userName: socket.user.name
          });
          
          if (users.size === 0) {
            rideRooms.delete(rideId);
          }
        }
      }

      // Broadcast updated online users list
      setTimeout(() => {
        connectedUsers.delete(socket.userId);
        broadcastOnlineUsers(io);
      }, 30000); // Remove after 30 seconds
    });

    // Send initial data
    socket.emit('connected', {
      userId: socket.userId,
      userName: socket.user.name,
      timestamp: new Date().toISOString()
    });
  });

  // Periodic cleanup of inactive connections
  setInterval(() => {
    const now = new Date();
    for (const [userId, userData] of connectedUsers.entries()) {
      const timeDiff = now - userData.lastSeen;
      if (timeDiff > 30 * 60 * 1000) { // 30 minutes
        connectedUsers.delete(userId);
      }
    }
    broadcastOnlineUsers(io);
  }, 5 * 60 * 1000); // Check every 5 minutes
};

// Helper functions
function broadcastOnlineUsers(io) {
  const onlineUsers = Array.from(connectedUsers.values())
    .filter(userData => userData.isOnline)
    .map(userData => ({
      userId: userData.user._id,
      name: userData.user.name,
      status: userData.status || 'online',
      lastSeen: userData.lastSeen
    }));
  
  io.emit('users_online', onlineUsers);
}

// Export notification helper functions
export const notifyRideBooked = (io, rideId, bookingData) => {
  io.to(`user_${bookingData.driverId}`).emit('ride_booked', bookingData);
};

export const notifyRideCancelled = (io, rideId, cancellationData) => {
  io.to(`ride_${rideId}`).emit('ride_cancelled', cancellationData);
};

export const notifyPaymentReceived = (io, driverId, paymentData) => {
  io.to(`user_${driverId}`).emit('payment_received', paymentData);
};

export const notifyEmergency = (io, rideId, emergencyData) => {
  io.to(`ride_${rideId}`).emit('emergency_alert', emergencyData);
};