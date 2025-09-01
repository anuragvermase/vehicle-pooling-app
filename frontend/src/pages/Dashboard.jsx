import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Suspense,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import Loading from "../components/Loading";
import NotificationToast from "../components/NotificationToast";
import useWebSockets from "../hooks/useWebSockets";
import API from "../services/api";

import RideList from "../components/dashboard/RideList.jsx";
import QuickActions from "../components/dashboard/QuickActions.jsx";
import ActivityFeed from "../components/dashboard/ActivityFeed.jsx";

const EnhancedMapDark = React.lazy(() =>
  import("../components/maps/EnhancedMapDark.jsx")
);

/** Error boundary so one crashing child can’t blank the whole page */
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, msg: "" };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, msg: err?.message || "Section failed to render." };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Dashboard section error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1f2937",
            borderRadius: 16,
            padding: "1rem",
            color: "#fca5a5",
          }}
        >
          ⚠ Couldn’t render this section. {this.state.msg}
        </div>
      );
    }
    return this.props.children;
  }
}

const ROUTES = {
  HOME: "/",              // 👈 added
  OFFER_RIDE: "/offer-ride",
  FIND_RIDES: "/find-ride",
  SUPPORT: "/support",
  MY_RIDES: "/my-rides",
};

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // Core state (kept)
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [upcomingRides, setUpcomingRides] = useState([]);

  // kept for future needs (history/filter)
  const [rideHistory, setRideHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // UX
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // Live ride + location
  const [activeRide, setActiveRide] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [locationTrail, setLocationTrail] = useState([]);

  // Socket
  const { socket, isConnected } = useWebSockets?.() ?? {
    socket: null,
    isConnected: false,
  };

  // Toast helper
  const pushToast = (payload) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, ...payload }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  };

  // Initial fetch
  useEffect(() => {
    (async () => {
      await fetchAll();
      try {
        if (API?.dashboard?.getActiveRide) {
          const r = await API.dashboard.getActiveRide();
          if (r?.success && r?.ride) setActiveRide(r.ride);
        }
      } catch (_) {}
    })();
  }, []);

  // Socket wiring (unchanged)
  useEffect(() => {
    if (!socket) return;

    const onRideNew = (ride) => {
      setUpcomingRides((prev) => [ride, ...prev]);
      pushToast({
        type: "success",
        title: "New ride",
        message: `${ride?.route?.from} → ${ride?.route?.to} at ${ride?.time}`,
      });
    };

    const onRideUpdate = (payload) => {
      const { id, status, eta, earnings, cost } = payload || {};
      setUpcomingRides((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, eta, earnings, cost } : r))
      );
      setRideHistory((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, eta, earnings, cost } : r))
      );
      if (activeRide?.id === id)
        setActiveRide((r) => ({ ...r, status, eta, earnings, cost }));
      pushToast({
        type: "info",
        title: "Ride updated",
        message: `Status: ${status}${eta ? ` • ETA ${eta}m` : ""}`,
      });
    };

    const onRideCancel = ({ id, reason }) => {
      setUpcomingRides((prev) => prev.filter((r) => r.id !== id));
      if (activeRide?.id === id) setActiveRide(null);
      pushToast({
        type: "warning",
        title: "Ride cancelled",
        message: reason || "The ride was cancelled.",
      });
    };

    const onSystemNotice = ({ title, message }) =>
      pushToast({ type: "info", title: title || "Notice", message: message || "" });

    const onLocationUpdate = ({ lat, lng, ts, rideId }) => {
      setLiveLocation({ lat, lng, ts });
      setLocationTrail((prev) => {
        const next = [...prev, { lat, lng }];
        return next.length > 50 ? next.slice(next.length - 50) : next;
      });
      if (activeRide?.id === rideId) setActiveRide((r) => (r ? { ...r } : r));
    };

    socket.on?.("ride:new", onRideNew);
    socket.on?.("ride:update", onRideUpdate);
    socket.on?.("ride:cancel", onRideCancel);
    socket.on?.("system:notice", onSystemNotice);
    socket.on?.("location:update", onLocationUpdate);

    return () => {
      socket.off?.("ride:new", onRideNew);
      socket.off?.("ride:update", onRideUpdate);
      socket.off?.("ride:cancel", onRideCancel);
      socket.off?.("system:notice", onSystemNotice);
      socket.off?.("location:update", onLocationUpdate);
    };
  }, [socket, activeRide]);

  // Data fetchers
  const fetchAll = async () => {
    try {
      setError(null);
      const [statsRes, upcRes] = await Promise.all([
        API.dashboard.getStats(),
        API.dashboard.getUpcomingRides(),
      ]);
      if (statsRes?.success) setStats(statsRes.stats || {});
      if (upcRes?.success) setUpcomingRides(upcRes.rides || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
      setLoading(false);
    }
  };

  const fetchRideHistory = async (page = 1, filter = "all") => {
    try {
      setRefreshing(true);
      const res = await API.dashboard.getRideHistory(page, 10, filter);
      if (res?.success) {
        setRideHistory(res.rides || []);
        setCurrentPage(res.currentPage || page);
      }
    } catch (err) {
      setError(err.message || "Failed to load ride history");
    } finally {
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAll();
    await fetchRideHistory(currentPage, historyFilter);
    setRefreshing(false);
  };

  /** ---------- Visual tokens (only UI polish) ---------- */
  const COLORS = {
    bg: "#0b1220",
    panel: "#0f172a",
    panelBorder: "#1f2937",
    text: "#e5e7eb",
    dim: "#9ca3af",
    glow: "0 10px 28px rgba(0,0,0,.45)",
  };

  const page = {
    width: "100vw",
    minHeight: "100vh",
    overflowX: "hidden",
    background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bg} 60%, #0f1629 100%)`,
    color: "white",
  };

  const container = {
    width: "100%",
    padding: "16px",
    margin: "0 auto",
    maxWidth: 1320,
  };

  const card = {
    background: COLORS.panel,
    borderRadius: 16,
    padding: "1rem",
    border: `1px solid ${COLORS.panelBorder}`,
    boxShadow: COLORS.glow,
  };

  const cardTitle = {
    fontWeight: 800,
    color: COLORS.text,
  };

  const chipBtn = (borderClr, textClr) => ({
    padding: ".45rem .8rem",
    background: "transparent",
    color: textClr,
    borderRadius: 999,
    border: `2px solid ${borderClr}`,
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    lineHeight: 1,
  });

  const avatarBtn = {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,.08)",
    background: "#0f172a",
    color: "#e5e7eb",
    cursor: "pointer",
    padding: 0,
    outline: "none",
  };

  const menu = {
    position: "absolute",
    right: 0,
    top: 46,
    zIndex: 40,
    background: COLORS.panel,
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 12,
    minWidth: 180,
    padding: 6,
    boxShadow: "0 18px 42px rgba(0,0,0,.45)",
  };

  const menuItem = {
    display: "block",
    textDecoration: "none",
    color: "#e5e7eb",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 14,
  };

  const ActiveRideBanner = () =>
    !activeRide ? null : (
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(102,126,234,0.12))",
          border: `1px solid ${COLORS.panelBorder}`,
          borderRadius: 16,
          padding: "1rem 1.25rem",
          color: "white",
          boxShadow: COLORS.glow,
        }}
      >
        🟢 <strong>Active ride:</strong>{" "}
        {activeRide?.route?.from} → {activeRide?.route?.to}
        {activeRide?.eta ? <> • ETA {activeRide.eta} min</> : null}
        {isConnected ? <> • live</> : <> • reconnecting…</>}
      </div>
    );

  // ===== header dropdown state (same UX as Profile/Overview)
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await API.users?.me?.().catch(() => null);
      setMe(res?.user || user || null);
    })();
  }, [user]);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const initials = React.useMemo(() => {
    const n = me?.name || "";
    return n
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [me?.name]);

  if (loading) return <Loading />;
  if (error) return <FullScreenError message={error} onRetry={refreshData} />;

  return (
    <div style={page}>
      {/* Toasts */}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50 }}>
        {toasts.map((t) => (
          <NotificationToast
            key={t.id}
            type={t.type}
            title={t.title}
            message={t.message}
            onClose={() => setToasts((x) => x.filter((i) => i.id !== t.id))}
          />
        ))}
      </div>

      {/* Header (Dashboard + home + avatar dropdown) */}
      <div style={{ ...container, paddingTop: 20, paddingBottom: 12 }} ref={menuRef}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              Welcome back, {user?.name || me?.name || "User"} •{" "}
              {isConnected ? "Live" : "Offline"}
            </div>
          </div>

          {/* Right side: Back to Home + Avatar menu */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* 👇 New: Back to Home chip */}
            <Link to={ROUTES.HOME} style={chipBtn("#34d399", "#34d399")} title="Go to Home">
              ← Home
            </Link>

            {/* Avatar dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                style={avatarBtn}
                title="Menu"
              >
                {me?.avatarUrl ? (
                  <img
                    src={me.avatarUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    {initials || "U"}
                  </span>
                )}
              </button>

              {menuOpen && (
                <div style={menu}>
                  {/* 👇 New: Home in dropdown */}
                  <Link to={ROUTES.HOME} onClick={() => setMenuOpen(false)} style={menuItem}>
                    Home
                  </Link>
                  <Link to="/overview" onClick={() => setMenuOpen(false)} style={menuItem}>
                    Overview
                  </Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={menuItem}>
                    Profile
                  </Link>
                  <Link to="/settings" onClick={() => setMenuOpen(false)} style={menuItem}>
                    Settings
                  </Link>
                  <a href="/logout" style={{ ...menuItem, color: "#fca5a5" }}>
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ ...container }}>
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            border: `1px solid ${COLORS.panelBorder}`,
            boxShadow: COLORS.glow,
          }}
        >
          <SectionErrorBoundary>
            <Suspense
              fallback={
                <div
                  style={{
                    height: 380,
                    background: COLORS.panel,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <div style={{ color: COLORS.dim }}>Loading map…</div>
                </div>
              }
            >
              <EnhancedMapDark />
            </Suspense>
          </SectionErrorBoundary>
        </div>
      </div>

      {/* Content */}
      <div style={{ ...container, display: "grid", gap: "1rem" }}>
        <ActiveRideBanner />

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "1.3fr 0.7fr 1fr",
          }}
        >
          {/* Upcoming rides */}
          <div style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div style={cardTitle}>Upcoming rides</div>
              <button onClick={refreshData} style={chipBtn("#60a5fa", "#60a5fa")}>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            <SectionErrorBoundary>
              <RideList rides={upcomingRides} loading={false} />
            </SectionErrorBoundary>

            {/* Bottom CTA row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginTop: "0.9rem",
              }}
            >
              <button
                onClick={() => navigate(ROUTES.FIND_RIDE)}
                style={{
                  padding: ".8rem 1rem",
                  background: "#1f2937",
                  color: "white",
                  borderRadius: 12,
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Find a ride
              </button>
              <button
                onClick={() => navigate(ROUTES.OFFER_RIDE)}
                style={{
                  padding: ".8rem 1rem",
                  background: "#3b82f6",
                  color: "white",
                  borderRadius: 12,
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Offer a ride
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ ...card, paddingTop: "1.1rem" }}>
            <div style={{ ...cardTitle, marginBottom: 8, textAlign: "center" }}>
              Quick actions
            </div>
            <SectionErrorBoundary>
              <QuickActions />
            </SectionErrorBoundary>
          </div>

          {/* Recent activity */}
          <div style={{ ...card, paddingTop: "1.1rem" }}>
            <div style={{ ...cardTitle, marginBottom: 8, textAlign: "center" }}>
              Recent activity
            </div>
            <SectionErrorBoundary>
              <ActivityFeed items={stats?.recentActivity || []} loading={false} />
            </SectionErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

const FullScreenError = ({ message, onRetry }) => (
  <div
    style={{
      width: "100vw",
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(180deg, #0b1220 0%, #0f1629 100%)",
      color: "white",
    }}
  >
    <div
      style={{
        background: "#0f172a",
        padding: "2rem",
        borderRadius: 16,
        border: "1px solid #1f2937",
        textAlign: "center",
        maxWidth: 460,
        width: "calc(100% - 2rem)",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 8 }}>⚠</div>
      <h2 style={{ color: "#f87171", marginTop: 0 }}>Error Loading Dashboard</h2>
      <p style={{ color: "#cbd5e1" }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          marginTop: 12,
          padding: ".7rem 1.1rem",
          background: "#4f46e5",
          color: "white",
          borderRadius: 12,
          border: "none",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  </div>
);

export default Dashboard;