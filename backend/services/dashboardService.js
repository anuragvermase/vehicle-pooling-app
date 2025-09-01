// Centralized service helpers used by dashboard routes (non-breaking)
// You can optionally import and use these in routes/dashboard.js

import Ride from "../models/Ride.js";
import Booking from "../models/Booking.js";

export async function getUserStats(userId) {
  const [offeredRides, passengerBookings] = await Promise.all([
    Ride.find({ driver: userId }),
    Booking.find({ passenger: userId }).populate("ride"),
  ]);

  const totalEarnings = offeredRides.reduce((sum, r) => {
    const booked = (r.totalSeats || 0) - (r.availableSeats || 0);
    return sum + booked * (r.pricePerSeat || 0);
  }, 0);

  const totalSpent = passengerBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const allRides = [...offeredRides, ...passengerBookings.map((b) => b.ride).filter(Boolean)];
  const totalDistance = allRides.reduce((sum, r) => sum + (r?.distance || 0), 0);

  const months = await buildMonthly(userId);

  return {
    ridesOffered: offeredRides.length,
    ridesTaken: passengerBookings.length,
    activeRides: offeredRides.filter((r) => r.status === "active").length,
    completedRides:
      offeredRides.filter((r) => r.status === "completed").length +
      passengerBookings.filter((b) => b.status === "completed").length,
    totalEarnings,
    totalSpent,
    totalDistance,
    co2Saved: Math.round(totalDistance * 0.21),
    monthlyData: months,
  };
}

export async function getUpcoming(userId) {
  const now = new Date();
  const offered = await Ride.find({
    driver: userId,
    departureTime: { $gte: now },
    status: { $in: ["active", "full"] },
  })
    .sort({ departureTime: 1 })
    .limit(10);

  const bookings = await Booking.find({
    passenger: userId,
    status: { $in: ["confirmed", "pending"] },
  })
    .populate("ride")
    .sort({ createdAt: -1 })
    .limit(10);

  const valid = bookings.filter((b) => b.ride);
  const data = [
    ...offered.map((r) => ({
      id: r._id,
      type: "offered",
      route: { from: r.startLocation?.name, to: r.endLocation?.name },
      date: r.departureTime.toISOString().slice(0, 10),
      time: r.departureTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      passengers: (r.totalSeats || 0) - (r.availableSeats || 0),
      maxSeats: r.totalSeats,
      earnings: r.totalEarnings,
      status: r.status,
      distance: r.distance,
      pricePerSeat: r.pricePerSeat,
    })),
    ...valid.map((b) => ({
      id: b._id,
      type: "booked",
      route: { from: b.ride.startLocation?.name, to: b.ride.endLocation?.name },
      date: b.ride.departureTime.toISOString().slice(0, 10),
      time: b.ride.departureTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      driver: b.ride.driver?.name,
      cost: b.totalAmount,
      status: b.status,
      seatsBooked: b.seatsBooked,
      distance: b.ride.distance,
    })),
  ].sort((a, b) => new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time));

  return data;
}

async function buildMonthly(userId) {
  const out = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const [driverRides, takenBookings] = await Promise.all([
      Ride.find({ driver: userId, departureTime: { $gte: start, $lte: end }, status: "completed" }),
      Booking.find({ passenger: userId, status: "completed", createdAt: { $gte: start, $lte: end } }).populate("ride"),
    ]);
    out.push({
      month: start.toLocaleDateString("en-US", { month: "short" }),
      ridesOffered: driverRides.length,
      ridesTaken: takenBookings.length,
      earnings: driverRides.reduce((sum, r) => sum + ((r.totalSeats - r.availableSeats) * (r.pricePerSeat || 0)), 0),
    });
  }
  return out;
}