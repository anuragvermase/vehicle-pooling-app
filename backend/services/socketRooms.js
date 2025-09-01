export function joinUserRooms(socket, userId) {
  socket.join(`user:${userId}`);
  // join per-tenant or org rooms here if needed
}
export function toUser(io, userId) {
  return io.to(`user:${userId}`);
}
export function toRide(io, rideId) {
  return io.to(`ride:${rideId}`);
}