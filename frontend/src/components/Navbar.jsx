import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";

const Navbar = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatar = user?.avatarUrl || user?.profilePicture || null;

  return (
    <header className="appnav">
      <nav className="appnav__inner">
        {/* Logo */}
        <a href="/" className="appnav__logo">
          <h2 className="appnav__brand">PoolRide</h2>
        </a>

        {/* Actions */}
        <div className="appnav__actions">
          {!user ? (
            <>
              <a href="/login" className="pill pill--ghost">
                Login
              </a>
              <a href="/register" className="pill pill--solid">
                Sign Up
              </a>
            </>
          ) : (
            <>
              <a href="/dashboard" className="pill pill--solid">
                Dashboard
              </a>

              {/* Username dropdown */}
              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  className="user-trigger"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 8 }}
                    />
                  ) : null}
                  {user.name || "User"}
                  <span className="arrow">{open ? "▲" : "▼"}</span>
                </button>

                {open && (
                  <div className="dropdown-menu">
                    <div className="profile-section">
                      <div className="profile-pic">
                        {avatar ? (
                          <img src={avatar} alt="profile" />
                        ) : (
                          <div className="no-avatar">👤</div>
                        )}
                      </div>
                      <div className="profile-info">
                        <p className="profile-name">{user.name}</p>
                        <p className="profile-email">{user.email}</p>
                      </div>
                    </div>

                    <a href="/profile" className="dropdown-link">Profile</a>
                    <a href="/settings" className="dropdown-link">Settings</a>

                    <button onClick={onLogout} className="dropdown-logout">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;