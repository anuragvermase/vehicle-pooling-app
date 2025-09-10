import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LandingNavbar.css";
import API from "../services/api";

function LandingNavbar({ onShowLogin, onShowRegister, user: userProp, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(userProp || null);
  const ddRef = useRef(null);

  useEffect(() => {
    setMe(userProp || null);
  }, [userProp]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        // Prefer auth.me which now includes role/isBanned
        const res = await API.auth.getCurrentUser();
        if (res?.user) setMe(res.user);
      } catch {}
    })();
  }, [open]);

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

  const displayName = (me?.username || me?.name || "User").trim();
  const email = me?.email || "";
  const avatar = me?.avatarUrl || me?.profilePicture || "";
  const role = me?.role;

  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleDashboardClick = () => navigate("/dashboard");
  const handleLogoutClick = () => {
    if (onLogout) onLogout();
  };

  return (
    <header className="lnav">
      <nav className="lnav__inner" aria-label="Primary">
        <div className="lnav__left">
          <Link to="/" className="lnav__logo" aria-label="CarpoolX Home">
            <span className="lnav__brand">CarpoolX</span>
          </Link>
        </div>

        <div className="lnav__center">
          <Link to="/about" className="lnav__link">About</Link>
          <Link to="/team" className="lnav__link">Our Team</Link>
          <Link to="/support" className="lnav__link">Support</Link>
          <Link to="/help" className="lnav__link">Help Center</Link>
          <Link to="/safety" className="lnav__link">Safety</Link>
          <Link to="/contact" className="lnav__link">Contact</Link>
          <Link to="/faq" className="lnav__link">FAQ</Link>
        </div>

        <div className="lnav__right">
          {!me ? (
            <>
              <button onClick={onShowLogin} className="btn btn--ghost">Login</button>
              <button onClick={onShowRegister} className="btn btn--solid">Sign Up</button>
            </>
          ) : (
            <>
              <button onClick={handleDashboardClick} className="btn btn--ghost">
                Dashboard
              </button>

              <div className="lnav__spacer" />

              <div className="userdd" ref={ddRef}>
                <button
                  className="userdd__trigger"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  title="Account"
                >
                  <span className="userdd__avatar">
                    {avatar ? (
                      <img src={avatar} alt="Profile" />
                    ) : (
                      <span className="avatar__initials">{initials}</span>
                    )}
                  </span>
                  <span className="userdd__name">{displayName}</span>
                  <span className={`userdd__chev ${open ? "is-open" : ""}`} aria-hidden>
                    ▾
                  </span>
                </button>

                {open && (
                  <div className="userdd__menu" role="menu">
                    <div className="userdd__profile">
                      <span className="avatar">
                        {avatar ? (
                          <img src={avatar} alt="Profile" />
                        ) : (
                          <span className="avatar__initials">{initials}</span>
                        )}
                      </span>
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

                    {/* ✅ Admin entry shows only for admin/superadmin */}
                    {(role === 'admin' || role === 'superadmin') && (
                      <button className="userdd__item" onClick={() => navigate("/admin")}>
                        Admin Dashboard
                      </button>
                    )}

                    <button className="userdd__item" onClick={() => navigate("/profile")}>
                      View Profile
                    </button>

                    <button className="userdd__item userdd__logout" onClick={handleLogoutClick}>
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
