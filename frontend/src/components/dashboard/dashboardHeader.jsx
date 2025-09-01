import React from "react";
import ProfileDropdown from "./ProfileDropdown";

export default function DashboardHeader({ connected = false }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        borderRadius: 16,
        background: "linear-gradient(135deg, #0f172a, #111827)",
        color: "white",
      }}
    >
      <div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Dashboard</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>
          Realtime:{" "}
          <span style={{ color: connected ? "#34d399" : "#f59e0b" }}>
            {connected ? "connected" : "reconnecting…"}
          </span>
        </div>
      </div>
      <ProfileDropdown />
    </div>
  );
}