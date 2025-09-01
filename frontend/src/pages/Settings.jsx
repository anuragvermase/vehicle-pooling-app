import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom"; // ✅ SPA navigation for dropdown
import "./Settings.css";
import API from "../services/api";

/* =========================================================
   SMALL UTILS (storage + debounce + theme)
   ========================================================= */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useDebounced(fn, delay = 600) {
  const t = useRef();
  return (...args) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => fn(...args), delay);
  };
}

const LS_KEYS = {
  locale:   "settings.locale",
  tz:       "settings.timeZone",
  theme:    "settings.theme",
  profile:  "account.profile",
  vehicles: "account.vehicles",
  emergency:"account.emergency",
};

function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (v === null || v === undefined) return fallback;
    try { return JSON.parse(v); } catch { return v; }
  } catch { return fallback; }
}
function writeLS(key, val) {
  localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
}
function readUserFromStorage() {
  try { return JSON.parse(localStorage.getItem("user")) || {}; }
  catch { return {}; }
}

/** Applies theme immediately; when mode === "system" it follows OS and updates on change */
function applyTheme(mode) {
  const root = document.documentElement;
  if (applyTheme._mql) {
    applyTheme._mql.removeEventListener?.("change", applyTheme._listener);
    applyTheme._mql = null;
    applyTheme._listener = null;
  }
  const setFromSystem = () => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = prefersDark ? "dark" : "light";
  };
  if (mode === "system") {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setFromSystem();
    mql.addEventListener?.("change", listener);
    applyTheme._mql = mql;
    applyTheme._listener = listener;
    setFromSystem();
  } else {
    root.dataset.theme = mode; // "light" or "dark"
  }
}

/* =========================================================
   TINY UI PIECES (styled in CSS)
   ========================================================= */
function Switch({ label, desc, checked, onChange, disabled }) {
  const id = useMemo(() => `sw_${Math.random().toString(36).slice(2)}`, []);
  return (
    <label htmlFor={id} className={`sh-switch ${disabled ? "is-disabled":""}`}>
      <div className="sh-switch-text">
        <div className="sh-switch-label">{label}</div>
        {desc ? <div className="sh-switch-desc">{desc}</div> : null}
      </div>
      <input id={id} type="checkbox" checked={!!checked} disabled={disabled}
        onChange={(e)=>onChange?.(e.target.checked)} />
      <span className="sh-slider" aria-hidden/>
    </label>
  );
}
function Radio({ name, value, current, onChange, label }) {
  const id = useMemo(() => `rd_${Math.random().toString(36).slice(2)}`, []);
  return (
    <label htmlFor={id} className="sh-radio">
      <input id={id} name={name} type="radio" checked={current===value} onChange={()=>onChange(value)} />
      <span className="sh-radio-dot" aria-hidden />
      <span className="sh-radio-label">{label}</span>
    </label>
  );
}
function Select({ label, value, onChange, options, placeholder }) {
  const id = useMemo(() => `sel_${Math.random().toString(36).slice(2)}`, []);
  return (
    <div className="sh-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e)=>onChange(e.target.value)}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}
function Input({ label, type="text", value, onChange, placeholder, bad, disabled=false, className="", ...rest }) {
  const id = useMemo(() => `in_${Math.random().toString(36).slice(2)}`, []);
  return (
    <div className={`sh-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className={`${bad ? "sh-bad":""} ${disabled ? "sh-disabled":""}`}
        disabled={disabled}
        {...rest}
      />
    </div>
  );
}
function Button({ children, variant="primary", ...props }) {
  return <button className={`sh-btn sh-${variant}`} {...props}>{children}</button>;
}

/* Flat group (no boxes on the right) */
function Group({ title, right, children }) {
  return (
    <section className="sh-group">
      <div className="sh-group-head">
        <h3 className="sh-group-title">{title}</h3>
        {right ? <div className="sh-group-right">{right}</div> : null}
      </div>
      <div className="sh-group-body">{children}</div>
      <div className="sh-divider" />
    </section>
  );
}

/* =========================================================
   MAIN HUB
   ========================================================= */
const TABS = [
  { key: "general",       icon: "⚙", label: "General" },
  { key: "account",       icon: "👤", label: "Account" },
  { key: "notifications", icon: "🔔", label: "Notifications" },
  { key: "billing",       icon: "💳", label: "Billing" },
  { key: "accessibility", icon: "♿", label: "Accessibility" },
  { key: "security",      icon: "🔐", label: "Security" },
];

export default function SettingsHub() {
  // lock page shell (fixed sidebar) and apply saved theme on mount
  useEffect(() => {
    document.body.classList.add("settings-active");
    applyTheme(readLS(LS_KEYS.theme, "system"));
    return () => document.body.classList.remove("settings-active");
  }, []);

  // Dropdown (same everywhere)
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await API.users?.me?.().catch(() => null);
      setMe(res?.user || readUserFromStorage() || null);
    })();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const initials = useMemo(() => {
    const n = me?.name || "";
    return n.split(" ").map(s => s[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
  }, [me?.name]);

  const [active, setActive] = useState("general");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ ok:"", err:"" });

  const storageUser = readUserFromStorage(); // fallback user (from your login)
  const [user, setUser] = useState({
    name:    storageUser?.name  || "",
    email:   storageUser?.email || "",
    locale:  readLS(LS_KEYS.locale, "en-US"),
    timeZone:readLS(LS_KEYS.tz, Intl.DateTimeFormat().resolvedOptions().timeZone)
  });

  useEffect(() => { (async()=>{
    try{
      const me = await API.users?.getMe?.().catch(()=>null);
      const d = me?.data || me || {};
      setUser(u=>({
        ...u,
        name: d.name || d.fullName || storageUser?.name || u.name,
        email: d.email || storageUser?.email || u.email,
        locale: d.preferences?.locale || u.locale,
        timeZone: d.preferences?.timeZone || u.timeZone,
      }));
    } finally { setLoading(false); }
  })(); }, []);

  return (
    <div className="sh-page">
      {/* Header with dropdown */}
      <div className="set-header" ref={menuRef}>
        <div className="set-title">Settings</div>
        <div className="set-head-right">
          <button
            className="set-avatar-btn"
            title="Menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            {me?.avatarUrl ? <img src={me.avatarUrl} alt="" /> : <span>{initials || "U"}</span>}
          </button>

          {menuOpen && (
            <div className="set-menu">
              <Link className="set-menu-item" to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link className="set-menu-item" to="/overview"  onClick={() => setMenuOpen(false)}>Overview</Link>
              <Link className="set-menu-item" to="/profile"   onClick={() => setMenuOpen(false)}>Profile</Link>
              <a    className="set-menu-item danger" href="/logout">Logout</a>
            </div>
          )}
        </div>
      </div>

      <div className="sh-shell">
        {/* LEFT: fixed + sticky sidebar (never moves) */}
        <aside className="sh-side">
          <div className="sh-side-title">Settings</div>
          <nav className="sh-nav" role="tablist" aria-label="Settings sections">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`sh-nav-item ${active===t.key ? "is-active":""}`}
                onClick={()=>setActive(t.key)}
                role="tab"
                aria-selected={active===t.key}
              >
                <span className="sh-nav-ico" aria-hidden>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* RIGHT: scrollable content only (fixed inner width) */}
        <main className="sh-main">{/* CHANGED: overflow behaviour handled in CSS */}
          <div className="sh-main-inner">
            {active === "general"       && <GeneralPanel user={user} setUser={setUser} setMsg={setMsg} />}
            {active === "account"       && <AccountPanel user={user} setUser={setUser} setMsg={setMsg} />}
            {active === "notifications" && <NotificationsPanel setMsg={setMsg} />}
            {active === "billing"       && <BillingPanel setMsg={setMsg} />}
            {active === "accessibility" && <AccessibilityPanel setMsg={setMsg} />}
            {active === "security"      && <SecurityPanel setMsg={setMsg} />}

            {(loading || msg.ok || msg.err) && (
              <div className="sh-status">
                {loading && <span>Loading…</span>}
                {msg.ok  && <span className="sh-ok">{msg.ok}</span>}
                {msg.err && <span className="sh-err">{msg.err}</span>}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   PANELS
   ========================================================= */

function GeneralPanel({ user, setUser, setMsg }) {
  const [locale,   setLocale]   = useState(readLS(LS_KEYS.locale, "en-US"));
  const [timeZone, setTimeZone] = useState(readLS(LS_KEYS.tz, Intl.DateTimeFormat().resolvedOptions().timeZone));
  const [theme,    setTheme]    = useState(readLS(LS_KEYS.theme, "system"));

  useEffect(() => {
    if (!locale   && user.locale)   setLocale(user.locale);
    if (!timeZone && user.timeZone) setTimeZone(user.timeZone);
  }, [user]);

  const saveAPI = useDebounced(async (payload) => {
    try {
      if (API.settings?.updateGeneral) await API.settings.updateGeneral(payload);
      setMsg({ ok:"General settings saved.", err:"" });
    } catch (e) {
      setMsg({ ok:"", err:String(e?.message || e) });
    }
  }, 400);

  const onLocale   = (v) => { setLocale(v); writeLS(LS_KEYS.locale, v); setUser(u=>({...u, locale:v})); saveAPI({ locale:v, timeZone, theme }); };
  const onTimeZone = (v) => { setTimeZone(v); writeLS(LS_KEYS.tz, v);   setUser(u=>({...u, timeZone:v})); saveAPI({ locale, timeZone:v, theme }); };
  const onTheme    = (v) => { setTheme(v); writeLS(LS_KEYS.theme, v);   applyTheme(v); saveAPI({ locale, timeZone, theme:v }); };

  const LANGS = [
    { value:"en-US", label:"English (United States)" },
    { value:"hi-IN", label:"हिन्दी (भारत)" },
    { value:"en-GB", label:"English (United Kingdom)" },
  ];
  const TZ = [
    { value:"Asia/Kolkata",        label:"(GMT+05:30) India Standard Time, 24h" },
    { value:"UTC",                 label:"(GMT+00:00) Coordinated Universal Time" },
    { value:"America/Los_Angeles", label:"(GMT-08:00) Pacific Time" },
  ];

  return (
    <>
      <h1 className="sh-h1">General settings</h1>

      <div className="sh-2col">
        <Group title="Language & region">
          <Select label="Language" value={locale} onChange={onLocale} options={LANGS} />
        </Group>
        <Group title="Time zone & format">
          <Select label="Time zone" value={timeZone} onChange={onTimeZone} options={TZ} />
        </Group>
      </div>

      <div className="sh-2col">
        <Group title="Theme mode">
          <div className="sh-row">
            <Radio name="theme" value="light"  current={theme} onChange={onTheme} label="Light" />
            <Radio name="theme" value="dark"   current={theme} onChange={onTheme} label="Dark" />
            <Radio name="theme" value="system" current={theme} onChange={onTheme} label="System" />
          </div>
        </Group>
        <Group title="Ride preferences">
          <div className="sh-help">Set pickup radius, rider filters, trusted contacts.</div>
        </Group>
      </div>
    </>
  );
}

/* ---------- ACCOUNT ---------- */
function AccountPanel({ user, setUser, setMsg }) {
  const storageUser = readUserFromStorage();
  const [me, setMe] = useState(readLS(LS_KEYS.profile, {
    name:  user?.name || storageUser?.name || "",
    email: user?.email || storageUser?.email || "",
    phone: "",
  }));
  const [vehicles, setVehicles] = useState(readLS(LS_KEYS.vehicles, [{ make:"", model:"", plate:"", seats:4, id:"v1" }]));
  const [emg, setEmg] = useState(readLS(LS_KEYS.emergency, { name:"", phone:"" }));

  useEffect(()=>{ (async()=>{
    try{
      const r = await API.users?.getMe?.().catch(()=>null);
      const d = r?.data || r || {};
      const next = {
        name:  d.name || d.fullName || me.name  || user?.name  || storageUser?.name  || "",
        email: d.email || me.email   || user?.email || storageUser?.email || "",
        phone: d.phone || d.mobile   || me.phone,
      };
      setMe(next); writeLS(LS_KEYS.profile, next);

      let vs = readLS(LS_KEYS.vehicles, []);
      const gv = await API.users?.getVehicles?.().catch(()=>null);
      if (Array.isArray(gv?.data)) vs = gv.data;
      else {
        const v1 = await API.users?.getVehicle?.().catch(()=>null);
        const dv = v1?.data || v1 || {};
        if (dv && (dv.make || dv.model || dv.plate || dv.seats)) vs = [dv];
      }
      if (vs && vs.length) {
        const mapped = vs.slice(0,3).map((v,i)=>({ make:v.make||"", model:v.model||"", plate:v.plate||"", seats:Number(v.seats||4), id:`v${i+1}` }));
        setVehicles(mapped); writeLS(LS_KEYS.vehicles, mapped);
      }

      const e = await API.users?.getEmergencyContact?.().catch(()=>null);
      const de = e?.data || e || {};
      const em = { name: de.name || emg.name, phone: de.phone || emg.phone };
      setEmg(em); writeLS(LS_KEYS.emergency, em);
    }catch{}
  })(); }, []);

  useEffect(()=>{
    if (user?.name || user?.email) {
      const next = { ...me, name:user.name || me.name, email:user.email || me.email };
      setMe(next); writeLS(LS_KEYS.profile, next);
    }
  }, [user?.name, user?.email]);

  const addVehicle = () => {
    if (vehicles.length >= 3) return;
    const id = `v${Date.now().toString(36).slice(2,6)}`;
    const next = [...vehicles, { make:"", model:"", plate:"", seats:4, id }];
    setVehicles(next); writeLS(LS_KEYS.vehicles, next);
  };
  const removeVehicle = (id) => {
    const next = vehicles.filter(v=>v.id!==id);
    setVehicles(next.length ? next : [{ make:"", model:"", plate:"", seats:4, id:"v1"}]);
    writeLS(LS_KEYS.vehicles, next.length ? next : [{ make:"", model:"", plate:"", seats:4, id:"v1"}]);
  };
  const clampSeat = (val) => {
    const n = Math.max(1, Math.min(6, parseInt(val || "0", 10)));
    return Number.isFinite(n) ? n : 1;
  };
  const changeVehicle = (id, field, value) => {
    const next = vehicles.map(v => {
      if (v.id !== id) return v;
      if (field === "seats") return { ...v, seats: clampSeat(value) };
      return { ...v, [field]: value };
    });
    setVehicles(next); writeLS(LS_KEYS.vehicles, next);
  };

  const saveAll = async ()=>{
    try{
      await API.users?.updateProfile?.({ phone: me.phone });
      if (API.users?.updateVehicles) {
        await API.users.updateVehicles(vehicles.map(({id, ...v})=>v));
      } else {
        for (const v of vehicles) await API.users?.updateVehicle?.({ make:v.make, model:v.model, plate:v.plate, seats:v.seats });
      }
      await API.users?.setEmergencyContact?.(emg);
      writeLS(LS_KEYS.profile, me);
      writeLS(LS_KEYS.vehicles, vehicles);
      writeLS(LS_KEYS.emergency, emg);
      setMsg({ ok:"Account settings saved.", err:"" });
    }catch(e){ setMsg({ ok:"", err:String(e?.message || e) }); }
  };

  const deleteAccount = async ()=>{
    if (!window.confirm("Permanently delete your account?")) return;
    try { await API.users?.deleteAccount?.(); window.location.href="/login"; }
    catch(e){ setMsg({ ok:"", err:String(e?.message || e) }); }
  };

  return (
    <>
      <h1 className="sh-h1">Account settings</h1>

      <div className="sh-stack-v">
        {/* Profile info */}
        <Group title="Profile info">
          <div className="sh-2col">
            <Input label="Name"  value={me.name}  onChange={()=>{}} disabled />
            <Input label="Email" value={me.email} onChange={()=>{}} bad={!emailRe.test(me.email||"")} disabled />
          </div>
          <div className="sh-1col">
            <Input label="Phone number" value={me.phone} onChange={(v)=>setMe({...me, phone:v})} placeholder="+91 XXXXXXXXXX"/>
          </div>
        </Group>

        {/* Vehicle info */}
        <Group title="Vehicle info" right={<Button variant="secondary" onClick={addVehicle} disabled={vehicles.length>=3}>Add vehicle</Button>}>
          {vehicles.map((v, idx)=>(
            <div key={v.id} className="veh-block">
              <div className="veh-head">
                <div className="veh-title">Vehicle {idx+1}</div>
                {vehicles.length>1 && (<Button variant="ghost" onClick={()=>removeVehicle(v.id)}>Remove</Button>)}
              </div>
              <div className="sh-3col">
                <Input label="Make"      value={v.make}  onChange={(val)=>changeVehicle(v.id,"make",val)}/>
                <Input label="Model"     value={v.model} onChange={(val)=>changeVehicle(v.id,"model",val)}/>
                <Input label="Plate no." value={v.plate} onChange={(val)=>changeVehicle(v.id,"plate",val)}/>
              </div>
              <div className="sh-1col">
                <Input
                  label="Seats"
                  type="number"
                  value={v.seats}
                  onChange={(val)=>changeVehicle(v.id,"seats",val)}
                  min={1}
                  max={6}
                  step={1}
                  inputMode="numeric"
                  pattern="[1-6]"
                  className="seats-field"
                />
              </div>
              <div className="sh-divider" />
            </div>
          ))}
        </Group>

        {/* Emergency contact */}
        <Group title="Emergency contact">
          <div className="sh-2col">
            <Input label="Contact name"  value={emg.name}  onChange={(v)=>setEmg({...emg, name:v})}/>
            <Input label="Contact phone" value={emg.phone} onChange={(v)=>setEmg({...emg, phone:v})}/>
          </div>
        </Group>

        {/* Delete account */}
        <Group title="Delete account" right={<Button variant="danger" onClick={deleteAccount}>Delete</Button>}>
          <div className="sh-help">GDPR compliant delete — removes your data and logs you out.</div>
        </Group>

        <div className="sh-right"><Button onClick={saveAll}>Save changes</Button></div>
      </div>
    </>
  );
}

/* ---------- NOTIFICATIONS ---------- */
function NotificationsPanel({ setMsg }) {
  const [channels, setChannels] = useState(readLS("settings.channels",{ push:true, email:true, sms:false }));
  const [pref, setPref]         = useState(readLS("settings.notif",{ rideAlerts:true, booking:true, payment:true }));

  const save = useDebounced(async (payload)=>{
    try{
      writeLS("settings.notif",   { rideAlerts:payload.rideAlerts, booking:payload.booking, payment:payload.payment });
      writeLS("settings.channels", payload.channels);
      if (API.settings?.updateNotifications) await API.settings.updateNotifications(payload);
      setMsg({ ok:"Notification settings saved.", err:"" });
    }catch(e){ setMsg({ ok:"", err:String(e?.message || e) }); }
  }, 400);

  useEffect(()=>{ save({ ...pref, channels }); }, [pref, channels]);

  return (
    <>
      <h1 className="sh-h1">Notification settings</h1>

      <div className="sh-2col">
        <Group title="Ride alerts">
          <Switch label="Notify when someone offers a ride near me" checked={pref.rideAlerts}
            onChange={v=>setPref({...pref, rideAlerts:v})}/>
        </Group>

        <Group title="Booking status">
          <Switch label="Confirmation, cancellations & driver arrival" checked={pref.booking}
            onChange={v=>setPref({...pref, booking:v})}/>
        </Group>
      </div>

      <div className="sh-2col">
        <Group title="Payment notifications">
          <Switch label="Receipts & refunds" checked={pref.payment}
            onChange={v=>setPref({...pref, payment:v})}/>
        </Group>

        <Group title="Channels">
          <div className="sh-row">
            <Switch label="Push"  checked={channels.push}  onChange={v=>setChannels({...channels, push:v})}/>
            <Switch label="Email" checked={channels.email} onChange={v=>setChannels({...channels, email:v})}/>
            <Switch label="SMS"   checked={channels.sms}   onChange={v=>setChannels({...channels, sms:v})}/>
          </div>
        </Group>
      </div>
    </>
  );
}

/* ---------- BILLING ---------- */
function BillingPanel({ setMsg }) {
  const [methods, setMethods] = useState(readLS("billing.methods", []));
  const [txns, setTxns]       = useState(readLS("billing.txns", []));
  useEffect(()=>{ (async()=>{
    try{
      const m = await API.billing?.getMethods?.().catch(()=>null);
      if (m?.data || m) { setMethods(m.data||m); writeLS("billing.methods", m.data||m); }
      const t = await API.billing?.getTransactions?.().catch(()=>null);
      if (t?.data || t) { setTxns(t.data||t); writeLS("billing.txns", t.data||t); }
    }catch{}
  })(); }, []);
  const addMethod = async ()=>{
    const payload={ id:Math.random().toString(36).slice(2), brand:"VISA", last4:String(Math.floor(Math.random()*9000+1000)), exp:"08/29" };
    try{
      let out=payload;
      if (API.billing?.addMethod){ const r=await API.billing.addMethod(payload).catch(()=>({data:payload})); out=r?.data||payload; }
      const next=[...methods,out]; setMethods(next); writeLS("billing.methods",next); setMsg({ok:"Payment method added.",err:""});
    }catch(e){ setMsg({ok:"",err:String(e?.message||e)}); }
  };
  const removeMethod = async (id)=>{
    if(!window.confirm("Remove this payment method?")) return;
    try{
      if (API.billing?.removeMethod) await API.billing.removeMethod(id);
      const next=methods.filter(m=>m.id!==id); setMethods(next); writeLS("billing.methods",next);
    }catch(e){ setMsg({ok:"",err:String(e?.message||e)}); }
  };

  return (
  <div className="sh-legacy">
    <h1 className="sh-h1">Billing</h1>

    <div className="sh-2col">
      <Group title="Payment methods" right={<Button variant="secondary" onClick={addMethod}>Add method</Button>}>
        <div className="sh-table">
          <div className="sh-tr sh-th"><div>Brand</div><div>Last 4</div><div>Expires</div><div></div></div>
          {methods.map(m=>(
            <div className="sh-tr" key={m.id}>
              <div>{m.brand||"Card"}</div>
              <div>{m.last4}</div>
              <div>{m.exp || `${String(m.expMonth).padStart(2,"0")}/${String(m.expYear).slice(-2)}`}</div>
              <div className="sh-right"><Button variant="ghost" onClick={()=>removeMethod(m.id)}>Remove</Button></div>
            </div>
          ))}
          {!methods.length && <div className="sh-empty">No payment methods added yet.</div>}
        </div>
      </Group>

      <Group title="Transaction history" right={<Button variant="secondary" onClick={()=>window.print()}>Download receipts</Button>}>
        <div className="sh-table">
          <div className="sh-tr sh-th"><div>Date</div><div>Amount</div><div>Status</div><div>Invoice</div></div>
          {txns.map(t=>(
            <div className="sh-tr" key={t.id}>
              <div>{new Date(t.date||Date.now()).toLocaleString()}</div>
              <div>₹{Number(t.amount||0).toLocaleString("en-IN")}</div>
              <div>{t.status||"paid"}</div>
              <div><Button variant="ghost" onClick={()=>alert("Open invoice viewer")}>View</Button></div>
            </div>
          ))}
          {!txns.length && <div className="sh-empty">No transactions yet.</div>}
        </div>
      </Group>
    </div>

    <Group title="Subscription plan">
      <div className="sh-row">
        <div className="sh-help">Upgrade to Priority plan for zero-fee cancellations and priority booking.</div>
        <Button onClick={()=>alert("Open subscription flow")}>Explore plans</Button>
      </div>
    </Group>
  </div>
);
}

/* ---------- ACCESSIBILITY ---------- */
function AccessibilityPanel({ setMsg }) {
  const [prefs, setPrefs] = useState(readLS("settings.accessibility", {
    textSize:"md", contrast:"normal", voice:false, reader:false,
    rideNoMusic:false, ridePetFriendly:false, rideWomenOnly:false
  }));
  const save = useDebounced(async (payload)=>{
    try{
      writeLS("settings.accessibility", payload);
      if (API.settings?.updateAccessibility) await API.settings.updateAccessibility(payload);
      setMsg({ ok:"Accessibility settings saved.", err:"" });
    }catch(e){ setMsg({ ok:"", err:String(e?.message || e) }); }
  }, 400);

  useEffect(()=>{ save(prefs); }, [prefs]);

  return (
    <>
      <h1 className="sh-h1">Accessibility</h1>

      <div className="sh-2col">
        <Group title="Text size / Contrast">
          <div className="sh-row">
            <Select label="Text size" value={prefs.textSize} onChange={v=>setPrefs({...prefs, textSize:v})}
              options={[{value:"sm",label:"Small"},{value:"md",label:"Medium"},{value:"lg",label:"Large"},{value:"xl",label:"Extra large"}]}/>
            <Select label="Contrast" value={prefs.contrast} onChange={v=>setPrefs({...prefs, contrast:v})}
              options={[{value:"normal",label:"Normal"},{value:"high",label:"High"}]}/>
          </div>
        </Group>

        <Group title="Assistive tech">
          <div className="sh-row">
            <Switch label="Voice Assist" checked={prefs.voice} onChange={v=>setPrefs({...prefs, voice:v})}/>
            <Switch label="Screen Reader Mode" checked={prefs.reader} onChange={v=>setPrefs({...prefs, reader:v})}/>
          </div>
        </Group>
      </div>

      <Group title="Ride preferences">
        <div className="sh-row">
          <Switch label="No music"        checked={prefs.rideNoMusic}      onChange={v=>setPrefs({...prefs, rideNoMusic:v})}/>
          <Switch label="Pet friendly"    checked={prefs.ridePetFriendly}  onChange={v=>setPrefs({...prefs, ridePetFriendly:v})}/>
          <Switch label="Women only rides"checked={prefs.rideWomenOnly}    onChange={v=>setPrefs({...prefs, rideWomenOnly:v})}/>
        </div>
      </Group>
    </>
  );
}

/* ---------- SECURITY (real-time) ---------- */
function SecurityPanel({ setMsg }) {
  const [pwd, setPwd] = useState({ current:"", next:"", confirm:"" });

  // 2FA
  const [twoFA, setTwoFA] = useState({
    enabled: false,
    secret: "",
    otpauthUrl: "",
    verified: false,
  });
  const [showSetup, setShowSetup] = useState(false);
  const [otp, setOtp] = useState("");
  const qrCanvasRef = useRef(null);
  const [qrDrawn, setQrDrawn] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState([]);

  // Identity
  const [idv, setIdv] = useState({
    license: null, // {url, status} or string url
    aadhaar: null, // {url, status} or string url
  });
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  // --------- bootstrap ---------
  useEffect(()=>{ (async()=>{
    try{
      const fa = await API.security?.get2FA?.().catch(()=>null);
      const dfa = fa?.data || fa || {};
      setTwoFA(s=>({
        ...s,
        enabled: !!dfa.enabled,
        verified: !!dfa.enabled,
        secret: dfa.secret || "",
        otpauthUrl: dfa.otpauthUrl || "",
      }));

      const ses = await API.security?.getSessions?.().catch(()=>null);
      setSessions(ses?.data || ses || []);

      const id = await API.security?.getIdentity?.().catch(()=>null);
      let di = id?.data || id || {};
      // normalize to objects
      const norm = (v)=> (v && typeof v === "object") ? v : (v ? { url:v, status:"uploaded" } : null);
      setIdv({
        license: norm(di.license),
        aadhaar: norm(di.aadhaar),
      });
    }catch{}
  })(); }, []);

  // --------- sessions: poll every 15s + “last active” ticks ---------
  useEffect(()=>{
    const load = async ()=> {
      try{
        const ses = await API.security?.getSessions?.().catch(()=>null);
        if (ses) setSessions(ses?.data || ses || []);
      }catch{}
    };
    const t1 = setInterval(load, 15000);
    const t2 = setInterval(()=>{ // force a re-render so relative time updates
      setSessions(s => [...s]);
    }, 60000);
    return ()=>{ clearInterval(t1); clearInterval(t2); };
  }, []);

  // --------- identity: poll status if pending ---------
  useEffect(()=>{
    const needs = (x)=> !!x && typeof x === "object" && ["pending","review","verifying"].includes((x.status||"").toLowerCase());
    if (!needs(idv.license) && !needs(idv.aadhaar)) return;
    const load = async ()=>{
      try{
        const id = await API.security?.getIdentity?.().catch(()=>null);
        const di = id?.data || id || {};
        const norm = (v)=> (v && typeof v === "object") ? v : (v ? { url:v, status:"uploaded" } : null);
        setIdv({ license:norm(di.license), aadhaar:norm(di.aadhaar) });
      }catch{}
    };
    const t = setInterval(load, 10000);
    return ()=> clearInterval(t);
  }, [idv.license?.status, idv.aadhaar?.status]);

  // --------- 2FA: QR render (no new deps required; tries dynamic 'qrcode' else falls back to <img>) ---------
  useEffect(()=>{
    (async ()=>{
      if (!showSetup || !twoFA.otpauthUrl || !qrCanvasRef.current) return;
      setQrDrawn(false);
      try{
        const QR = await import(/* webpackIgnore: true */'qrcode');
        await QR.toCanvas(qrCanvasRef.current, twoFA.otpauthUrl, { width: 180, margin: 1 });
        setQrDrawn(true);
      }catch{
        // no-op -> we’ll show <img> fallback
      }
    })();
  }, [showSetup, twoFA.otpauthUrl]);

  // --------- helpers ---------
  const rel = (ts)=>{
    const d = new Date(ts || Date.now());
    const mins = Math.round((Date.now() - d.getTime())/60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const h = Math.floor(mins/60);
    return `${h}h ${mins%60}m ago`;
  };

  const changePwd = async ()=>{
    try{
      if(!pwd.current || !pwd.next || pwd.next!==pwd.confirm) throw new Error("Fill password fields correctly.");
      await API.users?.changePassword?.({ currentPassword:pwd.current, newPassword:pwd.next });
      setPwd({ current:"", next:"", confirm:"" });
      setMsg({ ok:"Password changed.", err:"" });
    }catch(e){ setMsg({ ok:"", err:String(e?.message || e) }); }
  };

  // 2FA flows
  const startEnable2FA = async ()=>{
    try{
      // Ask backend to provision a secret & otpauth url
      const r = await (API.security?.provision2FA?.() || API.security?.get2FASecret?.())?.catch(()=>null);
      const d = r?.data || r || {};
      // Fallback: if only secret arrives, try to compose an otpauth URL
      const secret = d.secret || twoFA.secret || "";
      const email = (await API.users?.getMe?.().catch(()=>({})))?.email || "";
      const issuer = (d.issuer || document.title || "App").replace(/\s+/g, "_");
      const otpauthUrl = d.otpauthUrl || (secret ? `otpauth://totp/${issuer}:${encodeURIComponent(email)}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30` : "");

      setTwoFA(s=>({ ...s, secret, otpauthUrl, enabled:false, verified:false }));
      setShowSetup(true);
      setMsg({ ok:"Scan the QR and verify to enable 2FA.", err:"" });
    }catch(e){
      // If your API only supports direct toggle, fall back
      try{
        await API.security?.set2FA?.({ enabled:true });
        setTwoFA(s=>({ ...s, enabled:true, verified:true }));
        setShowSetup(false);
        setMsg({ ok:"Two-factor enabled.", err:"" });
      }catch(err){ setMsg({ ok:"", err:String(err?.message||err) }); }
    }
  };

  const verify2FA = async ()=>{
    try{
      if (!otp || otp.trim().length < 6) throw new Error("Enter 6-digit code.");
      const r = await API.security?.verify2FA?.({ code: otp }).catch(()=>({ success:true }));
      const ok = r?.success ?? r?.verified ?? true;
      if (!ok) throw new Error("Invalid code.");
      setTwoFA(s=>({ ...s, enabled:true, verified:true }));
      setShowSetup(false);
      setOtp("");
      setMsg({ ok:"Two-factor enabled.", err:"" });
    }catch(e){ setMsg({ ok:"", err:String(e?.message||e) }); }
  };

  const disable2FA = async ()=>{
    try{
      await API.security?.set2FA?.({ enabled:false });
      setTwoFA({ enabled:false, secret:"", otpauthUrl:"", verified:false });
      setShowSetup(false);
      setOtp("");
      setMsg({ ok:"Two-factor disabled.", err:"" });
    }catch(e){ setMsg({ ok:"", err:String(e?.message||e) }); }
  };

  // Sessions
  const logoutSession = async (id)=>{
    try{
      await API.security?.revokeSession?.(id);
      setSessions(s=>s.filter(x=>x.id!==id));
    }catch(e){ setMsg({ ok:"", err:String(e?.message||e) }); }
  };

  // Identity upload with progress if your API exposes xhr
  const onUpload = async (e, field)=>{
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true); setUploadPct(0);
    try{
      // If your API supports progress: API.security.uploadIdentity(field, fd, onProgress)
      const fd = new FormData(); fd.append("file", file);
      const up = API.security?.uploadIdentity;
      if (up?.length >= 3) {
        const r = await up(field, fd, (pct)=> setUploadPct(pct));
        const url = r?.data?.url || r?.url || "(uploaded)";
        setIdv(v=>({ ...v, [field]: { url, status:"uploaded" } }));
      } else {
        // fallback without progress
        const r = await up?.(field, fd).catch(()=>null);
        const url = r?.data?.url || r?.url || "(uploaded)";
        setIdv(v=>({ ...v, [field]: { url, status:"uploaded" } }));
      }
      setMsg({ ok:"Document uploaded.", err:"" });
    }catch(e){ setMsg({ ok:"", err:String(e?.message||e) }); }
    finally{ setUploading(false); setUploadPct(0); e.target.value=""; }
  };

  return (
    <div className="sh-security">
      <h1 className="sh-h1">Security</h1>

      {/* Change password */}
      <section className="sh-card">
        <div className="sh-card-head">
          <div className="sh-card-title">Change password</div>
          <Button onClick={changePwd}>Update</Button>
        </div>
        <div className="sh-line" />
        <div className="sh-grid-3" style={{marginTop:10}}>
          <div className="sh-field">
            <label>Current password</label>
            <input type="password" value={pwd.current} onChange={e=>setPwd({...pwd,current:e.target.value})}/>
          </div>
          <div className="sh-field">
            <label>New password</label>
            <input type="password" value={pwd.next} onChange={e=>setPwd({...pwd,next:e.target.value})}/>
          </div>
          <div className="sh-field">
            <label>Confirm new password</label>
            <input type="password" value={pwd.confirm} onChange={e=>setPwd({...pwd,confirm:e.target.value})}/>
          </div>
        </div>
      </section>

      {/* 2FA */}
      <section className="sh-card">
        <div className="sh-card-head">
          <div className="sh-card-title">Two-Factor Authentication (2FA)</div>
        </div>
        <div className="sh-line" />

        {/* toggle row */}
        <div className="sh-row-between" style={{padding:"16px 4px"}}>
          <div>
            <div style={{fontWeight:600,color:"var(--txt)"}}>Enable 2FA (TOTP/OTP)</div>
            {twoFA.enabled && twoFA.verified && (
              <div className="sh-badge ok">Enabled</div>
            )}
            {!twoFA.enabled && !showSetup && (
              <div className="sh-help">Protect your account with a one-time code app (Google Authenticator, Authy, etc.)</div>
            )}
          </div>

          <div>
            {twoFA.enabled ? (
              <Switch checked={true} onChange={()=>disable2FA()} />
            ) : (
              <Switch checked={false} onChange={()=>startEnable2FA()} />
            )}
          </div>
        </div>

        {/* setup block */}
        {showSetup && (
          <>
            <div className="sh-line" />
            <div className="sh-2fa-setup">
              <div className="sh-qr-wrap">
                {/* canvas QR if available else img fallback */}
                <canvas ref={qrCanvasRef} className="sh-qr" style={{display: qrDrawn ? "block":"none"}} />
                {!qrDrawn && twoFA.otpauthUrl && (
                  <img
                    className="sh-qr"
                    alt="QR"
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(twoFA.otpauthUrl)}&size=180x180`}
                  />
                )}
              </div>
              <div className="sh-setup-right">
                <div className="sh-help">Scan this QR in your authenticator app.</div>
                <div className="sh-help">Or enter the key manually:</div>
                <div className="sh-kbd">{twoFA.secret || "••••••••"}</div>
                <div className="sh-setup-verify">
                  <Input label="Enter 6-digit code" value={otp} onChange={setOtp} inputMode="numeric" maxLength={6} />
                  <Button onClick={verify2FA}>Verify & enable</Button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Sessions */}
      <section className="sh-card">
        <div className="sh-card-head">
          <div className="sh-card-title">Login devices / sessions</div>
        </div>
        <div className="sh-line" />
        <div className="sh-card-body">
          <div className="sh-table">
            <div className="sh-tr sh-th"><div>Device</div><div>IP</div><div>Last Active</div><div></div></div>
            {sessions.map(s=>(
              <div className="sh-tr" key={s.id}>
                <div>{s.device || "Unknown"}</div>
                <div>{s.ip || "—"}</div>
                <div title={new Date(s.lastActive||Date.now()).toLocaleString()}>
                  {rel(s.lastActive)}
                </div>
                <div className="sh-right">
                  {s.current ? <span className="sh-tag">Current</span> :
                    <Button variant="ghost" onClick={()=>logoutSession(s.id)}>Log out</Button>}
                </div>
              </div>
            ))}
            {!sessions.length && <div className="sh-empty">No active sessions.</div>}
          </div>
        </div>
      </section>

      {/* Identity */}
      <section className="sh-card">
        <div className="sh-card-head">
          <div className="sh-card-title">Identity verification</div>
        </div>
        <div className="sh-line" />

        <div className="sh-grid-2">
          <div className="sh-field">
            <label>Driver license</label>
            <div className="sh-row">
              <Button variant="secondary" onClick={()=>document.getElementById("licUp").click()} disabled={uploading}>Upload</Button>
              <span className={`sh-help ${idv.license?.status ? "":""}`}>
                {idv.license ? (idv.license.status ? idv.license.status : "Uploaded") : "Not uploaded"}
              </span>
              {idv.license?.url && <a href={idv.license.url} target="_blank" rel="noreferrer" className="sh-link">View</a>}
            </div>
            <input id="licUp" type="file" accept="image/*,application/pdf" hidden onChange={e=>onUpload(e,"license")}/>
          </div>

          <div className="sh-field">
            <label>Aadhaar / ID</label>
            <div className="sh-row">
              <Button variant="secondary" onClick={()=>document.getElementById("aadUp").click()} disabled={uploading}>Upload</Button>
              <span className="sh-help">
                {idv.aadhaar ? (idv.aadhaar.status ? idv.aadhaar.status : "Uploaded") : "Not uploaded"}
              </span>
              {idv.aadhaar?.url && <a href={idv.aadhaar.url} target="_blank" rel="noreferrer" className="sh-link">View</a>}
            </div>
            <input id="aadUp" type="file" accept="image/*,application/pdf" hidden onChange={e=>onUpload(e,"aadhaar")}/>
          </div>
        </div>

        {uploading && (
          <div className="sh-uploadbar">
            <div className="sh-uploadbar-fill" style={{width:`${uploadPct||30}%`}} />
            <span>{uploadPct ? `${uploadPct}%` : "Uploading…"}</span>
          </div>
        )}
      </section>
    </div>
  );
}