// Small helper so routes/other modules can emit consistent events

export const DASHBOARD_EVENTS = {
  STATS_UPDATED: "stats:updated",
  RIDES_UPDATED: "rides:updated",
  ACTIVITY_NEW: "activity:new",
  NOTIFY: "notification",
};

export function emitStats(io, userId, payload) {
  io.to(`user_${userId}`).emit(DASHBOARD_EVENTS.STATS_UPDATED, payload);
}

export function emitRides(io, userId, rides) {
  io.to(`user_${userId}`).emit(DASHBOARD_EVENTS.RIDES_UPDATED, rides);
}

export function emitActivity(io, userId, item) {
  io.to(`user_${userId}`).emit(DASHBOARD_EVENTS.ACTIVITY_NEW, item);
}

export function notify(io, userId, n) {
  io.to(`user_${userId}`).emit(DASHBOARD_EVENTS.NOTIFY, n);
}