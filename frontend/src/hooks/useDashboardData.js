import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import API from "../services/api";
import useWebSockets from "./useWebSockets"; // your existing hook file name

const SOCKET_EVENTS = {
  JOIN: "dashboard:join",
  STATS_UPDATED: "stats:updated",
  RIDES_UPDATED: "rides:updated",
  ACTIVITY_NEW: "activity:new",
  NOTIFICATION: "notification",
};

function mergeMonthly(oldMonthly = [], patchMonthly = []) {
  const map = new Map();
  [...oldMonthly, ...patchMonthly].forEach(({ month, count, ridesOffered, ridesTaken, earnings }) => {
    const key = month;
    const prev = map.get(key) || { month, ridesOffered: 0, ridesTaken: 0, earnings: 0 };
    map.set(key, {
      month,
      ridesOffered: prev.ridesOffered + (ridesOffered || 0),
      ridesTaken: prev.ridesTaken + (ridesTaken || 0),
      earnings: prev.earnings + (earnings || 0),
    });
  });
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export default function useDashboardData(user) {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket, isConnected } = useWebSockets?.() ?? { socket: null, isConnected: false };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r] = await Promise.all([API.dashboard.getStats(), API.dashboard.getUpcomingRides()]);
      if (s?.success) {
        setStats(s.stats || null);
        setActivity(s.stats?.recentActivity || []);
      }
      if (r?.success) setUpcoming(Array.isArray(r.rides) ? r.rides : []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!socket) return;
    if (isConnected && user?.id) socket.emit(SOCKET_EVENTS.JOIN, { userId: user.id });

    const onStats = (payload) => {
      if (!payload) return;
      setStats((prev) => {
        const next = { ...(prev || {}), ...payload };
        if (prev?.monthlyData || payload?.monthlyData) {
          next.monthlyData = payload?.monthlyData
            ? prev?.monthlyData
              ? mergeMonthly(prev.monthlyData, payload.monthlyData)
              : payload.monthlyData
            : prev?.monthlyData;
        }
        return next;
      });
    };

    const onRides = (list) => Array.isArray(list) && setUpcoming(list);
    const onActivity = (item) => item && setActivity((p) => [item, ...p].slice(0, 50));

    socket.on?.(SOCKET_EVENTS.STATS_UPDATED, onStats);
    socket.on?.(SOCKET_EVENTS.RIDES_UPDATED, onRides);
    socket.on?.(SOCKET_EVENTS.ACTIVITY_NEW, onActivity);

    return () => {
      socket.off?.(SOCKET_EVENTS.STATS_UPDATED, onStats);
      socket.off?.(SOCKET_EVENTS.RIDES_UPDATED, onRides);
      socket.off?.(SOCKET_EVENTS.ACTIVITY_NEW, onActivity);
    };
  }, [socket, isConnected, user?.id]);

  const refresh = useCallback(() => fetchAll(), [fetchAll]);

  const derived = useMemo(() => {
    const rating = stats?.avgRatingAsDriver ?? null;
    return { totalUpcoming: upcoming.length, rating };
  }, [upcoming, stats]);

  return { stats, upcoming, activity, loading, error, connected: isConnected, derived, refresh };
}