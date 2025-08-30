import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LandingNavbar.css";

function LandingNavbar({ onShowLogin, onShowRegister }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(user?.photo || "");
  const ddRef = useRef(null);

  const displayName = (user?.username || user?.name || "User").trim();
  const email = user?.email || "";

  const handleDashboardClick = () => navigate("/dashboard");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
    window.location.reload();
  };

  // close dropdown on outside click / ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // avatar upload preview (client-side only)
  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  // initials fallback
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="lnav">
      <nav className="lnav__inner" aria-label="Primary">
        {/* Left: Logo */}
        <div className="lnav__left">
          <Link to="/" className="lnav__logo" aria-label="CarpoolX Home">
            <span className="lnav__brand">CarpoolX</span>
          </Link>
        </div>

        {/* Center: Links */}
        <div className="lnav__center">
          <Link to="/about" className="lnav__link">About</Link>
          <Link to="/team" className="lnav__link">Our Team</Link>
          <Link to="/support" className="lnav__link">Support</Link>
          <Link to="/help" className="lnav__link">Help Center</Link>
          <Link to="/safety" className="lnav__link">Safety</Link>
          <Link to="/contact" className="lnav__link">Contact</Link>
          <Link to="/faq" className="lnav__link">FAQ</Link>
        </div>

        {/* Right: Dashboard + Username pinned to extreme right */}
        <div className="lnav__right">
          {!user ? (
            <>
              <button onClick={onShowLogin} className="btn btn--ghost">Login</button>
              <button onClick={onShowRegister} className="btn btn--solid">Sign Up</button>
            </>
          ) : (
            <>
              <button onClick={handleDashboardClick} className="btn btn--ghost">
                Dashboard
              </button>

              {/* Push username to absolute right */}
              <div className="lnav__spacer" />

              {/* Username trigger + dropdown */}
              <div className="userdd" ref={ddRef}>
                <button
                  className="userdd__trigger"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  title="Account"
                >
                  <span className="userdd__name">{displayName}</span>
                  <span className={`userdd__chev ${open ? "is-open" : ""}`} aria-hidden>▾</span>
                </button>

                {open && (
                  <div className="userdd__menu" role="menu">
                    <div className="userdd__profile">
                      <label htmlFor="lnav-avatar" className="avatar">
                        {previewSrc ? (
                          <img src={previewSrc} alt="Profile" />
                        ) : (
                          <span className="avatar__initials">{initials}</span>
                        )}
                        <input
                          id="lnav-avatar"
                          type="file"
                          accept="image/*"
                          onChange={onPickPhoto}
                          style={{ display: "none" }}
                        />
                      </label>

                      <div className="userdd__info">
                        <p className="userdd__title" title={displayName}>{displayName}</p>
                        {email && (
                          <p className="userdd__sub" title={email}>
                            {email}
                          </p>
                        )}
                      </div>
                    </div>

                    <hr className="userdd__sep" />

                    <button className="userdd__item" onClick={() => navigate("/profile")}>
                      View Profile
                    </button>

                    <button className="userdd__item userdd__logout" onClick={handleLogout}>
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
}

export default LandingNavbar;