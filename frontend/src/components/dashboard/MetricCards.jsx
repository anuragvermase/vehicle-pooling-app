import React from "react";

const Card = ({ title, value, icon, accent = "#4f46e5" }) => (
  <div
    style={{
      background: "white",
      borderRadius: 16,
      padding: "1rem",
      border: '1px solid ${accent}22',
      boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
      minHeight: 96,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ color: "#6b7280", fontWeight: 600 }}>{title}</span>
      </div>
      <div
        style={{
          width: 48,
          height: 20,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${accent}33, ${accent}77)`,
        }}
      />
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color: accent, marginTop: 8 }}>{value}</div>
  </div>
);

export default function MetricCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: "#f3f4f6", height: 96, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  const s = stats || {};
  const moneySaved = s.fuelSaved && s.totalSpent != null ? s.fuelSaved - s.totalSpent : 0;

  const items = [
    { title: "Rides Offered", value: s.ridesOffered || 0, icon: "🚗", accent: "#4f46e5" },
    { title: "Rides Taken", value: s.ridesTaken || 0, icon: "🎯", accent: "#10b981" },
    { title: "Total Earnings", value: `₹${s.totalEarnings || 0}`, icon: "💰", accent: "#f59e0b" },
    { title: "Money Saved", value: `₹${moneySaved}`, icon: "💸", accent: "#8b5cf6" },
    { title: "CO₂ Saved", value: `${s.co2Saved || 0} kg`, icon: "🌱", accent: "#059669" },
    { title: "Distance", value: `${s.totalDistance || 0} km`, icon: "📏", accent: "#dc2626" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
      }}
    >
      {items.map((c, i) => (
        <Card key={i} {...c} />
      ))}
    </div>
  );
}