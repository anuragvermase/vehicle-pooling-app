import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function StatsChart({ monthly = [], loading }) {
  const data = monthly.map((m) => ({
    name: m.month || m.label,
    rides: (m.ridesOffered || 0) + (m.ridesTaken || 0),
    earnings: m.earnings || 0,
  }));

  return (
    <div style={{ background: "white", borderRadius: 16, padding: "1rem", border: "1px solid #e5e7eb" }}>
      <div style={{ fontWeight: 800, color: "#111827", marginBottom: 6 }}>Statistics</div>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="rides" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="earnings" stroke="#4f46e5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}