import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import Booking from '../models/Booking.js';
import Analytics from '../models/Analytics.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get user dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's rides as driver
    const offeredRides = await Ride.find({ driver: userId });
    
    // Get user's bookings as passenger
    const userBookings = await Booking.find({ passenger: userId }).populate('ride');
    
    // Calculate statistics
    const stats = {
      // Basic counts
      ridesOffered: offeredRides.length,
      ridesTaken: userBookings.length,
      activeRides: offeredRides.filter(ride => ride.status === 'active').length,
      completedRides: offeredRides.filter(ride => ride.status === 'completed').length + 
                     userBookings.filter(booking => booking.status === 'completed').length,
      
      // Financial calculations
      totalEarnings: offeredRides.reduce((total, ride) => {
        const bookedSeats = ride.totalSeats - ride.availableSeats;
        return total + (bookedSeats * ride.pricePerSeat);
      }, 0),
      
      totalSpent: userBookings.reduce((total, booking) => {
        return total + (booking.totalAmount || 0);
      }, 0),
      
      // Distance and environmental impact
      totalDistance: [...offeredRides, ...userBookings.map(b => b.ride)].reduce((total, ride) => {
        return total + (ride.distance || 0);
      }, 0),
      
      // CO2 calculation (approximate: 0.21 kg CO2 per km saved by carpooling)
      co2Saved: Math.round([...offeredRides, ...userBookings.map(b => b.ride)].reduce((total, ride) => {
        return total + ((ride.distance || 0) * 0.21);
      }, 0)),
      
      // Average ratings
      avgRatingAsDriver: await calculateAvgRating(userId, 'driver'),
      avgRatingAsPassenger: await calculateAvgRating(userId, 'passenger'),
      
      // Monthly data for charts
      monthlyData: await getMonthlyData(userId),
      
      // Recent activity
      recentActivity: await getRecentActivity(userId)
    };
    
    // Calculate savings (fuel cost saved by carpooling)
    stats.fuelSaved = Math.round(stats.totalDistance * 0.08 * 100); // ₹8 per km fuel cost
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// @route   GET /api/dashboard/upcoming-rides
// @desc    Get upcoming rides for user
// @access  Private
router.get('/upcoming-rides', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Get upcoming rides as driver
    const upcomingOffered = await Ride.find({
      driver: userId,
      departureTime: { $gte: now },
      status: { $in: ['active', 'full'] }
    })
    .populate('bookings')
    .sort({ departureTime: 1 })
    .limit(10);
    
    // Get upcoming bookings as passenger
    const upcomingBookings = await Booking.find({
      passenger: userId,
      status: { $in: ['confirmed', 'pending'] }
    })
    .populate({
      path: 'ride',
      match: { departureTime: { $gte: now } },
      populate: { path: 'driver', select: 'name phone rating' }
    })
    .sort({ 'ride.departureTime': 1 })
    .limit(10);
    
    // Filter out bookings where ride is null (past rides)
    const validBookings = upcomingBookings.filter(booking => booking.ride);
    
    // Format the data
    const upcomingRides = [
      ...upcomingOffered.map(ride => ({
        id: ride._id,
        type: 'offered',
        route: {
          from: ride.startLocation.name,
          to: ride.endLocation.name
        },
        date: ride.departureTime.toISOString().split('T')[0],
        time: ride.departureTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        passengers: ride.totalSeats - ride.availableSeats,
        maxSeats: ride.totalSeats,
        earnings: ride.totalEarnings,
        status: ride.status,
        distance: ride.distance,
        pricePerSeat: ride.pricePerSeat
      })),
      ...validBookings.map(booking => ({
        id: booking._id,
        type: 'booked',
        route: {
          from: booking.ride.startLocation.name,
          to: booking.ride.endLocation.name
        },
        date: booking.ride.departureTime.toISOString().split('T')[0],
        time: booking.ride.departureTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        driver: booking.ride.driver.name,
        driverPhone: booking.ride.driver.phone,
        cost: booking.totalAmount,
        status: booking.status,
        seatsBooked: booking.seatsBooked,
        distance: booking.ride.distance
      }))
    ].sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    res.json({
      success: true,
      rides: upcomingRides
    });
    
  } catch (error) {
    logger.error('Upcoming rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming rides'
    });
  }
});

// @route   GET /api/dashboard/ride-history
// @desc    Get ride history with pagination
// @access  Private
router.get('/ride-history', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || 'all'; // all, offered, booked, completed, cancelled
    
    let rideHistory = [];
    
    // Get rides as driver
    if (filter === 'all' || filter === 'offered') {
      const driverRides = await Ride.find({ driver: userId })
        .populate('bookings')
        .sort({ departureTime: -1 });
        
      rideHistory = [...rideHistory, ...driverRides.map(ride => ({
        id: ride._id,
        type: 'offered',
        route: {
          from: ride.startLocation.name,
          to: ride.endLocation.name
        },
        date: ride.departureTime.toISOString().split('T')[0],
        time: ride.departureTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        passengers: ride.totalSeats - ride.availableSeats,
        maxSeats: ride.totalSeats,
        earnings: ride.totalEarnings,
        status: ride.status,
        distance: ride.distance,
        rating: calculateRideRating(ride.bookings, 'driver')
      }))];
    }
    
    // Get bookings as passenger
    if (filter === 'all' || filter === 'booked') {
      const passengerBookings = await Booking.find({ passenger: userId })
        .populate({
          path: 'ride',
          populate: { path: 'driver', select: 'name rating' }
        })
        .sort({ createdAt: -1 });
        
      rideHistory = [...rideHistory, ...passengerBookings.map(booking => ({
        id: booking._id,
        type: 'booked',
        route: {
          from: booking.ride.startLocation.name,
          to: booking.ride.endLocation.name
        },
        date: booking.ride.departureTime.toISOString().split('T')[0],
        time: booking.ride.departureTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        driver: booking.ride.driver.name,
        cost: booking.totalAmount,
        status: booking.status,
        seatsBooked: booking.seatsBooked,
        distance: booking.ride.distance,
        rating: booking.rating?.driverRating?.score || 0
      }))];
    }
    
    // Apply status filter
    if (filter === 'completed') {
      rideHistory = rideHistory.filter(ride => ride.status === 'completed');
    } else if (filter === 'cancelled') {
      rideHistory = rideHistory.filter(ride => ride.status === 'cancelled');
    }
    
    // Sort by date
    rideHistory.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRides = rideHistory.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      rides: paginatedRides,
      totalCount: rideHistory.length,
      currentPage: page,
      totalPages: Math.ceil(rideHistory.length / limit),
      hasMore: endIndex < rideHistory.length
    });
    
  } catch (error) {
    logger.error('Ride history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ride history'
    });
  }
});

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics for charts and insights
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const timeframe = req.query.timeframe || 'last30days'; // last7days, last30days, last3months, last6months
    
    const analytics = await generateAnalytics(userId, timeframe);
    
    res.json({
      success: true,
      analytics
    });
    
  } catch (error) {
    logger.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Helper functions
async function calculateAvgRating(userId, role) {
  try {
    let ratings = [];
    
    if (role === 'driver') {
      const bookings = await Booking.find({})
        .populate({
          path: 'ride',
          match: { driver: userId },
          select: 'driver'
        });
      
      ratings = bookings
        .filter(booking => booking.ride && booking.rating?.driverRating?.score)
        .map(booking => booking.rating.driverRating.score);
    } else {
      const bookings = await Booking.find({ 
        passenger: userId,
        'rating.passengerRating.score': { $exists: true }
      });
      
      ratings = bookings
        .filter(booking => booking.rating?.passengerRating?.score)
        .map(booking => booking.rating.passengerRating.score);
    }
    
    if (ratings.length === 0) return 0;
    
    const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round(avgRating * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    logger.error('Calculate avg rating error:', error);
    return 0;
  }
}

async function getMonthlyData(userId) {
  try {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      // Get rides offered
      const offeredRides = await Ride.find({
        driver: userId,
        departureTime: { $gte: monthStart, $lte: monthEnd },
        status: 'completed'
      });
      
      // Get rides taken
      const takenBookings = await Booking.find({
        passenger: userId,
        status: 'completed',
        createdAt: { $gte: monthStart, $lte: monthEnd }
      }).populate('ride');
      
      const monthData = {
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        ridesOffered: offeredRides.length,
        ridesTaken: takenBookings.length,
        earnings: offeredRides.reduce((total, ride) => {
          const bookedSeats = ride.totalSeats - ride.availableSeats;
          return total + (bookedSeats * ride.pricePerSeat);
        }, 0),
        spent: takenBookings.reduce((total, booking) => total + booking.totalAmount, 0),
        distance: [...offeredRides, ...takenBookings.map(b => b.ride)]
          .reduce((total, ride) => total + (ride.distance || 0), 0)
      };
      
      months.push(monthData);
    }
    
    return months;
  } catch (error) {
    logger.error('Get monthly data error:', error);
    return [];
  }
}

async function getRecentActivity(userId) {
  try {
    const activities = [];
    
    // Recent bookings received (as driver)
    const recentBookings = await Booking.find({})
      .populate({
        path: 'ride',
        match: { driver: userId },
        populate: { path: 'driver', select: 'name' }
      })
      .populate('passenger', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    recentBookings.forEach(booking => {
      if (booking.ride) {
        activities.push({
          id: booking._id,
          type: 'booking_received',
          message: `New booking from ${booking.passenger.name} for ${booking.ride.startLocation.name} to ${booking.ride.endLocation.name}`,
          time: getTimeAgo(booking.createdAt),
          icon: '🎯'
        });
      }
    });
    
    // Recent completed rides
    const recentCompleted = await Ride.find({
      driver: userId,
      status: 'completed',
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).sort({ updatedAt: -1 }).limit(3);
    
    recentCompleted.forEach(ride => {
      activities.push({
        id: ride._id,
        type: 'ride_completed',
        message: `Ride to ${ride.endLocation.name} completed successfully`,
        time: getTimeAgo(ride.updatedAt),
        icon: '✅'
      });
    });
    
    // Recent ratings received
    const recentRatings = await Booking.find({})
      .populate({
        path: 'ride',
        match: { driver: userId }
      })
      .populate('passenger', 'name')
      .sort({ 'rating.driverRating.ratedAt': -1 })
      .limit(3);
    
    recentRatings.forEach(booking => {
      if (booking.ride && booking.rating?.driverRating?.score) {
        activities.push({
          id: booking._id,
          type: 'rating_received',
          message: `Received ${booking.rating.driverRating.score}-star rating from ${booking.passenger.name}`,
          time: getTimeAgo(booking.rating.driverRating.ratedAt),
          icon: '⭐'
        });
      }
    });
    
    // Sort all activities by time and return top 10
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);
      
  } catch (error) {
    logger.error('Get recent activity error:', error);
    return [];
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return new Date(date).toLocaleDateString();
}

function calculateRideRating(bookings, role) {
  if (!bookings || bookings.length === 0) return 0;
  
  const ratings = bookings
    .map(booking => {
      if (role === 'driver') {
        return booking.rating?.driverRating?.score;
      } else {
        return booking.rating?.passengerRating?.score;
      }
    })
    .filter(rating => rating !== undefined);
  
  if (ratings.length === 0) return 0;
  
  const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return Math.round(avgRating * 10) / 10;
}

async function generateAnalytics(userId, timeframe) {
  // Implementation for detailed analytics based on timeframe
  // This would include charts data, insights, comparisons, etc.
  return {
    timeframe,
    chartData: [],
    insights: [],
    comparisons: {}
  };
}

export default router;