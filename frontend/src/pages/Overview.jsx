import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { Link } from "react-router-dom"; // ✅ SPA navigation for dropdown
import "./Overview.css";
import useWebSockets from "../hooks/useWebSockets";
import API from "../services/api";

/* =========================================================
   Profile dropdown — lazy & crash-safe (keeps redirection)
   (NOTE: Not used now; header dropdown implemented inline)
   ========================================================= */
const ProfileDropdownLazy = React.lazy(() =>
  import("../components/dashboard/ProfileDropdown.jsx").catch(() => ({
    default: () => (
      <a href="/profile" className="ov-fallback-avatar" title="Profile">
        👤
      </a>
    ),
  }))
);

/* =========================================================
   Chart data / building series (sanitized numbers)
   ========================================================= */
const CHART_DATA = [
  { m: "Mar", v: 20 },
  { m: "Apr", v: 40 },
  { m: "May", v: 55 },
  { m: "Jun", v: 72 },
  { m: "Jul", v: 60 },
  { m: "Aug", v: 85 },
  { m: "Sep", v: 95 },
].map((d) => ({ m: d.m, v: Number(d.v) || 0 }));

/* Build 12-month series from ride history if backend
   doesn’t provide one. */
function buildMonthlyFromHistory(history = []) {
  const months = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      m: d.toLocaleString(undefined, { month: "short" }),
      v: 0,
    };
  });
  const map = new Map(months.map((m) => [m.key, m]));
  (Array.isArray(history) ? history : []).forEach((it) => {
    const t = new Date(
      it.createdAt || it.updatedAt || it.departureTime || it.date || Date.now()
    );
    const key = `${t.getFullYear()}-${t.getMonth()}`;
    if (map.has(key)) map.get(key).v += 1;
  });
  return [...map.values()];
}

/* =========================================================
   Fallback SVG chart (neon style) — used if Recharts unavailable
   ========================================================= */
function StaticLineChart({ data = CHART_DATA }) {
  const src = Array.isArray(data) && data.length ? data : CHART_DATA;
  const W = 820,
    H = 240,
    PADX = 52,
    PADY = 24;
  const xs = src.map((_, i) => i);
  const ys = src.map((p) => (typeof p.v === "number" ? p.v : 0));
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, Math.max(100, ...ys));
  const x = (i) =>
    PADX + (i * (W - PADX * 2)) / Math.max(1, xs.length - 1);
  const y = (v) =>
    H -
    PADY -
    ((v - minY) * (H - PADY * 2)) / Math.max(1, maxY - minY);

  const line = src
    .map((p, i) => `${i ? "L" : "M"} ${x(i)} ${y(p.v || 0)}`)
    .join(" ");
  const area = `${line} L ${x(src.length - 1)} ${H - PADY} L ${x(
    0
  )} ${H - PADY} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="ov-chart-svg">
      <defs>
        <linearGradient id="ov-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} rx="12" fill="#0a0f1a" />
      {[...Array(3)].map((_, i) => (
        <line
          key={i}
          x1={PADX}
          x2={W - PADX}
          y1={PADY + ((H - PADY * 2) / 2) * i}
          y2={PADY + ((H - PADY * 2) / 2) * i}
          stroke="rgba(148,163,184,0.12)"
        />
      ))}
      <line
        x1={PADX}
        x2={W - PADX}
        y1={H - PADY}
        y2={H - PADY}
        stroke="#2b394a"
      />
      <line x1={PADX} x2={PADX} y1={PADY} y2={H - PADY} stroke="#2b394a" />
      <path d={area} fill="url(#ov-fill)" />
      <path d={line} fill="none" stroke="#38bdf8" strokeWidth="3" />
      {src.map((p, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(p.v || 0)}
          r="3.5"
          fill="#38bdf8"
        />
      ))}
      {src.map((p, i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize="12"
          fill="#9fb2c6"
        >
          {p.m}
        </text>
      ))}
    </svg>
  );
}

/* =========================================================
   Recharts wrapper (auto-fallback to SVG while loading / missing)
   ========================================================= */
function RechartsLine({ data }) {
  const [R, setR] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let ok = true;
    import("recharts")
      .then((m) => ok && setR(m))
      .catch(() => ok && setFailed(true));
    return () => {
      ok = false;
    };
  }, []);

  if (failed) return <StaticLineChart data={data} />;
  if (!R) return <StaticLineChart data={data} />;

  const {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Area,
  } = R;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 18, right: 16, bottom: 24, left: 44 }}
      >
        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
        <XAxis dataKey="m" stroke="#8aa0b6" />
        <YAxis stroke="#8aa0b6" />
        <Tooltip
          contentStyle={{
            background: "#0a0f1a",
            border: "1px solid rgba(148,163,184,0.2)",
            color: "#e5e7eb",
            borderRadius: 6,
          }}
        />
        <Area
          type="linear"
          dataKey="v"
          stroke="none"
          fill="url(#ov-fill-def)"
          connectNulls
        />
        <Line
          type="linear"
          dataKey="v"
          stroke="#38bdf8"
          strokeWidth={3}
          dot={{ r: 3.5 }}
          connectNulls
        />
        <defs>
          <linearGradient id="ov-fill-def" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   Crisp inline SVG icon set (same feel as mock)
   ========================================================= */
const Icons = {
  car: (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7ad8ff" />
          <stop offset="1" stopColor="#28c9c1" />
        </linearGradient>
      </defs>
      <path
        fill="url(#teal)"
        d="M4 14h16l-2.2-6.2c-.3-.8-1-1.3-1.8-1.3H8c-.8 0-1.5.5-1.8 1.3L4 14Z"
      />
      <circle cx="8" cy="17" r="2" fill="#8bdcff" />
      <circle cx="16" cy="17" r="2" fill="#8bdcff" />
      <rect
        x="7"
        y="7"
        width="10"
        height="1.6"
        rx="0.8"
        fill="#7ad8ff"
        opacity=".9"
      />
    </svg>
  ),
  wheel: (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="rgba(148,163,184,.25)" />
      <path
        d="M5 12h14"
        stroke="rgba(148,163,184,.55)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 4v4m0 8v4"
        stroke="rgba(148,163,184,.55)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="rgba(148,163,184,.65)" />
    </svg>
  ),
  coinGold: (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="#f6c35b" />
      <circle cx="12" cy="12" r="7" fill="#ffd87a" opacity=".9" />
      <path
        d="M10 9h4M9 12h6M10 15h4"
        stroke="#a47100"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  balanceCoin: (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="#ffd87a" />
      <path
        d="M10 9h4M9 12h6M10 15h4"
        stroke="#a47100"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  earnings: (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="#f6c35b" />
      <path
        d="M10 8h6M10 11h5M15 11c-1.2 2-3.5 3.5-5.5 4"
        stroke="#7a5200"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  ),
  note: (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="7"
        width="16"
        height="10"
        rx="2.5"
        fill="#2ecc71"
        opacity=".9"
      />
      <rect
        x="6.5"
        y="9.5"
        width="11"
        height="5"
        rx="1.5"
        fill="#25b863"
      />
      <circle cx="12" cy="12" r="2.1" fill="#e8ffe8" />
    </svg>
  ),
  sprout: (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 18V9c0-2.5 2-4.5 4.5-4.5H18"
        stroke="#38d7ca"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 18V9C12 6.5 10 4.5 7.5 4.5H6"
        stroke="#38d7ca"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="18" r="1.6" fill="#38d7ca" />
    </svg>
  ),
  distanceBadge: (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="b1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fb2ff" />
          <stop offset="1" stopColor="#2ec9b8" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="16" height="16" rx="3.5" fill="url(#b1)" />
      <path d="M9 15l6-6" stroke="#0b2a3d" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 9h3v3"
        stroke="#0b2a3d"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
};

/* =========================================================
   Utils
   ========================================================= */
const N = (v, d = 0) => (typeof v === "number" && !isNaN(v) ? v : d);
const INR0 = (n) =>
  `₹${N(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const INR2 = (n) =>
  `₹${N(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* =========================================================
   Fit rows to viewport (no scroll) — big bottom row
   (aware of design scale so 100% == your 75% look)
   ========================================================= */
function usePackHeights() {
  useEffect(() => {
    function setVars() {
      const root = document.documentElement;
      const s =
        parseFloat(
          getComputedStyle(root).getPropertyValue("--ov-scale")
        ) || 1;

      // Use unscaled viewport for correct packing
      const vh = window.innerHeight / s;

      const headerH = 86;
      const gaps = 20 * 3;
      const framePad = 34;

      const avail = vh - headerH - gaps - framePad;

      const row1 = Math.max(120, Math.round(avail * 0.22));
      const row2 = Math.max(120, Math.round(avail * 0.22));
      const bottom = Math.max(300, avail - row1 - row2);

      root.style.setProperty("--h-row1", `${row1}px`);
      root.style.setProperty("--h-row2", `${row2}px`);
      root.style.setProperty("--h-bottom", `${bottom}px`);
    }
    setVars();
    window.addEventListener("resize", setVars);
    return () => window.removeEventListener("resize", setVars);
  }, []);
}

/* =========================================================
   Component
   ========================================================= */
export default function Overview() {
  // page theme & no-scroll just for this page
  useEffect(() => {
    document.body.classList.add("overview-active");
    return () => document.body.classList.remove("overview-active");
  }, []);

  usePackHeights();

  const { socket } = useWebSockets() || {};

  // 👇 NEW: header dropdown state (Profile-like)
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await API.users?.me?.().catch(() => null);
      setMe(res?.user || null);
    })();
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const initials = useMemo(() => {
    const n = me?.name || "";
    return n.split(" ").map(s => s[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
  }, [me?.name]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState({
    ridesTaken: 0,
    ridesOffered: 0,
    rating: 0,
    balance: 0,
    earnings: 0,
    moneySaved: 0,
    co2SavedKg: 0,
    distanceKm: 0,
  });
  const [series, setSeries] = useState(CHART_DATA);
  const [recent, setRecent] = useState([]);

  /* ---- Initial data load (keeps your backend logic) ---- */
  useEffect(() => {
    (async () => {
      setErr("");
      try {
        // 1) Stats
        const s = await API.dashboard.getStats().catch(() => null);
        const S = s?.data || s || {};
        setStats({
          ridesTaken: N(S.ridesTaken ?? S.totalRidesTaken),
          ridesOffered: N(S.ridesOffered ?? S.totalRidesOffered),
          rating: N(S.rating?.average ?? S.rating),
          balance: N(S.balance ?? 0),
          earnings: N(S.totalEarnings ?? S.earnings),
          moneySaved: N(S.moneySaved ?? 0),
          co2SavedKg: N(S.co2SavedKg ?? S.co2Saved ?? 0),
          distanceKm: N(S.distanceKm ?? S.totalDistance ?? 0),
        });

        // monthly series
        let monthly = Array.isArray(S.ridesByMonth) ? S.ridesByMonth : [];

        // 2) Ride history for series + activity
        const h = await API.dashboard
          .getRideHistory?.(1, 120, "all")
          .catch(() => null);
        const H = h?.data?.items || h?.items || h?.data || [];

        if (!monthly.length) monthly = buildMonthlyFromHistory(H);
        const sanitized = monthly.map((d) => ({
          m: d.m || d.month,
          v: Number(d.v ?? d.rides) || 0,
        }));
        setSeries(sanitized.length ? sanitized : CHART_DATA);

        // recent activity (top 6)
        const recentRaw = (Array.isArray(H) ? H : [])
          .sort((a, b) => {
            const ta = new Date(
              a.createdAt || a.departureTime || a.date || 0
            ).getTime();
            const tb = new Date(
              b.createdAt || b.departureTime || b.date || 0
            ).getTime();
            return tb - ta;
          })
          .slice(0, 6)
          .map((it, idx) => ({
            id: it._id || it.id || idx,
            type: it.pricePerSeat != null ? "ride" : "booking",
            from: it.startLocation?.name || it.from || "",
            to: it.endLocation?.name || it.to || "",
            who: it.user?.name || "You",
            avatar: it.user?.avatarUrl || "",
            when: new Date(
              it.createdAt || it.departureTime || it.date || Date.now()
            ),
            amount: it.totalAmount || it.totalCost || it.pricePerSeat || 0,
          }));
        setRecent(recentRaw);
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- Live updates via socket (kept lightweight & safe) ---- */
  useEffect(() => {
    if (!socket) return;
    const onDash = (p) => {
      if (!p) return;
      setStats((s) => ({
        ...s,
        ridesTaken: N(p.ridesTaken ?? s.ridesTaken),
        ridesOffered: N(p.ridesOffered ?? s.ridesOffered),
        rating: N(p.rating ?? s.rating),
        balance: N(p.balance ?? s.balance),
        earnings: N(p.earnings ?? s.earnings),
        moneySaved: N(p.moneySaved ?? s.moneySaved),
        co2SavedKg: N(p.co2SavedKg ?? p.co2Saved ?? s.co2SavedKg),
        distanceKm: N(p.distanceKm ?? s.distanceKm),
      }));
    };
    socket.on?.("dashboard:stats", onDash);
    return () => socket.off?.("dashboard:stats", onDash);
  }, [socket]);

  /* ---- Rows ---- */
  const row1 = useMemo(
    () => [
      {
        label: "Rides taken",
        value: loading ? "…" : N(stats.ridesTaken),
        icon: Icons.car,
      },
      {
        label: "Rides offered",
        value: loading ? "…" : N(stats.ridesOffered),
        icon: Icons.wheel,
      },
      {
        label: "Rating",
        value: loading ? "…" : N(stats.rating, 0).toFixed(2),
        icon: Icons.coinGold,
      },
      {
        label: "Account balance",
        value: loading ? "…" : INR2(stats.balance),
        icon: Icons.balanceCoin,
      },
    ],
    [loading, stats]
  );

  const row2 = useMemo(
    () => [
      {
        label: "Total earnings",
        value: loading ? "…" : INR0(stats.earnings),
        icon: Icons.earnings,
      },
      {
        label: "Money saved",
        value: loading ? "…" : INR0(stats.moneySaved),
        icon: Icons.note,
      },
      {
        label: "CO₂ saved",
        value: loading ? "…" : `${N(stats.co2SavedKg)} kg`,
        icon: Icons.sprout,
      },
      {
        label: "Distance",
        value: loading ? "…" : `${N(stats.distanceKm)} km`,
        icon: Icons.distanceBadge,
      },
    ],
    [loading, stats]
  );

  return (
    <div className="ov-page">
      {/* SCALE WRAPPER: makes 100% zoom look like your 75% */}
      <div className="ov-zoomwrap">
        <div className="ov-frame">
          <div className="ov-board">
            {/* ===================== PAGE HEADER (Profile-like dropdown) ===================== */}
            <div className="ov-header" ref={menuRef}>
              <div className="ov-title">Overview</div>
              <div className="ov-head-right">
                <button
                  className="ov-avatar-btn"
                  title="Menu"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {me?.avatarUrl ? (
                    <img src={me.avatarUrl} alt="" />
                  ) : (
                    <span>{initials || "U"}</span>
                  )}
                </button>
                {menuOpen && (
                  <div className="ov-menu">
                    <Link className="ov-menu-item" to="/dashboard" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <Link className="ov-menu-item" to="/profile" onClick={() => setMenuOpen(false)}>
                      Profile
                    </Link>
                    <Link className="ov-menu-item" to="/settings" onClick={() => setMenuOpen(false)}>
                      Settings
                    </Link>
                    <a className="ov-menu-item danger" href="/logout">
                      Logout
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ===================== ROW 1 ===================== */}
            <div className="ov-row ov-4" style={{ height: "var(--h-row1)" }}>
              {row1.map((k, i) => (
                <div className="ov-card dim" key={i}>
                  <div className="ov-head">
                    <span className="ov-label">{k.label}</span>
                    <span className="ov-icon-slot">{k.icon}</span>
                  </div>
                  <div className="ov-hero">{k.value}</div>
                </div>
              ))}
            </div>

            {/* ===================== ROW 2 ===================== */}
            <div className="ov-row ov-4" style={{ height: "var(--h-row2)" }}>
              {row2.map((k, i) => (
                <div className="ov-card dim" key={i}>
                  <div className="ov-head">
                    <span className="ov-label">{k.label}</span>
                    <span className="ov-icon-slot">{k.icon}</span>
                  </div>
                  <div className="ov-kpi">{k.value}</div>
                </div>
              ))}
            </div>

            {/* ===================== BOTTOM ROW (equal widths, bigger) ===================== */}
            <div className="ov-row ov-2" style={{ height: "var(--h-bottom)" }}>
              {/* ---- Statistics ---- */}
              <div className="ov-card dim ov-bottom">
                <div className="ov-bottom-head">
                  <div className="ov-section">Statistics</div>
                  <div className="ov-subtle-inline">
                    Rides over&nbsp;&nbsp;months
                  </div>
                </div>
                <div className="ov-chart">
                  {/* If recharts package is installed, this renders; else Static fallback above */}
                  <RechartsLine data={series && series.length ? series : CHART_DATA} />
                  {!window._RECHARTS_LOADED_ && (
                    <StaticLineChart
                      data={series && series.length ? series : CHART_DATA}
                    />
                  )}
                </div>
              </div>

              {/* ---- Recent activity ---- */}
              <div className="ov-card dim ov-bottom">
                <div className="ov-bottom-head">
                  <div className="ov-section">Recent activity</div>
                  <div className="ov-subtle-inline">&nbsp;</div>
                </div>
                <div className="ov-activity">
                  {recent.length === 0 ? (
                    <div className="ov-empty">No recent bookings or rides yet.</div>
                  ) : (
                    recent.slice(0, 1).map((a) => (
                      <div className="ov-activity-card" key={a.id}>
                        <img
                          className="ov-avatar"
                          src={
                            a.avatar ||
                            "https://api.dicebear.com/7.x/thumbs/svg?seed=user"
                          }
                          alt=""
                          loading="lazy"
                        />
                        <div className="ov-activity-text">
                          <div className="ov-activity-title">
                            {a.who} {a.type === "ride" ? "offered a ride" : "booked a ride"}
                          </div>
                          <div className="ov-activity-sub">
                            {a.from || "—"} <span className="ov-arrow">→</span>{" "}
                            {a.to || "—"}
                          </div>
                        </div>
                        <div className="ov-activity-meta">
                          <div className="ov-date">
                            {(a.when || new Date()).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {err && <div className="ov-err">Error: {String(err)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}