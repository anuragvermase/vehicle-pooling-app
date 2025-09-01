import React from "react";

/**
 * Recent activity list — dark theme friendly
 * - No own card/header; parent card provides those
 * - Transparent container; items have subtle borders
 */
export default function ActivityFeed({ items = [], loading }) {
  if (loading) {
    return (
      <div style={{ padding: "0.75rem", color: "#9ca3af", fontSize: 14 }}>
        Loading activity…
      </div>
    );
  }

  if (!items.length) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#9ca3af",
          padding: "1.5rem",
          fontSize: 14,
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 8 }}>📊</div>
        <div>No recent activity</div>
      </div>
    );
  }

  const row = {
    display: "flex",
    gap: ".75rem",
    alignItems: "center",
    padding: ".75rem .85rem",
    background: "transparent",
    borderRadius: 12,
    border: "1px solid #1f2937", // subtle dark border
  };

  const avatar = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#111827",
    border: "1px solid #374151",
    display: "grid",
    placeItems: "center",
    color: "#e5e7eb",
    fontSize: 14,
    flexShrink: 0,
  };

  const title = { color: "#e5e7eb", fontWeight: 600, lineHeight: 1.15 };
  const sub   = { color: "#9ca3af", fontSize: 12, marginTop: 2 };

  return (
    <div style={{ display: "grid", gap: ".75rem" }}>
      {items.map((a) => (
        <div key={a.id} style={row}>
          {/* avatar or bullet */}
          {a.avatarUrl ? (
            <img
              src={a.avatarUrl}
              alt=""
              style={{ ...avatar, objectFit: "cover", padding: 0 }}
            />
          ) : (
            <div style={avatar}>{a.icon || "•"}</div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={title}>{a.message || a.title || "Activity"}</div>
            <div style={sub}>
              {a.time || a.subtitle || ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}