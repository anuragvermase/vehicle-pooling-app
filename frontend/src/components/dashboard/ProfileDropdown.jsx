import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const go = (path) => {
    setOpen(false);
    nav(path);
  };

  const avatar = user?.avatarUrl || user?.profilePicture || null;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "#111827",
          color: "white",
          display: "grid",
          placeItems: "center",
          border: "1px solid #374151",
          overflow: "hidden",
        }}
        aria-label="Profile menu"
      >
        {avatar ? (
          <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span role="img" aria-hidden>👤</span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 46,
            background: "#111827",
            color: "white",
            borderRadius: 12,
            border: "1px solid #374151",
            minWidth: 160,
            overflow: "hidden",
            zIndex: 30,
          }}
        >
          {[
            { label: "Profile", to: "/profile" },
            { label: "Overview", to: "/overview" },
            { label: "Settings", to: "/settings" },
          ].map((i) => (
            <button
              key={i.to}
              onClick={() => go(i.to)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: ".6rem .9rem",
                background: "transparent",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              {i.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}