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
                  {user.name || "User"}
                  <span className="arrow">{open ? "▲" : "▼"}</span>
                </button>

                {open && (
                  <div className="dropdown-menu">
                    <div className="profile-section">
                      <label htmlFor="profile-upload" className="profile-pic">
                        <img
                          src={
                            user.photo ||
                            "https://via.placeholder.com/60?text=👤"
                          }
                          alt="profile"
                        />
                        <input
                          type="file"
                          id="profile-upload"
                          accept="image/*"
                          style={{ display: "none" }}
                        />
                      </label>
                      <div className="profile-info">
                        <p className="profile-name">{user.name}</p>
                        <p className="profile-email">{user.email}</p>
                      </div>
                    </div>

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