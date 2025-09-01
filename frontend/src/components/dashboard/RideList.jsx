import React from "react";
import { useNavigate } from "react-router-dom";

const pill = (hex, solid = false) => ({
  padding: ".4rem .7rem",
  background: solid ? hex : "transparent",
  color: solid ? "#fff" : hex,
  border: `2px solid ${hex}`,
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
});

const StatusPill = ({ status }) => {
  const def =
    {
      completed: { bg: "#10b981", icon: "✅" },
      cancelled: { bg: "#ef4444", icon: "❌" },
      pending: { bg: "#f59e0b", icon: "⏳" },
      confirmed: { bg: "#3b82f6", icon: "✔" },
      active: { bg: "#10b981", icon: "🟢" },
    }[status] || { bg: "#6b7280", icon: "•" };

  return (
    <span
      style={{
        background: def.bg,
        color: "white",
        padding: ".2rem .6rem",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: ".25rem",
      }}
    >
      <span>{def.icon}</span> {status}
    </span>
  );
};

export default function RideList({ rides = [], loading }) {
  const navigate = useNavigate();
  if (loading) return <div style={{ padding: "1rem", color: "#6b7280" }}>Loading rides…</div>;

  if (!rides.length)
    return (
      <div style={{ textAlign: "center", color: "#6b7280", padding: "1.5rem" }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🚗</div>
        <div>No upcoming rides</div>
      </div>
    );

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {rides.map((ride) => {
        const isOffered = ride.type === "offered";
        const amount = isOffered ? `₹${ride.earnings || 0}` : -`₹${ride.cost || 0}`;
        const color = isOffered ? "#10b981" : "#4f46e5";

        return (
          <div
            key={ride.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: "1rem",
              background: "white",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: ".75rem", alignItems: "start" }}>
              <div>
                <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                  <span
                    style={{
                      background: isOffered ? "#4f46e5" : "#10b981",
                      color: "white",
                      padding: ".2rem .6rem",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {isOffered ? "🚗 Offered" : "🎯 Booked"}
                  </span>
                  <StatusPill status={ride.status} />
                  {ride.distance ? (
                    <span
                      style={{
                        background: "#f59e0b",
                        color: "white",
                        padding: ".2rem .6rem",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      📏 {ride.distance} km
                    </span>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
                  <strong style={{ color: "#111827" }}>📍 {ride.route?.from}</strong>
                  <div style={{ width: 32, height: 2, background: "linear-gradient(90deg,#4f46e5,#8b5cf6)" }} />
                  <strong style={{ color: "#111827" }}>🎯 {ride.route?.to}</strong>
                </div>

                <div style={{ display: "flex", gap: "1rem", color: "#6b7280", fontSize: 14, flexWrap: "wrap", marginTop: 6 }}>
                  <span>📅 {new Date(ride.date).toLocaleDateString("en-IN")}</span>
                  <span>⏰ {ride.time}</span>
                  {isOffered && ride.passengers != null && <span>👥 {ride.passengers}/{ride.maxSeats} seats</span>}
                  {!isOffered && ride.driver && <span>👤 Driver: {ride.driver}</span>}
                  {ride.eta ? <span>🕒 ETA: {ride.eta} min</span> : null}
                </div>
              </div>

              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: ".5rem", alignItems: "flex-end" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color }}>{amount}</div>
                <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button onClick={() => navigate(`/my-rides`)} style={pill(color, false)}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}