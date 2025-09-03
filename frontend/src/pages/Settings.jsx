// src/pages/Settings.jsx
import React, { useEffect, useRef, useState } from "react";
import "./Settings.css";
import API from "../services/api";

/* ---- Select options ---- */
const options = {
  languages: ["English", "Hindi", "Spanish", "French"],
  regions: ["United States", "India", "Europe", "Asia"],
  timezones: [
    "Pacific Time (US & Canada)",
    "Eastern Time (US & Canada)",
    "India Standard Time",
    "Central European Time",
  ],
  themes: ["Light", "Dark", "System"],
  channels: ["Push", "Email", "SMS", "Push + Email", "All"],
  fontSizes: ["Small", "Medium", "Large"],
};

/* ---- Defaults ---- */
const DEFAULTS = {
  language: "English",
  region: "United States",
  timezone: "Pacific Time (US & Canada)",
  theme: "Dark",
  ridePref: true,
  notifications: {
    push: true,
    email: true,
    booking: true,
    cancellations: true,
    driverArrival: true,
    rideStatus: true,
    fareUpdates: true,
    rateReminder: true,
    newReview: true,
    emergency: true,
    accountSecurity: true,
    channel: "Push",
    doNotDisturb: false,
  },
  // NEW: Accessibility defaults
  accessibility: {
    fontSize: "Medium",
    highContrast: false,
    screenReader: false,
    soundAlerts: true,
    vibrationAlerts: true,
    speechAnnouncements: false,
    reducedMotion: true,
    keyboardNavigation: true,
    focusOutline: true,
    voiceControl: false,
    langMode: true,          // accessible language mode
    autoContrastDark: true,  // auto contrast for dark mode
  },
};

/* ---- Billing defaults ---- */
const DEFAULT_BILLING = {
  methods: [
    { id: "pm_1", brand: "VISA", last4: "1234", name: "Primary", exp: "12/27", isDefault: true },
    { id: "pm_2", brand: "MC", last4: "5578", name: "Backup", exp: "07/26", isDefault: false },
  ],
  plan: { tier: "Premium", price: 500.0, active: false },
  credits: 0,
};

const STORAGE_KEY = "vehiclePooling.settings.v1";
const TAB_KEY = "vehiclePooling.settings.activeTab";
const ACCOUNT_KEY = "vehiclePooling.account.v1";
const BILLING_KEY = "vehiclePooling.billing.v1";

/* ---- Utils ---- */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function debounce(fn, ms = 500) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
function detectBrand(num) {
  const s = String(num || "").replace(/\D/g, "");
  if (/^4/.test(s)) return "VISA";
  if (/^5[1-5]/.test(s)) return "MC";
  if (/^3[47]/.test(s)) return "AMEX";
  if (/^6(?:011|5)/.test(s)) return "DISC";
  return "CARD";
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem(TAB_KEY) || "General"
  );

  // Restore settings (deep-merge notifications + accessibility)
  const [settings, setSettings] = useState(() => {
    const local = readJSON(STORAGE_KEY, {});
    return {
      ...DEFAULTS,
      ...local,
      notifications: {
        ...DEFAULTS.notifications,
        ...(local?.notifications || {}),
      },
      accessibility: {
        ...DEFAULTS.accessibility,
        ...(local?.accessibility || {}),
      },
    };
  });

  // Account
  const [account, setAccount] = useState(() =>
    readJSON(ACCOUNT_KEY, { name: "", email: "", phone: "", vehicles: [] })
  );

  // Billing
  const [billing, setBilling] = useState(() =>
    readJSON(BILLING_KEY, DEFAULT_BILLING)
  );
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ name: "", number: "", exp: "", cvc: "" });
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [showPlans, setShowPlans] = useState(false);

  const [loading, setLoading] = useState(true);
  const [limitMsg, setLimitMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const didHydratePrefs = useRef(false);

  /* Load account info & merge */
  useEffect(() => {
    (async () => {
      try {
        const res = await API.users.me();
        const data = res?.user || res || {};
        setAccount((s) => {
          const next = {
            ...s,
            name: data.name || s.name,
            email: data.email || s.email,
            phone: data.phone || s.phone,
            vehicles: Array.isArray(data.vehicles) && data.vehicles.length
              ? data.vehicles
              : s.vehicles,
          };
          localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
          return next;
        });
      } catch (e) {
        console.warn("Could not load profile from server:", e?.message || e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Theme */
  useEffect(() => applyTheme(settings.theme), [settings.theme]);
  function applyTheme(mode) {
    const root = document.documentElement;
    if (applyTheme._mql && applyTheme._listener) {
      applyTheme._mql.removeEventListener?.("change", applyTheme._listener);
      applyTheme._mql = null;
      applyTheme._listener = null;
    }
    if (mode === "System") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const setFromSystem = () => (root.dataset.theme = mql.matches ? "dark" : "light");
      mql.addEventListener?.("change", setFromSystem);
      applyTheme._mql = mql;
      applyTheme._listener = setFromSystem;
      setFromSystem();
    } else {
      root.dataset.theme = String(mode).toLowerCase();
    }
  }

  /* Persist settings */
  useEffect(() => {
    if (!didHydratePrefs.current) {
      didHydratePrefs.current = true;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    debouncedSave(settings);
  }, [settings]);

  const debouncedSave = debounce(async (prefs) => {
    try {
      await API.profile.updatePreferences(prefs); // includes accessibility + notifications
    } catch (e) {
      console.warn("Saving preferences failed:", e?.message || e);
    }
  }, 600);

  /* Persist Billing */
  useEffect(() => {
    localStorage.setItem(BILLING_KEY, JSON.stringify(billing));
    debouncedSaveBilling(billing);
  }, [billing]);
  const debouncedSaveBilling = debounce(async (data) => {
    try {
      if (API?.billing?.updateBilling) await API.billing.updateBilling(data);
      else if (API?.billing?.update) await API.billing.update(data);
    } catch {}
  }, 600);

  /* Persist active tab */
  useEffect(() => localStorage.setItem(TAB_KEY, activeTab), [activeTab]);

  /* Cross-tab sync */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const next = JSON.parse(e.newValue);
          setSettings((s) => ({
            ...s,
            ...next,
            notifications: { ...s.notifications, ...(next.notifications || {}) },
            accessibility: { ...s.accessibility, ...(next.accessibility || {}) },
          }));
        } catch {}
      }
      if (e.key === ACCOUNT_KEY && e.newValue) {
        try {
          const next = JSON.parse(e.newValue);
          setAccount((s) => ({ ...s, ...next }));
        } catch {}
      }
      if (e.key === BILLING_KEY && e.newValue) {
        try {
          const next = JSON.parse(e.newValue);
          setBilling(next);
        } catch {}
      }
      if (e.key === TAB_KEY && e.newValue) setActiveTab(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* Handlers: Settings / Notifications / Accessibility */
  const onPrefChange = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
  const onNotifChange = (key, value) =>
    setSettings((s) => ({ ...s, notifications: { ...s.notifications, [key]: value } }));
  const onA11yChange = (key, value) =>
    setSettings((s) => ({ ...s, accessibility: { ...s.accessibility, [key]: value } }));

  const resetPrefs = () =>
    setSettings({
      ...DEFAULTS,
      notifications: { ...DEFAULTS.notifications },
      accessibility: { ...DEFAULTS.accessibility },
    });

  /* Handlers: Account & Vehicles (unchanged) */
  const saveAccountDebounced = debounce(async (acc) => {
    try {
      await API.profile.updateProfile({
        name: acc.name,
        email: acc.email,
        phone: acc.phone,
        vehicles: acc.vehicles,
      });
      try { await API.profile.updateVehicle({ vehicles: acc.vehicles }); } catch {}
    } catch (e) {
      console.warn("Saving account failed:", e?.message || e);
    }
  }, 700);

  const onAccountChange = (key, value) => {
    setAccount((s) => {
      const next = { ...s, [key]: value };
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      saveAccountDebounced(next);
      return next;
    });
  };

  const onVehicleChange = (idx, key, value) => {
    setAccount((s) => {
      const vehicles = s.vehicles.slice();
      vehicles[idx] = { ...vehicles[idx], [key]: value };
      const next = { ...s, vehicles };
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      saveAccountDebounced(next);
      return next;
    });
  };

  const addVehicle = () => {
    setLimitMsg("");
    setAccount((s) => {
      if (s.vehicles.length >= 3) {
        setLimitMsg("Maximum number of vehicles reached (3).");
        return s;
      }
      const v = { label: `Vehicle ${s.vehicles.length + 1}`, model: "", plate: "", seats: "" };
      const next = { ...s, vehicles: [...s.vehicles, v] };
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      saveAccountDebounced(next);
      return next;
    });
  };

  const removeVehicle = (idx) => {
    setLimitMsg("");
    setAccount((s) => {
      const vehicles = s.vehicles
        .filter((_, i) => i !== idx)
        .map((v, i) => ({ ...v, label: `Vehicle ${i + 1}` }));
      const next = { ...s, vehicles };
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      saveAccountDebounced(next);
      return next;
    });
  };

  async function handleDeleteAccount() {
    try {
      setDeleting(true);
      await API.users.deleteMe();
      localStorage.clear();
      window.location.href = "/login";
    } catch (e) {
      alert("Failed to delete account: " + (e?.message || e));
    } finally {
      setDeleting(false);
    }
  }

  // Close modal on ESC (account delete, add card, plans)
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") { setShowDeleteModal(false); setShowAddCard(false); setShowPlans(false);} }
    if (showDeleteModal || showAddCard || showPlans) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDeleteModal, showAddCard, showPlans]);

  const tabs = [
    { key: "General", icon: "⚙️" },
    { key: "Account", icon: "👤" },
    { key: "Notifications", icon: "🔔" },
    { key: "Billing", icon: "💳" },
    { key: "Accessibility", icon: "♿" },
    { key: "Security", icon: "🔒" },
  ];

  /* -------- Billing actions (unchanged from your last code) -------- */
  const setDefaultMethod = (id) =>
    setBilling((b) => ({
      ...b,
      methods: b.methods.map((m) => ({ ...m, isDefault: m.id === id })),
    }));
  const removeMethod = (id) =>
    setBilling((b) => {
      const list = b.methods.filter((m) => m.id !== id);
      if (list.length > 0 && !list.some((m) => m.isDefault)) list[0].isDefault = true;
      return { ...b, methods: list };
    });
  const addMethod = (e) => {
    e?.preventDefault?.();
    const digits = (newCard.number || "").replace(/\D/g, "");
    if (digits.length < 12) return alert("Please enter a valid card number.");
    const brand = detectBrand(digits);
    const last4 = digits.slice(-4);
    const id = `pm_${Date.now()}`;
    setBilling((b) => ({
      ...b,
      methods: [...b.methods, { id, brand, last4, name: newCard.name || "Card", exp: newCard.exp || "01/30", isDefault: b.methods.length === 0 }],
    }));
    setShowAddCard(false);
    setNewCard({ name: "", number: "", exp: "", cvc: "" });
  };
  const togglePlan = () =>
    setBilling((b) => ({ ...b, plan: { ...b.plan, active: !b.plan.active } }));
  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    if (code === "SAVE50") {
      setBilling((b) => ({ ...b, credits: b.credits + 50 }));
      setPromoMsg("Applied ₹50 credit.");
    } else if (code === "WELCOME100") {
      setBilling((b) => ({ ...b, credits: b.credits + 100 }));
      setPromoMsg("Applied ₹100 credit.");
    } else {
      setPromoMsg("Invalid code.");
    }
    setTimeout(() => setPromoMsg(""), 2500);
    setPromo("");
  };
  const openDemoReceipt = () => {
    const today = new Date();
    const id = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${String(
      today.getHours()
    ).padStart(2, "0")}${String(today.getMinutes()).padStart(2, "0")}`;
    const price = (billing.plan?.price || 500).toFixed(2);
    const html = `
<!doctype html><html><head><meta charset="utf-8"/>
<title>Receipt ${id}</title>
<style>
  :root{--text:#0f1115;--muted:#6b7280;--line:#e5e7eb}
  @media (prefers-color-scheme: dark){:root{--text:#f3f4f6;--muted:#9aa4b2;--line:#2a3039;background:#0d0f13}}
  body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:40px;color:var(--text)}
  .wrap{max-width:800px;margin:0 auto;border:1px solid var(--line);border-radius:14px;padding:24px}
  h1{margin:0 0 4px;font-size:22px} .muted{color:var(--muted)}
  .row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}
  .row:last-child{border-bottom:0}
  .total{font-weight:800;font-size:20px}
  .btn{display:inline-block;margin-top:18px;padding:10px 14px;border:1px solid var(--line);border-radius:10px;text-decoration:none;color:inherit}
</style></head>
<body>
  <div class="wrap">
    <h1>PoolRideX Receipt</h1>
    <div class="muted">Receipt ID: ${id}</div>
    <div class="muted">Date: ${today.toDateString()}</div>
    <div class="row"><div>Plan</div><div>${billing.plan?.tier || "Premium"}</div></div>
    <div class="row"><div>Status</div><div>${billing.plan?.active ? "Active" : "Trial/Inactive"}</div></div>
    <div class="row"><div>Payment method</div><div>${(billing.methods.find(m=>m.isDefault)?.brand || "CARD")} •••• ${(billing.methods.find(m=>m.isDefault)?.last4 || "0000")}</div></div>
    <div class="row total"><div>Amount</div><div>₹${price}</div></div>
    <a class="btn" href="javascript:window.print()">Print / Save as PDF</a>
  </div>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 20000);
  };
  const choosePlan = (tier, price) => {
    setBilling((b) => ({ ...b, plan: { tier, price, active: true } }));
    setShowPlans(false);
  };

  if (loading) return <div className="settings-page">Loading…</div>;

  return (
    <div className="settings-page settings-layout">
      {/* Sidebar */}
      <aside className="side">
        <h2 className="side-title">Settings</h2>
        <ul className="side-list">
          {tabs.map((t) => (
            <li
              key={t.key}
              className={`side-item ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              <span className="icon">{t.icon}</span><span>{t.key}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="main-header">
          <h3>{activeTab}</h3>
          <p className="sub">Manage your preferences and defaults.</p>
        </header>

        {/* ===== GENERAL ===== */}
        {activeTab === "General" && (
          <section className="card fill">
            <div className="rows">
              <div className="row">
                <div className="row-label">
                  <span className="title">Language</span>
                  <span className="hint">Used for menus, labels, and messages</span>
                </div>
                <div className="row-control">
                  <select
                    value={settings.language}
                    onChange={(e) => onPrefChange("language", e.target.value)}
                  >
                    {options.languages.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="row-label">
                  <span className="title">Region</span>
                  <span className="hint">Formats numbers, dates, and addresses</span>
                </div>
                <div className="row-control">
                  <select
                    value={settings.region}
                    onChange={(e) => onPrefChange("region", e.target.value)}
                  >
                    {options.regions.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="row-label">
                  <span className="title">Time zone & format</span>
                  <span className="hint">Affects schedules and receipts</span>
                </div>
                <div className="row-control">
                  <select
                    value={settings.timezone}
                    onChange={(e) => onPrefChange("timezone", e.target.value)}
                  >
                    {options.timezones.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="row-label">
                  <span className="title">Theme</span>
                  <span className="hint">Light, Dark, or System</span>
                </div>
                <div className="row-control">
                  <select
                    value={settings.theme}
                    onChange={(e) => onPrefChange("theme", e.target.value)}
                  >
                    {options.themes.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="row-label">
                  <span className="title">Ride preferences</span>
                  <span className="hint">Enable quick preferences for rides</span>
                </div>
                <div className="row-control">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.ridePref}
                      onChange={(e) => onPrefChange("ridePref", e.target.checked)}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button onClick={resetPrefs} className="btn ghost">Reset to defaults</button>
            </div>
          </section>
        )}

        {/* ===== ACCOUNT ===== */}
        {activeTab === "Account" && (
          <section className="card fill">
            <div className="rows">
              <div className="row">
                <div className="row-label">
                  <span className="title">Name</span>
                  <span className="hint">Shown on your profile</span>
                </div>
                <div className="row-control">
                  <input
                    type="text"
                    value={account.name}
                    onChange={(e) => onAccountChange("name", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="row">
                <div className="row-label">
                  <span className="title">Email</span>
                  <span className="hint">Used for receipts and notifications</span>
                </div>
                <div className="row-control">
                  <input
                    type="email"
                    value={account.email}
                    onChange={(e) => onAccountChange("email", e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="row">
                <div className="row-label">
                  <span className="title">Phone number</span>
                  <span className="hint">For trip updates and security</span>
                </div>
                <div className="row-control">
                  <input
                    type="tel"
                    value={account.phone}
                    onChange={(e) => onAccountChange("phone", e.target.value)}
                    placeholder="e.g., 9898989898"
                  />
                </div>
              </div>

              {/* Vehicle header + Add */}
              <div className="row">
                <div className="row-label">
                  <span className="title">Vehicle info</span>
                  <span className="hint">Add up to 3 vehicles</span>
                </div>
                <div className="row-control" style={{ justifyContent: "space-between", gap: 12 }}>
                  <button
                    onClick={addVehicle}
                    disabled={account.vehicles.length >= 3}
                    className="btn ghost"
                    style={{
                      marginLeft: "auto",
                      cursor: account.vehicles.length >= 3 ? "not-allowed" : "pointer",
                      opacity: account.vehicles.length >= 3 ? 0.6 : 1,
                    }}
                  >
                    Add vehicle
                  </button>
                </div>
              </div>

              {/* Vehicle list */}
              {account.vehicles.map((v, idx) => (
                <div key={idx} className="row" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="vehicle-grid">
                    <div className="field">
                      <label>Vehicle {idx + 1}</label>
                      <input
                        type="text"
                        value={v.label}
                        onChange={(e) => onVehicleChange(idx, "label", e.target.value)}
                        placeholder="e.g., Swift, City"
                      />
                    </div>
                    <div className="field">
                      <label>Model</label>
                      <input
                        type="text"
                        value={v.model}
                        onChange={(e) => onVehicleChange(idx, "model", e.target.value)}
                        placeholder="e.g., 2019 VXI"
                      />
                    </div>
                    <div className="field">
                      <label>Plate no.</label>
                      <input
                        type="text"
                        value={v.plate}
                        onChange={(e) => onVehicleChange(idx, "plate", e.target.value)}
                        placeholder="e.g., DL 09 AB 1234"
                      />
                    </div>
                    <div className="field">
                      <label>Seats</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={v.seats}
                        onChange={(e) => onVehicleChange(idx, "seats", e.target.value)}
                        placeholder="4"
                      />
                    </div>
                    <div className="field" style={{ alignSelf: "end" }}>
                      <button onClick={() => removeVehicle(idx)} className="btn ghost">Remove</button>
                    </div>
                  </div>
                </div>
              ))}

              {(limitMsg || account.vehicles.length >= 3) && (
                <div className="row" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="notice">{limitMsg || "Maximum number of vehicles reached (3)."}</div>
                </div>
              )}

              {/* Delete account */}
              <div className="row" style={{ gridTemplateColumns: "1fr auto" }}>
                <div className="row-label">
                  <span className="title">Delete account</span>
                  <span className="hint">GDPR-compliant delete — removes your data and logs</span>
                </div>
                <div className="row-control">
                  <button onClick={() => setShowDeleteModal(true)} className="btn danger">Delete</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== NOTIFICATIONS (unchanged) ===== */}
        {activeTab === "Notifications" && (
          <section className="card fill">
            <div className="rows grid-2">
              {/* Left */}
              <div className="col">
                <h4 className="section-title">General notifications</h4>
                {["push", "email"].map((k) => (
                  <div className="row" key={k}>
                    <div className="row-label"><span className="title">
                      {k === "push" ? "Push notifications" : "Email notifications"}
                    </span></div>
                    <div className="row-control">
                      <label className="switch">
                        <input type="checkbox" checked={settings.notifications[k]}
                               onChange={(e) => onNotifChange(k, e.target.checked)} />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>
                ))}
                <h4 className="section-title">Ride Updates</h4>
                {[
                  ["booking", "Booking confirmations"],
                  ["cancellations", "Ride cancellations"],
                  ["driverArrival", "Driver arrival"],
                  ["rideStatus", "Ride status changes"],
                  ["fareUpdates", "Fare updates"],
                ].map(([k, label]) => (
                  <div className="row" key={k}>
                    <div className="row-label"><span className="title">{label}</span></div>
                    <div className="row-control">
                      <label className="switch">
                        <input type="checkbox" checked={settings.notifications[k]}
                               onChange={(e) => onNotifChange(k, e.target.checked)} />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right */}
              <div className="col">
                <h4 className="section-title">Reviews & Ratings</h4>
                {[
                  ["rateReminder", "Rate your ride reminder"],
                  ["newReview", "New review received"],
                ].map(([k, label]) => (
                  <div className="row" key={k}>
                    <div className="row-label"><span className="title">{label}</span></div>
                    <div className="row-control">
                      <label className="switch">
                        <input type="checkbox" checked={settings.notifications[k]}
                               onChange={(e) => onNotifChange(k, e.target.checked)} />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>
                ))}
                <h4 className="section-title">Safety & Security</h4>
                {[
                  ["emergency", "Emergency alerts"],
                  ["accountSecurity", "Account security notifications"],
                ].map(([k, label]) => (
                  <div className="row" key={k}>
                    <div className="row-label"><span className="title">{label}</span></div>
                    <div className="row-control">
                      <label className="switch">
                        <input type="checkbox" checked={settings.notifications[k]}
                               onChange={(e) => onNotifChange(k, e.target.checked)} />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>
                ))}
                <h4 className="section-title">Control Preferences</h4>
                <div className="row">
                  <div className="row-label">
                    <span className="title">Notification channels</span>
                    <span className="hint">Choose delivery method</span>
                  </div>
                  <div className="row-control">
                    <select
                      value={settings.notifications.channel}
                      onChange={(e) => onNotifChange("channel", e.target.value)}
                    >
                      {options.channels.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="row-label"><span className="title">Do not disturb</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input type="checkbox" checked={settings.notifications.doNotDisturb}
                             onChange={(e) => onNotifChange("doNotDisturb", e.target.checked)} />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button onClick={resetPrefs} className="btn ghost">Reset to defaults</button>
            </div>
          </section>
        )}

        {/* ===== BILLING (unchanged from your last step) ===== */}
        {activeTab === "Billing" && (
          <section className="card fill">
            <div className="rows billing-grid">
              {/* LEFT side */}
              <div className="billing-col">
                <div className="billing-card">
                  <div className="billing-card-header"><h4>Payment Methods</h4></div>
                  <div className="billing-card-body">
                    <div className="pm-list">
                      {billing.methods.map((m) => (
                        <div key={m.id} className="pm-card">
                          <div className="pm-left">
                            <span className={`brand-pill brand-${m.brand?.toLowerCase?.() || "card"}`}>
                              {m.brand || "CARD"}
                            </span>
                            <span className="pm-digits">•••• {m.last4}</span>
                            <span className="pm-exp">Exp {m.exp}</span>
                            {m.isDefault && <span className="badge default">Default</span>}
                          </div>
                          <div className="pm-actions">
                            {!m.isDefault && (
                              <button className="btn tiny" onClick={() => setDefaultMethod(m.id)}>
                                Make default
                              </button>
                            )}
                            <button className="btn tiny ghost" onClick={() => removeMethod(m.id)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn ghost add-method" onClick={() => setShowAddCard(true)}>
                      <span className="add-plus">＋</span> Add payment method
                    </button>
                  </div>
                </div>

                <div className="billing-card">
                  <div className="billing-card-header"><h4>Transcriptions</h4></div>
                  <div className="billing-card-body">
                    <input type="text" placeholder="Search" />
                  </div>
                </div>

                <div className="billing-card">
                  <div className="billing-card-header"><h4>Subscription Plan</h4></div>
                  <div className="billing-card-body row-like">
                    <div className="row-label"><span className="title">{billing.plan.tier}</span></div>
                    <div className="row-control" style={{ display: "flex", gap: 8 }}>
                      <button className="btn ghost" onClick={togglePlan}>
                        {billing.plan.active ? "Disable" : "Enable"}
                      </button>
                      <button className="btn" onClick={() => setShowPlans(true)}>
                        Choose plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT side */}
              <div className="billing-col">
                <div className="billing-card">
                  <div className="billing-card-header"><h4>Receipts</h4></div>
                  <div className="billing-card-body">
                    <button className="btn primary" onClick={openDemoReceipt}>
                      Download receipt
                    </button>
                  </div>
                </div>

                <div className="billing-card">
                  <div className="billing-card-header"><h4>Subscription Plan</h4></div>
                  <div className="billing-card-body row-like">
                    <div className="row-label"><span className="title">{billing.plan.tier}</span></div>
                    <div className="row-control" style={{ justifyContent: "flex-end" }}>
                      <strong>₹{billing.plan.price.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <div className="billing-card">
                  <div className="billing-card-header"><h4>Credits & Discounts</h4></div>
                  <div className="billing-card-body">
                    <div className="promo-row">
                      <input
                        type="text"
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                        placeholder="Promo code (e.g., SAVE50)"
                      />
                      <button className="btn" onClick={applyPromo}>Apply</button>
                    </div>
                    {!!promoMsg && <div className="notice" style={{ marginTop: 10 }}>{promoMsg}</div>}
                    <div className="muted" style={{ marginTop: 10 }}>
                      Available credits: ₹{billing.credits}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== ACCESSIBILITY (NEW) ===== */}
        {activeTab === "Accessibility" && (
          <section className="card fill">
            <div className="rows grid-2">
              {/* Left column */}
              <div className="col">
                <h4 className="section-title">Visual & Text</h4>

                <div className="row">
                  <div className="row-label">
                    <span className="title">Font size</span>
                    <span className="hint">Applies to labels, menus and forms</span>
                  </div>
                  <div className="row-control">
                    <select
                      value={settings.accessibility.fontSize}
                      onChange={(e) => onA11yChange("fontSize", e.target.value)}
                    >
                      {options.fontSizes.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="row-label"><span className="title">High contrast mode</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.highContrast}
                        onChange={(e) => onA11yChange("highContrast", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <div className="row">
                  <div className="row-label"><span className="title">Screen reader support</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.screenReader}
                        onChange={(e) => onA11yChange("screenReader", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <h4 className="section-title">Audio & Alerts</h4>

                <div className="row">
                  <div className="row-label"><span className="title">Sound alerts</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.soundAlerts}
                        onChange={(e) => onA11yChange("soundAlerts", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <div className="row">
                  <div className="row-label"><span className="title">Vibration alerts</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.vibrationAlerts}
                        onChange={(e) => onA11yChange("vibrationAlerts", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <div className="row">
                  <div className="row-label"><span className="title">Speech announcements</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.speechAnnouncements}
                        onChange={(e) => onA11yChange("speechAnnouncements", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="col">
                <h4 className="section-title">Interaction & Input</h4>

                <div className="row">
                  <div className="row-label"><span className="title">Reduced motion</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.reducedMotion}
                        onChange={(e) => onA11yChange("reducedMotion", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <div className="row">
                  <div className="row-label"><span className="title">Keyboard navigation</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.keyboardNavigation}
                        onChange={(e) => onA11yChange("keyboardNavigation", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <div className="row">
                  <div className="row-label"><span className="title">Focus outline</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.focusOutline}
                        onChange={(e) => onA11yChange("focusOutline", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <div className="row">
                  <div className="row-label"><span className="title">Voice control</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.voiceControl}
                        onChange={(e) => onA11yChange("voiceControl", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <h4 className="section-title">Language & Display</h4>

                <div className="row">
                  <div className="row-label"><span className="title">Accessible language mode</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.langMode}
                        onChange={(e) => onA11yChange("langMode", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <div className="row">
                  <div className="row-label"><span className="title">Auto contrast for dark mode</span></div>
                  <div className="row-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.autoContrastDark}
                        onChange={(e) => onA11yChange("autoContrastDark", e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button onClick={resetPrefs} className="btn ghost">Reset to defaults</button>
            </div>
          </section>
        )}

        {/* ===== MODALS (same as before) ===== */}
        {showAddCard && (
          <div className="modal-backdrop" onClick={() => setShowAddCard(false)} aria-hidden="true">
            <div className="modal modal-appear" role="dialog" aria-modal="true"
                 aria-labelledby="addpm-title" aria-describedby="addpm-desc"
                 onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="warn-icon" aria-hidden="true">💳</div>
                <div className="header-text">
                  <h4 id="addpm-title">Add payment method</h4>
                  <p id="addpm-desc" className="muted">Your details are stored securely.</p>
                </div>
              </div>
              <form className="modal-body pm-form" onSubmit={addMethod}>
                <label>Cardholder name
                  <input type="text" value={newCard.name}
                         onChange={(e) => setNewCard((c) => ({ ...c, name: e.target.value }))}
                         placeholder="Name on card" required />
                </label>
                <label>Card number
                  <input inputMode="numeric" value={newCard.number}
                         onChange={(e) => setNewCard((c) => ({ ...c, number: e.target.value }))}
                         placeholder="1234 5678 9012 3456" required />
                </label>
                <div className="pm-inline">
                  <label>Expiry (MM/YY)
                    <input value={newCard.exp}
                           onChange={(e) => setNewCard((c) => ({ ...c, exp: e.target.value }))}
                           placeholder="12/27" required />
                  </label>
                  <label>CVC
                    <input inputMode="numeric" value={newCard.cvc}
                           onChange={(e) => setNewCard((c) => ({ ...c, cvc: e.target.value }))}
                           placeholder="123" required />
                  </label>
                </div>
                <div className="muted">Brand detected: {detectBrand(newCard.number)}</div>
              </form>
              <div className="modal-actions">
                <button onClick={() => setShowAddCard(false)} className="btn ghost">Cancel</button>
                <button onClick={addMethod} className="btn">Save card</button>
              </div>
            </div>
          </div>
        )}

        {showPlans && (
          <div className="modal-backdrop" onClick={() => setShowPlans(false)} aria-hidden="true">
            <div className="modal modal-appear" role="dialog" aria-modal="true"
                 aria-labelledby="plans-title" aria-describedby="plans-desc"
                 onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="warn-icon" aria-hidden="true">⭐</div>
                <div className="header-text">
                  <h4 id="plans-title">Choose a subscription</h4>
                  <p id="plans-desc" className="muted">Select a plan that fits your needs.</p>
                </div>
              </div>
              <div className="modal-body">
                <div className="plans-grid">
                  <PlanCard title="Basic" price={199}
                            perks={["Standard matching", "Email support", "Limited history"]}
                            current={billing.plan.tier === "Basic"}
                            onSelect={() => choosePlan("Basic", 199)} />
                  <PlanCard title="Standard" price={299} highlight
                            perks={["Priority matching", "Push + Email alerts", "Extended history", "Faster support"]}
                            current={billing.plan.tier === "Standard"}
                            onSelect={() => choosePlan("Standard", 299)} />
                  <PlanCard title="Premium" price={500}
                            perks={["Top priority", "All channels notifications", "Advanced analytics", "24×7 support"]}
                            current={billing.plan.tier === "Premium"}
                            onSelect={() => choosePlan("Premium", 500)} />
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowPlans(false)} className="btn ghost">Close</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)} aria-hidden="true">
            <div className="modal modal-appear" role="dialog" aria-modal="true"
                 aria-labelledby="del-title" aria-describedby="del-desc"
                 onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="warn-icon" aria-hidden="true">!</div>
                <div className="header-text">
                  <h4 id="del-title">Delete your account?</h4>
                  <p id="del-desc" className="muted">This action is permanent and will log you out immediately.</p>
                </div>
              </div>
              <div className="modal-body">
                <ul className="bullet">
                  <li>All profile data, vehicles, and preferences will be removed.</li>
                  <li>You will be signed out on this device.</li>
                  <li>This cannot be undone.</li>
                </ul>
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowDeleteModal(false)} disabled={deleting} className="btn ghost">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={deleting} className="btn danger">
                  {deleting ? "Deleting…" : "Confirm delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- Plan card component ---------- */
function PlanCard({ title, price, perks, highlight = false, current = false, onSelect }) {
  return (
    <div className={`plan-card ${highlight ? "highlight" : ""}`}>
      <div className="plan-head">
        <h5>{title}</h5>
        <div className="plan-price">₹{price}</div>
      </div>
      <ul className="plan-perks">
        {perks.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
      <button
        className={`btn ${highlight ? "primary" : ""}`}
        onClick={onSelect}
        disabled={current}
        aria-disabled={current}
      >
        {current ? "Current plan" : "Select"}
      </button>
    </div>
  );
}
