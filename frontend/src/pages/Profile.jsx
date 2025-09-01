// frontend/src/pages/Profile.jsx
import React, { useEffect, useMemo, useState, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import useWebSockets from "../hooks/useWebSockets";
import API from "../services/api";
import "./Profile.css";

const StatsChart = React.lazy(() =>
  import("../components/dashboard/StatsChart.jsx").catch(() => ({
    default: () => null,
  }))
);

function normalizeActivity(list = []) {
  return list
    .map((it) => {
      const when =
        it.createdAt ||
        it.updatedAt ||
        it.time ||
        it.date ||
        it.departureTime;
      const start = it.startLocation?.name || it.from || it.pickup || "";
      const end = it.endLocation?.name || it.to || it.drop || "";
      const type = it.type || (it.pricePerSeat != null ? "ride" : "booking");
      const id = it._id || it.id || when || Math.random().toString(36);
      return {
        id,
        type,
        when: when ? new Date(when) : null,
        start,
        end,
        status: it.status || "—",
      };
    })
    .sort((a, b) => (b.when?.getTime?.() || 0) - (a.when?.getTime?.() || 0))
    .slice(0, 12);
}

async function copyText(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {}
    document.body.removeChild(ta);
  }
}

export default function ProfilePage() {
  const { socket } = useWebSockets() || {};

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState({ email: false, phone: false });

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("profile"); // "profile" | "password"

  // profile edit
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // avatar upload
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  // password
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ kind: "", text: "" });

  const [warn, setWarn] = useState("");
  const [tab, setTab] = useState("recent");
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    document.body.classList.add("profile-active");
    return () => document.body.classList.remove("profile-active");
  }, []);

  // ===== Header right menu (avatar dropdown)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // central fetcher (always real-time)
  const fetchMe = async () => {
    try {
      // add a cache-buster query just in case
      const res = await API.users.me({ _t: Date.now() });
      const user = res?.user || null;
      setProfile(user);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // load profile (server only — no static fallback)
  useEffect(() => {
    fetchMe();
  }, []);

  // load recent activity
  useEffect(() => {
    (async () => {
      const lists = [];
      const a = await API.raw
        .get(`/bookings?status=all&page=1&limit=12&_t=${Date.now()}`)
        .catch(() => null);
      const b = await API.raw
        .get(`/rides/user?status=all&_t=${Date.now()}`)
        .catch(() => null);
      if (Array.isArray(a?.data)) lists.push(...a.data);
      if (Array.isArray(b?.data)) lists.push(...b.data);
      setActivity(normalizeActivity(lists));
    })();
  }, []);

  // socket live updates (merge & also refetch when profile core changes)
  useEffect(() => {
    if (!socket) return;
    const onProfile = () => fetchMe();
    const onStats = (stats) =>
      setProfile((p) => ({
        ...(p || {}),
        stats: { ...(p?.stats || {}), ...(stats || {}) },
      }));
    const onBooking = (b) =>
      setActivity((a) =>
        normalizeActivity([...(a || []), { ...(b || {}), type: "booking" }])
      );
    const onRide = (r) =>
      setActivity((a) =>
        normalizeActivity([...(a || []), { ...(r || {}), type: "ride" }])
      );
    socket.on?.("profile:update", onProfile);
    socket.on?.("rides:stats", onStats);
    socket.on?.("booking:created", onBooking);
    socket.on?.("ride:created", onRide);
    return () => {
      socket.off?.("profile:update", onProfile);
      socket.off?.("rides:stats", onStats);
      socket.off?.("booking:created", onBooking);
      socket.off?.("ride:created", onRide);
    };
  }, [socket]);

  // sync name + preview
  useEffect(() => {
    if (profile) setName(profile.name || "");
  }, [profile?.name]);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const initials = useMemo(() => {
    const n = profile?.name || "";
    return n
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [profile?.name]);

  const joinedPretty = useMemo(() => {
    const d = profile?.createdAt ? new Date(profile.createdAt) : null;
    try {
      return d
        ? d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
          })
        : "—";
    } catch {
      return "—";
    }
  }, [profile?.createdAt]);

  function flipCopied(key) {
    setCopied((c) => ({ ...c, [key]: true }));
    setTimeout(() => setCopied((c) => ({ ...c, [key]: false })), 1100);
  }
  async function handleCopy(key, val) {
    await copyText(val);
    flipCopied(key);
  }

  async function uploadAvatar() {
    if (!file) return null;
    setUploading(true);
    try {
      const resp = await API.users.uploadAvatar(file);
      return resp?.avatarUrl || resp?.url || null;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function onSaveProfile() {
    if (!profile) return;
    setSaving(true);
    setWarn("");
    let avatarUrl = null;
    if (file) avatarUrl = await uploadAvatar();
    const payload = avatarUrl ? { name, avatarUrl } : { name };
    try {
      await API.users.updateMe(payload);
      // Always re-fetch authoritative server state
      await fetchMe();
      setOpen(false);
      setFile(null);
      setPreview("");
    } catch {
      setWarn("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword() {
    setPwdMsg({ kind: "", text: "" });
    if (!pwd.current || !pwd.next || !pwd.confirm)
      return setPwdMsg({
        kind: "error",
        text: "Please fill all password fields.",
      });
    if (pwd.next.length < 8)
      return setPwdMsg({
        kind: "error",
        text: "New password must be at least 8 characters.",
      });
    if (pwd.next !== pwd.confirm)
      return setPwdMsg({ kind: "error", text: "Passwords do not match." });

    setPwdSaving(true);
    try {
      const resp = await API.users.updatePassword(pwd.current, pwd.next);
      if (resp?.success) {
        setPwdMsg({ kind: "success", text: "Password updated." });
        setPwd({ current: "", next: "", confirm: "" });
      } else {
        setPwdMsg({
          kind: "error",
          text:
            resp?.message ||
            "Password update failed. Check your current password.",
        });
      }
    } catch (e) {
      setPwdMsg({
        kind: "error",
        text: e.message || "Server error while updating password.",
      });
    } finally {
      setPwdSaving(false);
    }
  }

  const stats = profile?.stats || {};
  const completion =
    typeof stats.completionRate === "number"
      ? Math.round(stats.completionRate * 100)
      : null;

  return (
    <div className="pro-page">
      <div className="pro-container">
        {/* ===== HEADER BAR ===== */}
        <div className="pro-header" ref={menuRef}>
          <div className="pro-title">Profile</div>

          <div className="pro-head-right">
            <button
              className="pro-avatar-btn"
              title="Menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" />
              ) : (
                <span>{initials || "U"}</span>
              )}
            </button>

            {menuOpen && (
              <div className="pro-menu">
                <Link
                  className="pro-menu-item"
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  className="pro-menu-item"
                  to="/overview"
                  onClick={() => setMenuOpen(false)}
                >
                  Overview
                </Link>
                <Link
                  className="pro-menu-item"
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <a className="pro-menu-item danger" href="/logout">
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ===== PROFILE HEADER CARD ===== */}
        <div className="pro-profile-card">
          <div className="pro-avatar-wrap">
            {profile?.avatarUrl ? (
              <img
                className="pro-avatar"
                src={profile.avatarUrl}
                alt={profile?.name || "User"}
              />
            ) : (
              <div className="pro-avatar fallback">{initials || "U"}</div>
            )}
            {profile?.verified && <span className="pro-verified">✔</span>}
          </div>

          <div className="pro-name">
            {loading ? "Loading…" : profile?.name || "—"}
          </div>

          <div className="pro-email-row">
            <span className="pro-email">
              {loading ? "Loading…" : profile?.email || "—"}
            </span>
            <button
              className={`pro-chip ${copied.email ? "ok" : ""}`}
              onClick={() => handleCopy("email", profile?.email)}
              disabled={!profile?.email}
            >
              {copied.email ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="pro-stats">
            <div className="pro-stat">
              <div className="pro-stat-value">
                {stats?.totalRides ?? "—"}
              </div>
              <div className="pro-stat-label">Total Rides</div>
            </div>
            <div className="pro-stat">
              <div className="pro-stat-value">
                {stats?.rating ?? "—"}
              </div>
              <div className="pro-stat-label">Rating</div>
            </div>
            <div className="pro-stat">
              <div className="pro-stat-value">
                {completion ?? "—"}
                {completion !== null ? "%" : ""}
              </div>
              <div className="pro-stat-label">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* ===== GRID ===== */}
        <div className="pro-grid">
          {/* Contact */}
          <div className="pro-card">
            <div className="pro-card-title">Contact</div>
            <div className="pro-row">
              <div className="pro-row-left">Email</div>
              <div className="pro-row-right">
                <span>{profile?.email || "—"}</span>
                <button
                  className={`pro-copy ${copied.email ? "ok" : ""}`}
                  onClick={() => handleCopy("email", profile?.email)}
                  disabled={!profile?.email}
                >
                  {copied.email ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div className="pro-row">
              <div className="pro-row-left">Phone</div>
              <div className="pro-row-right">
                <span>{profile?.phone || "—"}</span>
                <button
                  className={`pro-copy ${copied.phone ? "ok" : ""}`}
                  onClick={() => handleCopy("phone", profile?.phone)}
                  disabled={!profile?.phone}
                >
                  {copied.phone ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Membership */}
          <div className="pro-card">
            <div className="pro-card-title">Membership</div>
            <div className="pro-row">
              <div className="pro-row-left">Joined</div>
              <div className="pro-row-right">{joinedPretty}</div>
            </div>
            <div className="pro-row">
              <div className="pro-row-left">Subscription</div>
              <div className="pro-row-right">
                {profile?.subscriptionTier || profile?.subscription?.plan || "Free"}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="pro-card">
            <div className="pro-card-title">Security</div>
            <div className="pro-row">
              <div className="pro-row-left">Verified</div>
              <div className="pro-row-right">
                <span className={`pro-pill ${profile?.verified ? "ok" : ""}`}>
                  {profile?.verified ? "Yes" : "No"}
                </span>
              </div>
            </div>
            <div className="pro-row">
              <div className="pro-row-left">2FA</div>
              <div className="pro-row-right">
                <span
                  className={`pro-pill ${
                    profile?.security?.twoFA ? "ok" : ""
                  }`}
                >
                  {profile?.security?.twoFA ? "Enabled" : "Available"}
                </span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="pro-card pro-col-span">
            <div
              className="pro-card-title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Activity</span>
              <div className="pro-tabs">
                <button
                  className={`pro-tab ${tab === "recent" ? "active" : ""}`}
                  onClick={() => setTab("recent")}
                >
                  Recent
                </button>
                <button
                  className={`pro-tab ${tab === "chart" ? "active" : ""}`}
                  onClick={() => setTab("chart")}
                >
                  Chart
                </button>
              </div>
            </div>
            {tab === "recent" ? (
              <div className="pro-activity">
                {activity.length === 0 ? (
                  <div className="pro-empty">
                    No recent bookings or rides yet.
                  </div>
                ) : (
                  activity.map((a) => (
                    <div key={a.id} className="pro-activity-item">
                      <div className={`pro-badge ${a.type}`}>
                        {a.type === "ride" ? "Ride" : "Booking"}
                      </div>
                      <div className="pro-activity-route">
                        <span className="pro-from">{a.start || "—"}</span>
                        <span className="pro-arrow">→</span>
                        <span className="pro-to">{a.end || "—"}</span>
                      </div>
                      <div className="pro-activity-meta">
                        <span className="pro-date">
                          {a.when ? a.when.toLocaleString() : "—"}
                        </span>
                        <span className="pro-status">{a.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="pro-chart-wrap">
                <Suspense fallback={<div className="pro-skeleton" />}>
                  <StatsChart data={profile?.ridesByMonth || []} />
                </Suspense>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pro-card pro-col-span pro-actions-card">
            <div className="pro-actions">
              <button
                className="pro-btn"
                onClick={() => {
                  setMode("profile");
                  setOpen(true);
                }}
              >
                Edit Profile
              </button>
              <button
                className="pro-btn secondary"
                onClick={() => {
                  setMode("password");
                  setOpen(true);
                }}
              >
                Change Password
              </button>
            </div>
            {warn && <div className="pro-warn">{warn}</div>}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="pro-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="pro-modal" onClick={(e) => e.stopPropagation()}>
            {mode === "profile" ? (
              <>
                <div className="pro-modal-title">Edit profile</div>
                <div className="pro-form">
                  <label>
                    <span>Name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Upload new photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                  {preview && (
                    <div className="pro-upload-preview">
                      <img src={preview} alt="preview" />
                      <div className="pro-upload-note">
                        {uploading ? "Uploading…" : "Preview"}
                      </div>
                    </div>
                  )}
                </div>
                <div className="pro-modal-actions">
                  <button
                    className="pro-btn secondary"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    className="pro-btn"
                    onClick={onSaveProfile}
                    disabled={saving || uploading}
                  >
                    {saving || uploading ? "Saving…" : "Save Profile"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="pro-modal-title">Change password</div>
                <div className="pro-form">
                  <label>
                    <span>Current password</span>
                    <input
                      type="password"
                      value={pwd.current}
                      onChange={(e) =>
                        setPwd((p) => ({ ...p, current: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    <span>New password</span>
                    <input
                      type="password"
                      value={pwd.next}
                      onChange={(e) =>
                        setPwd((p) => ({ ...p, next: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      value={pwd.confirm}
                      onChange={(e) =>
                        setPwd((p) => ({ ...p, confirm: e.target.value }))
                      }
                    />
                  </label>
                  {pwdMsg.text && (
                    <div className={`pro-msg ${pwdMsg.kind}`}>
                      {pwdMsg.text}
                    </div>
                  )}
                </div>
                <div className="pro-modal-actions">
                  <button
                    className="pro-btn secondary"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    className="pro-btn"
                    onClick={onChangePassword}
                    disabled={pwdSaving}
                  >
                    {pwdSaving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}