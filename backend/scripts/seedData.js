import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../Model/User.js';
import Ride from '../Model/Ride.js';
import Booking from '../Model/Booking.js';
import connectDB from '../config/database.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    password: 'password123',
    phone: '+919876543210',
    bio: 'Experienced driver with 5 years of carpooling experience',
    isVerified: true,
    vehicle: {
      make: 'Maruti',
      model: 'Swift',
      year: 2020,
      color: 'White',
      plateNumber: 'DL01AB1234',
      verified: true
    }
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    password: 'password123',
    phone: '+919876543211',
    bio: 'Safe and punctual driver',
    isVerified: true,
    vehicle: {
      make: 'Honda',
      model: 'City',
      year: 2019,
      color: 'Silver',
      plateNumber: 'DL02CD5678',
      verified: true
    }
  },
  {
    name: 'Amit Singh',
    email: 'amit.singh@email.com',
    password: 'password123',
    phone: '+919876543212',
    bio: 'Regular commuter, prefer sharing rides',
    isVerified: true
  },
  {
    name: 'Neha Gupta',
    email: 'neha.gupta@email.com',
    password: 'password123',
    phone: '+919876543213',
    bio: 'Eco-conscious traveler',
    isVerified: true
  }
];

const sampleRides = [
  {
    startLocation: {
      name: 'Connaught Place, Delhi',
      coordinates: { lat: 28.6315, lng: 77.2167 },
      address: 'Connaught Place, New Delhi, Delhi 110001'
    },
    endLocation: {
      name: 'Cyber City, Gurgaon',
      coordinates: { lat: 28.4944, lng: 77.0787 },
      address: 'Cyber City, Sector 24, Gurugram, Haryana 122002'
    },
    departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    availableSeats: 3,
    totalSeats: 4,
    pricePerSeat: 150,
    distance: 25,
    duration: 45,
    preferences: {
      smokingAllowed: false,
      petsAllowed: false,
      musicAllowed: true,
      femaleOnly: false
    },
    description: 'Daily office commute, leaving sharp at time'
  },
  {
    startLocation: {
      name: 'Noida Sector 62',
      coordinates: { lat: 28.6267, lng: 77.3667 },
      address: 'Sector 62, Noida, Uttar Pradesh 201309'
    },
    endLocation: {
      name: 'Karol Bagh, Delhi',
      coordinates: { lat: 28.6519, lng: 77.1909 },
      address: 'Karol Bagh, New Delhi, Delhi 110005'
    },
    departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    availableSeats: 2,
    totalSeats: 3,
    pricePerSeat: 120,
    distance: 22,
    duration: 40,
    preferences: {
      smokingAllowed: false,
      petsAllowed: true,
      musicAllowed: true,
      femaleOnly: false
    },
    description: 'Comfortable ride with AC'
  },
  {
    startLocation: {
      name: 'Dwarka, Delhi',
      coordinates: { lat: 28.5921, lng: 77.0460 },
      address: 'Dwarka, New Delhi, Delhi 110075'
    },
    endLocation: {
      name: 'Rajouri Garden, Delhi',
      coordinates: { lat: 28.6496, lng: 77.1200 },
      address: 'Rajouri Garden, New Delhi, Delhi 110027'
    },
    departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    availableSeats: 1,
    totalSeats: 2,
    pricePerSeat: 80,
    distance: 15,
    duration: 30,
    preferences: {
      smokingAllowed: false,
      petsAllowed: false,
      musicAllowed: false,
      femaleOnly: true
    },
    description: 'Female only ride, safe and secure'
  }
];

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');
    
    await connectDB();
    
    // Clear existing data
    logger.info('Clearing existing data...');
    await User.deleteMany({});
    await Ride.deleteMany({});
    await Booking.deleteMany({});
    
    // Create users
    logger.info('Creating sample users...');
    const createdUsers = await User.create(sampleUsers);
    logger.info(`Created ${createdUsers.length} users`);
    
    // Create rides with driver references
    logger.info('Creating sample rides...');
    const ridesWithDrivers = sampleRides.map((ride, index) => ({
      ...ride,
      driver: createdUsers[index % 2]._id // Assign first two users as drivers
    }));
    
    const createdRides = await Ride.create(ridesWithDrivers);
    logger.info(`Created ${createdRides.length} rides`);
    
    // Create some bookings
    logger.info('Creating sample bookings...');
    const sampleBookings = [
      {
        ride: createdRides[0]._id,
        passenger: createdUsers[2]._id, // Amit Singh books Rajesh's ride
        seatsBooked: 1,
        totalAmount: 150,
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        ride: createdRides[1]._id,
        passenger: createdUsers[3]._id, // Neha books Priya's ride
        seatsBooked: 1,
        totalAmount: 120,
        status: 'confirmed',
        paymentStatus: 'paid'
      }
    ];
    
    const createdBookings = await Booking.create(sampleBookings);
    logger.info(`Created ${createdBookings.length} bookings`);
    
    // Update ride availability
    for (const booking of createdBookings) {
      await Ride.findByIdAndUpdate(booking.ride, {
        $inc: { availableSeats: -booking.seatsBooked },
        $push: { bookings: booking._id }
      });
    }
    
    // Add some completed rides for history
    logger.info('Creating completed rides...');
    const completedRides = [
      {
        driver: createdUsers[0]._id,
        startLocation: {
          name: 'Delhi Airport',
          coordinates: { lat: 28.5562, lng: 77.1000 },
          address: 'Indira Gandhi International Airport, New Delhi'
        },
        endLocation: {
          name: 'Gurgaon',
          coordinates: { lat: 28.4595, lng: 77.0266 },
          address: 'Gurgaon, Haryana'
        },
        departureTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        availableSeats: 0,
        totalSeats: 3,
        pricePerSeat: 200,
        distance: 30,
        duration: 50,
        status: 'completed'
      },
      {
        driver: createdUsers[1]._id,
        startLocation: {
          name: 'Mumbai Central',
          coordinates: { lat: 19.0760, lng: 72.8777 },
          address: 'Mumbai Central, Mumbai, Maharashtra'
        },
        endLocation: {
          name: 'Pune',
          coordinates: { lat: 18.5204, lng: 73.8567 },
          address: 'Pune, Maharashtra'
        },
        departureTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        availableSeats: 1,
        totalSeats: 4,
        pricePerSeat: 300,
        distance: 150,
        duration: 180,
        status: 'completed'
      }
    ];
    
    const completedRidesCreated = await Ride.create(completedRides);
    
    // Create bookings for completed rides
    const completedBookings = [
      {
        ride: completedRidesCreated[0]._id,
        passenger: createdUsers[2]._id,
        seatsBooked: 2,
        totalAmount: 400,
        status: 'completed',
        paymentStatus: 'paid',
        rating: {
          driverRating: {
            score: 5,
            comment: 'Excellent driver, very punctual!',
            ratedAt: new Date()
          }
        }
      },
      {
        ride: completedRidesCreated[1]._id,
        passenger: createdUsers[3]._id,
        seatsBooked: 1,
        totalAmount: 300,
        status: 'completed',
        paymentStatus: 'paid',
        rating: {
          driverRating: {
            score: 4,
            comment: 'Good ride, comfortable car',
            ratedAt: new Date()
          }
        }
      }
    ];
    
    await Booking.create(completedBookings);
    
    // Update user ratings
    await User.updateRating(createdUsers[0]._id, 5);
    await User.updateRating(createdUsers[1]._id, 4);
    
    // Update user stats
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      $set: {
        'stats.totalRidesOffered': 3,
        'stats.totalEarnings': 550,
        'stats.totalDistance': 70
      }
    });
    
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      $set: {
        'stats.totalRidesOffered': 2,
        'stats.totalEarnings': 420,
        'stats.totalDistance': 172
      }
    });
    
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      $set: {
        'stats.totalRidesTaken': 2,
        'stats.totalSpent': 550,
        'stats.totalDistance': 55
      }
    });
    
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      $set: {
        'stats.totalRidesTaken': 2,
        'stats.totalSpent': 420,
        'stats.totalDistance': 172
      }
    });
    
    logger.info('Database seeding completed successfully!');
    logger.info('Sample login credentials:');
    logger.info('Email: rajesh.kumar@email.com, Password: password123');
    logger.info('Email: priya.sharma@email.com, Password: password123');
    logger.info('Email: amit.singh@email.com, Password: password123');
    logger.info('Email: neha.gupta@email.com, Password: password123');
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;