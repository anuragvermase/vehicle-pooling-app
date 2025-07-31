import express from 'express';
import { protect } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Ride from '../models/Ride.js';
import Booking from '../models/Booking.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/chat/rides/:rideId/messages
// @desc    Get messages for a ride
// @access  Private
router.get('/rides/:rideId/messages', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access to this ride's chat
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const isDriver = ride.driver.toString() === req.user.id;
    const booking = await Booking.findOne({ 
      ride: rideId, 
      passenger: req.user.id 
    });
    const isPassenger = !!booking;

    if (!isDriver && !isPassenger) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ 
      ride: rideId,
      isDeleted: false 
    })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { 
        ride: rideId, 
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      { 
        $push: { 
          readBy: { 
            user: req.user.id, 
            readAt: new Date() 
          } 
        } 
      }
    );

    const total = await Message.countDocuments({ 
      ride: rideId,
      isDeleted: false 
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
});

// @route   POST /api/chat/rides/:rideId/messages
// @desc    Send a message
// @access  Private
router.post('/rides/:rideId/messages', protect, async (req, res) => {
  try {
    const { rideId } = req.params;
    const { content, type = 'text', metadata } = req.body;

    // Verify user has access to this ride's chat
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    const isDriver = ride.driver.toString() === req.user.id;
    const booking = await Booking.findOne({ 
      ride: rideId, 
      passenger: req.user.id 
    });
    const isPassenger = !!booking;

    if (!isDriver && !isPassenger) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
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
      sender: req.user.id,
      recipients: participants.filter(p => p.toString() !== req.user.id),
      content,
      type,
      metadata
    });

    await message.save();
    await message.populate('sender', 'name profilePicture');

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
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

      io.to(`ride_${rideId}`).emit('new_message', messageData);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// @route   PUT /api/chat/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/messages/:messageId/read', protect, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is a recipient
    if (!message.recipients.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await message.markAsRead(req.user.id);

    // Emit socket event to sender
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${message.sender}`).emit('message_read', {
        messageId,
        readBy: req.user.id,
        readAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    logger.error('Mark message read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// @route   DELETE /api/chat/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/messages/:messageId', protect, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Can only delete your own messages'
      });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.to(`ride_${message.ride}`).emit('message_deleted', {
        messageId,
        deletedBy: req.user.id
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// @route   GET /api/chat/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    // Get rides where user is driver or passenger
    const driverRides = await Ride.find({ driver: req.user.id }).select('_id');
    const passengerBookings = await Booking.find({ passenger: req.user.id }).select('ride');
    
    const rideIds = [
      ...driverRides.map(ride => ride._id),
      ...passengerBookings.map(booking => booking.ride)
    ];

    // Get latest message for each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          ride: { $in: rideIds },
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$ride',
          latestMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$sender', req.user.id] },
                    { $not: { $in: [req.user.id, '$readBy.user'] } }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'rides',
          localField: '_id',
          foreignField: '_id',
          as: 'ride'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'latestMessage.sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $project: {
          ride: { $arrayElemAt: ['$ride', 0] },
          latestMessage: 1,
          sender: { $arrayElemAt: ['$sender', 0] },
          unreadCount: 1
        }
      },
      {
        $sort: { 'latestMessage.createdAt': -1 }
      }
    ]);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
});

export default router;