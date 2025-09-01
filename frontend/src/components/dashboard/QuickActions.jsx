import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Quick actions — dark theme friendly
 * - Vertical stack
 * - My Rides, Support, Notifications
 */
export default function QuickActions() {
  const nav = useNavigate();

  const btnStyle = {
    width: "100%",
    padding: ".85rem 1rem",
    display: "flex",
    alignItems: "center",
    gap: ".6rem",
    justifyContent: "flex-start",
    background: "#1f2937",                 // dark button
    color: "#e5e7eb",
    border: "1px solid #374151",           // subtle border
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
    outline: "none",
  };

  const iconWrap = {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    background: "#111827",                 // slightly darker chip
    border: "1px solid #374151",
    fontSize: 14,
  };

  return (
    <div style={{ display: "grid", gap: "10px" }}>
      <button style={btnStyle} onClick={() => nav("/my-rides")}>
        <span style={iconWrap}>📂</span>
        <span>My Rides</span>
      </button>

      <button style={btnStyle} onClick={() => nav("/support")}>
        <span style={iconWrap}>💬</span>
        <span>Support</span>
      </button>

      <button style={btnStyle} onClick={() => nav("/notifications")}>
        <span style={iconWrap}>🔔</span>
        <span>Notifications</span>
      </button>
    </div>
  );
}