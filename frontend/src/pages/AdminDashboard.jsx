// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useRef, useState } from 'react';
import API from '../services/api';
import './AdminDashboard.css';

/* =============================================================================
   Small utils
============================================================================= */
const useDebounced = (fn, ms = 450) => {
  const t = useRef();
  return (...args) => {
    clearTimeout(t.current);
    t.current = setTimeout(() => fn(...args), ms);
  };
};

const Pager = ({ page, limit, total, onPage, onLimit }) => {
  const pages = Math.max(1, Math.ceil((total || 0) / (limit || 10)));
  const canPrev = page > 1;
  const canNext = page < pages;
  return (
    <div className="adminx-pager">
      <div className="adminx-pager__left">
        <span className="adminx-muted">Rows</span>
        <select
          value={limit}
          onChange={(e) => onLimit(Number(e.target.value))}
          className="adminx-input adminx-input--sm"
          aria-label="rows per page"
        >
          {[10, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="adminx-pager__right">
        <button
          className="adminx-btn adminx-btn--ghost"
          disabled={!canPrev}
          onClick={() => onPage(page - 1)}
        >
          ‹ Prev
        </button>
        <span className="adminx-pager__label">
          Page <strong>{page}</strong> of <strong>{pages}</strong>
        </span>
        <button
          className="adminx-btn adminx-btn--ghost"
          disabled={!canNext}
          onClick={() => onPage(page + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
};

const Toolbar = ({ title, right }) => (
  <div className="adminx-toolbar">
    <div className="adminx-toolbar__left">
      <h2 className="adminx-title">{title}</h2>
    </div>
    <div className="adminx-toolbar__right">{right}</div>
  </div>
);

const Empty = ({ label = 'No data found.' }) => (
  <div className="adminx-empty">
    <div className="adminx-empty__circle">🚗</div>
    <div className="adminx-empty__text">{label}</div>
  </div>
);

/* Common cell helpers */
const CellNameId = ({ name, id }) => (
  <div className="adminx-cell" style={{minWidth:0}}>
    <div className="adminx-avatar">{(name || 'U').slice(0,1).toUpperCase()}</div>
    <div className="adminx-celltext">
      <div className="adminx-strong" title={name || '—'}>{name || '—'}</div>
      <div className="adminx-sub" title={id || ''}>{id || ''}</div>
    </div>
  </div>
);

const CellMono = ({ text, title }) => (
  <span className="adminx-mono adminx-trunc" title={title ?? text}>
    {text || '—'}
  </span>
);

/* =============================================================================
   Confirm Modals (Ban / Unban / Ride Cancel)
============================================================================= */
function BanConfirmModal({ user, open, onCancel, onConfirm, loading }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;

  return (
    <div className="adminx-modal" role="dialog" aria-modal="true" aria-labelledby="ban-title">
      <div className="adminx-modal__overlay" onClick={onCancel} />
      <div className="adminx-modal__card">
        <div className="adminx-modal__header">
          <div className="adminx-modal__icon">⚠️</div>
          <div>
            <h3 id="ban-title" className="adminx-modal__title">Ban this account?</h3>
            <p className="adminx-modal__sub">
              This will <strong>ban</strong> the user and they won’t be able to log in until unbanned.
            </p>
          </div>
        </div>
        <div className="adminx-modal__body">
          <div className="adminx-modal__row"><span className="adminx-muted">Name</span><span className="adminx-trunc">{user?.name || '—'}</span></div>
          <div className="adminx-modal__row"><span className="adminx-muted">Email</span><span className="adminx-mono adminx-trunc">{user?.email || '—'}</span></div>
          <div className="adminx-modal__row"><span className="adminx-muted">Role</span><span className="adminx-trunc">{user?.role || '—'}</span></div>
        </div>
        <div className="adminx-modal__footer">
          <button className="adminx-btn adminx-btn--ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="adminx-btn adminx-btn--danger" onClick={onConfirm} disabled={loading} title="Ban this user">
            {loading ? 'Banning…' : 'Ban user'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnbanConfirmModal({ user, open, onCancel, onConfirm, loading }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;

  return (
    <div className="adminx-modal" role="dialog" aria-modal="true" aria-labelledby="unban-title">
      <div className="adminx-modal__overlay" onClick={onCancel} />
      <div className="adminx-modal__card">
        <div className="adminx-modal__header">
          <div className="adminx-modal__icon adminx-modal__icon--ok">✅</div>
          <div>
            <h3 id="unban-title" className="adminx-modal__title">Unban this account?</h3>
            <p className="adminx-modal__sub">The user will be able to sign in again after unbanning.</p>
          </div>
        </div>
        <div className="adminx-modal__body">
          <div className="adminx-modal__row"><span className="adminx-muted">Name</span><span className="adminx-trunc">{user?.name || '—'}</span></div>
          <div className="adminx-modal__row"><span className="adminx-muted">Email</span><span className="adminx-mono adminx-trunc">{user?.email || '—'}</span></div>
          <div className="adminx-modal__row"><span className="adminx-muted">Current status</span><span className="adminx-trunc">Banned</span></div>
        </div>
        <div className="adminx-modal__footer">
          <button className="adminx-btn adminx-btn--ghost" onClick={onCancel} disabled={loading}>Keep banned</button>
          <button className="adminx-btn adminx-btn--ok" onClick={onConfirm} disabled={loading} title="Unban this user">
            {loading ? 'Unbanning…' : 'Unban user'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Tooltip chip for user details */
function NameWithTip({ name, email, phone }) {
  return (
    <span className="adminx-tip">
      <span className="adminx-chip">{name || '—'}</span>
      <span className="adminx-tip__card">
        <div className="adminx-tip__title">{name || '—'}</div>
        <div className="adminx-tip__row"><span>Username</span><strong>{name || '—'}</strong></div>
        <div className="adminx-tip__row"><span>Email</span><strong className="adminx-mono">{email || '—'}</strong></div>
        <div className="adminx-tip__row"><span>Phone</span><strong className="adminx-mono">{phone || '—'}</strong></div>
      </span>
    </span>
  );
}

/* Cancel ride modal (includes Published by + Booked by) */
function RideCancelModal({ ride, passengers, open, onCancel, onConfirm, loading }) {
  const [reason, setReason] = useState('safety');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  useEffect(() => { if (open) setReason('safety'); }, [open]);

  if (!open) return null;

  const route = `${ride?.startLocation?.name || '—'} → ${ride?.endLocation?.name || '—'}`;
  const dep   = ride?.departureTime ? new Date(ride.departureTime).toLocaleString() : '—';
  const publisher = ride?.driver?.name || '—';

  return (
    <div className="adminx-modal" role="dialog" aria-modal="true" aria-labelledby="ride-cancel-title">
      <div className="adminx-modal__overlay" onClick={onCancel} />
      <div className="adminx-modal__card">
        <div className="adminx-modal__header">
          <div className="adminx-modal__icon adminx-modal__icon--warn">🛑</div>
          <div>
            <h3 id="ride-cancel-title" className="adminx-modal__title">Cancel this ride?</h3>
            <p className="adminx-modal__sub">
              This will <strong>cancel</strong> the ride for all passengers. Any related bookings will be marked accordingly.
            </p>
          </div>
        </div>

        <div className="adminx-modal__body">
          <div className="adminx-modal__row"><span className="adminx-muted">Route</span><span className="adminx-trunc" title={route}>{route}</span></div>
          <div className="adminx-modal__row"><span className="adminx-muted">Published by</span><span className="adminx-trunc">{publisher}</span></div>
          <div className="adminx-modal__row"><span className="adminx-muted">Departure</span><span className="adminx-trunc">{dep}</span></div>

          <div className="adminx-modal__row adminx-modal__row--stack">
            <span className="adminx-muted">Booked by</span>
            {passengers?.length ? (
              <div className="adminx-chipline">
                {passengers.map(p => (
                  <NameWithTip key={p._id || p.email || p.name} name={p.name} email={p.email} phone={p.phone} />
                ))}
              </div>
            ) : <span className="adminx-sub">No bookings</span>}
          </div>

          <div className="adminx-modal__row adminx-modal__row--stack">
            <label htmlFor="cancel-reason" className="adminx-muted">Reason</label>
            <input
              id="cancel-reason"
              className="adminx-input"
              placeholder="e.g., safety, policy violation, duplicate, etc."
              value={reason}
              onChange={(e)=>setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="adminx-modal__footer">
          <button className="adminx-btn adminx-btn--ghost" onClick={onCancel} disabled={loading}>Keep ride</button>
          <button className="adminx-btn adminx-btn--danger" onClick={() => onConfirm(reason || 'safety')} disabled={loading} title="Cancel this ride">
            {loading ? 'Cancelling…' : 'Cancel ride'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   Users Tab (unchanged features)
============================================================================= */
function UsersTab() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);

  const [banOpen, setBanOpen] = useState(false);
  const [banUser, setBanUser] = useState(null);
  const [banLoading, setBanLoading] = useState(false);

  const [unbanOpen, setUnbanOpen] = useState(false);
  const [unbanUser, setUnbanUser] = useState(null);
  const [unbanLoading, setUnbanLoading] = useState(false);

  const debouncedReload = useDebounced(load, 450);

  async function load({ keepPage } = {}) {
    setBusy(true);
    try {
      const r = await API.admin.listUsers({ q, page: keepPage ? page : 1, limit });
      setRows(r.docs || []);
      setTotal(r.total || 0);
      if (!keepPage) setPage(1);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { debouncedReload({ keepPage: false }); /* eslint-disable-next-line */ }, [q, limit]);
  useEffect(() => { load({ keepPage: true }); /* eslint-disable-next-line */ }, [page]);

  const openBanModal = (u) => { setBanUser(u); setBanOpen(true); };
  const closeBanModal = () => { setBanLoading(false); setBanOpen(false); setBanUser(null); };
  const confirmBan = async () => {
    if (!banUser) return;
    setBanLoading(true);
    try {
      await API.admin.ban(banUser._id, 'policy');
      await load({ keepPage: true });
      closeBanModal();
    } catch (e) {
      setBanLoading(false);
      alert(e?.message || 'Failed to ban user');
    }
  };

  const openUnbanModal = (u) => { setUnbanUser(u); setUnbanOpen(true); };
  const closeUnbanModal = () => { setUnbanLoading(false); setUnbanOpen(false); setUnbanUser(null); };
  const confirmUnban = async () => {
    if (!unbanUser) return;
    setUnbanLoading(true);
    try {
      await API.admin.unban(unbanUser._id, {});
      await load({ keepPage: true });
      closeUnbanModal();
    } catch (e) {
      setUnbanLoading(false);
      alert(e?.message || 'Failed to unban user');
    }
  };

  return (
    <div className="adminx-card">
      <Toolbar
        title="Users"
        right={
          <div className="adminx-fieldset">
            <input className="adminx-input" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="adminx-btn" onClick={() => load()}>Search</button>
          </div>
        }
      />

      <div className="adminx-tablewrap">
        <table className="adminx-table adminx-table--fixed">
          <colgroup>
            <col style={{width:'360px'}} />
            <col style={{width:'360px'}} />
            <col style={{width:'160px'}} />
            <col style={{width:'140px'}} />
            <col style={{width:'160px'}} />
          </colgroup>
          <thead>
            <tr>
              <th>Name / ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {busy ? (
              <tr><td colSpan="5" className="adminx-loading">Loading…</td></tr>
            ) : rows.length ? rows.map(u => (
              <tr key={u._id}>
                <td><CellNameId name={u.name} id={u._id} /></td>
                <td><CellMono text={u.email} /></td>
                <td>
                  <select
                    defaultValue={u.role}
                    className="adminx-input adminx-input--sm adminx-w-full"
                    onChange={async (e) => { await API.admin.setRole(u._id, e.target.value); load({ keepPage: true }); }}
                  >
                    <option>user</option>
                    <option>driver</option>
                    <option>admin</option>
                    <option>superadmin</option>
                  </select>
                </td>
                <td>
                  <span className={`adminx-badge ${u.isBanned ? 'adminx-badge--danger' : 'adminx-badge--ok'}`}>
                    {u.isBanned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td>
                  {u.isBanned ? (
                    <button className="adminx-btn adminx-btn--ghost adminx-w-full" onClick={() => openUnbanModal(u)}>Unban</button>
                  ) : (
                    <button className="adminx-btn adminx-btn--danger adminx-w-full" onClick={() => openBanModal(u)}>Ban</button>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5"><Empty label="No users found." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} limit={limit} total={total} onPage={setPage} onLimit={(n)=>{ setLimit(n); setPage(1); }} />

      <BanConfirmModal user={banUser} open={banOpen} onCancel={closeBanModal} onConfirm={confirmBan} loading={banLoading} />
      <UnbanConfirmModal user={unbanUser} open={unbanOpen} onCancel={closeUnbanModal} onConfirm={confirmUnban} loading={unbanLoading} />
    </div>
  );
}

/* =============================================================================
   KYC Tab (unchanged features)
============================================================================= */
function KycTab() {
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);

  async function load({ keepPage } = {}) {
    setBusy(true);
    try {
      const r = await API.admin.listKyc({ status, page: keepPage ? page : 1, limit });
      setRows(r.docs || []);
      setTotal(r.total || 0);
      if (!keepPage) setPage(1);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, limit]);
  useEffect(() => { load({ keepPage: true }); /* eslint-disable-next-line */ }, [page]);

  return (
    <div className="adminx-card">
      <Toolbar
        title="KYC & Verification"
        right={
          <div className="adminx-fieldset">
            <select className="adminx-input" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="adminx-btn" onClick={() => load()}>Refresh</button>
          </div>
        }
      />

      <div className="adminx-tablewrap">
        <table className="adminx-table adminx-table--fixed">
          <colgroup>
            <col style={{width:'360px'}} />
            <col style={{width:'420px'}} />
            <col style={{width:'220px'}} />
            <col style={{width:'200px'}} />
          </colgroup>
          <thead>
            <tr>
              <th>User</th>
              <th>Documents</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {busy ? (
              <tr><td colSpan="4" className="adminx-loading">Loading…</td></tr>
            ) : rows.length ? rows.map(k => (
              <tr key={k._id}>
                <td><CellNameId name={k.user?.name} id={k.user?.email} /></td>
                <td><span className="adminx-trunc" title={(k.documents||[]).map(d=>d.label).join(', ')}>{(k.documents || []).map(d => d.label).join(', ') || '—'}</span></td>
                <td className="adminx-sub"><span className="adminx-trunc" title={new Date(k.updatedAt || k.createdAt).toString()}>{new Date(k.updatedAt || k.createdAt).toLocaleString()}</span></td>
                <td>
                  <div className="adminx-actions">
                    <button className="adminx-btn adminx-btn--ok adminx-w-half" disabled={status === 'approved'} onClick={async()=>{ await API.admin.reviewKyc(k._id,{ status:'approved' }); load({ keepPage: true }); }}>Approve</button>
                    <button className="adminx-btn adminx-btn--danger adminx-w-half" disabled={status === 'rejected'} onClick={async()=>{ await API.admin.reviewKyc(k._id,{ status:'rejected', note:'Blurry/Invalid ID' }); load({ keepPage: true }); }}>Reject</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4"><Empty label="No records for this status." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} limit={limit} total={total} onPage={setPage} onLimit={(n)=>{ setLimit(n); setPage(1); }} />
    </div>
  );
}

/* =============================================================================
   Rides Tab (unchanged behavior, with inline "Booked by")
============================================================================= */
function RidesTab() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);

  // per-ride passengers cache
  const [passengersByRide, setPassengersByRide] = useState({});
  const [loadingPassengers, setLoadingPassengers] = useState({});

  // cancel modal
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelRide, setCancelRide] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const debouncedReload = useDebounced(load, 450);

  async function load({ keepPage } = {}) {
    setBusy(true);
    try {
      const r = await API.admin.listRides({ q, page: keepPage ? page : 1, limit });
      setRows(r.docs || []);
      setTotal(r.total || 0);
      if (!keepPage) setPage(1);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { debouncedReload({ keepPage: false }); /* eslint-disable-next-line */ }, [q, limit]);
  useEffect(() => { load({ keepPage: true }); /* eslint-disable-next-line */ }, [page]);

  const fetchPassengers = async (rideId) => {
    if (!rideId) return;
    if (passengersByRide[rideId] || loadingPassengers[rideId]) return;
    setLoadingPassengers(prev => ({ ...prev, [rideId]: true }));
    try {
      const res = await API.rides.getRideDetails(rideId);
      const ride = res?.ride;
      const pax = (ride?.bookings || []).map(b => ({
        _id: b?.passenger?._id || b?._id,
        name: b?.passenger?.name || '—',
        email: b?.passenger?.email,
        phone: b?.passenger?.phone
      }));
      setPassengersByRide(prev => ({ ...prev, [rideId]: pax }));
    } catch {
      setPassengersByRide(prev => ({ ...prev, [rideId]: [] }));
    } finally {
      setLoadingPassengers(prev => ({ ...prev, [rideId]: false }));
    }
  };

  const openCancelModal = async (ride) => {
    setCancelRide(ride);
    await fetchPassengers(ride._id);
    setCancelOpen(true);
  };
  const closeCancelModal = () => { setCancelLoading(false); setCancelOpen(false); setCancelRide(null); };
  const confirmCancel = async (reason) => {
    if (!cancelRide) return;
    setCancelLoading(true);
    try {
      await API.admin.cancelRide(cancelRide._id, reason || 'safety');
      await load({ keepPage: true });
      closeCancelModal();
    } catch (e) {
      setCancelLoading(false);
      alert(e?.message || 'Failed to cancel ride');
    }
  };

  const BookedByInline = ({ rideId }) => {
    const pax = passengersByRide[rideId];
    const loading = loadingPassengers[rideId];
    const onEnter = () => fetchPassengers(rideId);

    if (loading && !pax) return <span className="adminx-sub">Loading…</span>;
    if (!pax) return <span onMouseEnter={onEnter} className="adminx-sub adminx-linklike">Hover to load</span>;
    if (!pax.length) return <span className="adminx-sub">No bookings</span>;

    const shown = pax.slice(0, 3);
    const rest = pax.length - shown.length;

    return (
      <div className="adminx-chipline" onMouseEnter={onEnter}>
        {shown.map(p => <NameWithTip key={p._id || p.email || p.name} name={p.name} email={p.email} phone={p.phone} />)}
        {rest > 0 && <span className="adminx-more">+{rest}</span>}
      </div>
    );
  };

  return (
    <div className="adminx-card">
      <Toolbar
        title="Rides"
        right={
          <div className="adminx-fieldset">
            <input className="adminx-input" placeholder="Filter by From / To…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="adminx-btn" onClick={() => load()}>Search</button>
          </div>
        }
      />

      <div className="adminx-tablewrap">
        <table className="adminx-table adminx-table--fixed">
          <colgroup>
            <col style={{width:'520px'}} />
            <col style={{width:'240px'}} />
            <col style={{width:'160px'}} />
            <col style={{width:'160px'}} />
            <col style={{width:'180px'}} />
          </colgroup>
          <thead>
            <tr>
              <th>Route / Published by / Booked by</th>
              <th>Departure</th>
              <th>Price/Seat</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {busy ? (
              <tr><td colSpan="5" className="adminx-loading">Loading…</td></tr>
            ) : rows.length ? rows.map(r => (
              <tr key={r._id}>
                <td>
                  <div className="adminx-strong adminx-trunc" title={`${r?.startLocation?.name || ''} → ${r?.endLocation?.name || ''}`}>
                    {r?.startLocation?.name} → {r?.endLocation?.name}
                  </div>
                  <div className="adminx-sub adminx-trunc" title={r?.driver?.name ? `Published by: ${r.driver.name}` : 'Published by: —'}>
                    Published by: {r?.driver?.name || '—'}
                  </div>
                  <BookedByInline rideId={r._id} />
                </td>
                <td className="adminx-sub">
                  <span className="adminx-trunc" title={new Date(r.departureTime).toString()}>
                    {new Date(r.departureTime).toLocaleString()}
                  </span>
                </td>
                <td>₹{r.pricePerSeat}</td>
                <td>
                  <span className={`adminx-badge ${r.status === 'cancelled' ? 'adminx-badge--danger' : 'adminx-badge--ok'}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <button
                    className="adminx-btn adminx-btn--danger adminx-w-full"
                    disabled={r.status === 'cancelled'}
                    onClick={() => openCancelModal(r)}
                    onMouseEnter={() => fetchPassengers(r._id)}
                  >
                    Cancel ride
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5"><Empty label="No rides found." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} limit={limit} total={total} onPage={setPage} onLimit={(n)=>{ setLimit(n); setPage(1); }} />

      <RideCancelModal
        ride={cancelRide}
        passengers={cancelRide ? (passengersByRide[cancelRide._id] || []) : []}
        open={cancelOpen}
        onCancel={closeCancelModal}
        onConfirm={confirmCancel}
        loading={cancelLoading}
      />
    </div>
  );
}

/* =============================================================================
   Payouts Tab (UPGRADED — filters, stats, export, bulk, details modal)
============================================================================= */
function PayoutDetailsModal({ row, open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !row) return null;

  const line = (label, value, mono) => (
    <div className="adminx-modal__row">
      <span className="adminx-muted">{label}</span>
      <span className={mono ? 'adminx-mono adminx-trunc' : 'adminx-trunc'} title={String(value ?? '—')}>
        {value ?? '—'}
      </span>
    </div>
  );

  return (
    <div className="adminx-modal" role="dialog" aria-modal="true" aria-labelledby="payout-details-title">
      <div className="adminx-modal__overlay" onClick={onClose} />
      <div className="adminx-modal__card">
        <div className="adminx-modal__header">
          <div className="adminx-modal__icon adminx-modal__icon--ok">💸</div>
          <div>
            <h3 id="payout-details-title" className="adminx-modal__title">Payout Details</h3>
            <p className="adminx-modal__sub">Inspect the payout request and destination.</p>
          </div>
        </div>
        <div className="adminx-modal__body">
          {line('User', row?.user?.name)}
          {line('Email', row?.user?.email, true)}
          {line('Amount', `₹${row?.amount}`)}
          {line('Status', row?.status)}
          {line('Method', row?.method || row?.paymentMethod)}
          {line('Reference ID', row?.referenceId || row?.transactionId, true)}
          {line('Requested at', row?.createdAt ? new Date(row.createdAt).toLocaleString() : '—')}
          {line('Updated at', row?.updatedAt ? new Date(row.updatedAt).toLocaleString() : '—')}
          {line('Account (UPI)', row?.account?.upi || row?.upi)}
          {line('Account (Bank)', row?.account?.bank ? `${row.account.bank.ifsc || ''} • ${row.account.bank.accLast4 || ''}` : undefined)}
          {line('Note', row?.note)}
        </div>
        <div className="adminx-modal__footer">
          <button className="adminx-btn adminx-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function PayoutsTab() {
  // Filters/state
  const [status, setStatus] = useState('requested');
  const [method, setMethod] = useState('all');   // upi / bank / paypal / stripe / all
  const [q, setQ] = useState('');                // user name/email search
  const [from, setFrom] = useState('');          // yyyy-mm-dd
  const [to, setTo] = useState('');              // yyyy-mm-dd

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);

  // selection for bulk actions
  const [selected, setSelected] = useState({}); // id -> true
  const allOnPageChecked = rows.length > 0 && rows.every(r => selected[r._id]);
  const anySelected = Object.values(selected).some(Boolean);

  // details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRow, setDetailsRow] = useState(null);

  async function load({ keepPage } = {}) {
    setBusy(true);
    try {
      const payload = {
        status,
        page: keepPage ? page : 1,
        limit,
      };
      // Pass optional filters (backend can ignore safely)
      if (q) payload.q = q;
      if (method && method !== 'all') payload.method = method;
      if (from) payload.from = from; // ISO date (yyyy-mm-dd)
      if (to) payload.to = to;

      const r = await API.admin.listPayouts(payload);
      setRows(r.docs || []);
      setTotal(r.total || 0);
      if (!keepPage) setPage(1);
      // clear selections when data refreshes
      setSelected({});
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, method, limit]);
  useEffect(() => { load({ keepPage: true }); /* eslint-disable-next-line */ }, [page]);

  const debouncedSearch = useDebounced(() => load(), 400);

  const toggleAllOnPage = () => {
    if (allOnPageChecked) {
      const clone = { ...selected };
      rows.forEach(r => { delete clone[r._id]; });
      setSelected(clone);
    } else {
      const clone = { ...selected };
      rows.forEach(r => { clone[r._id] = true; });
      setSelected(clone);
    }
  };

  const toggleOne = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const mark = async (id, nextStatus, note) => {
    await API.admin.markPayout(id, note ? { status: nextStatus, note } : { status: nextStatus });
  };

  const bulkMark = async (nextStatus) => {
    const ids = rows.map(r => r._id).filter(id => selected[id]);
    if (!ids.length) return;
    const confirmText = nextStatus === 'paid'
      ? `Mark ${ids.length} payout(s) as PAID?`
      : `Mark ${ids.length} payout(s) as FAILED?`;
    if (!window.confirm(confirmText)) return;
    for (const id of ids) {
      try { await mark(id, nextStatus, nextStatus === 'failed' ? 'Bulk fail' : undefined); }
      catch (e) { /* continue others */ }
    }
    await load({ keepPage: true });
  };

  const exportCsv = () => {
    // Export the currently displayed rows (page) to CSV
    const headers = ['User Name','User Email','Amount','Status','Method','ReferenceId','RequestedAt','UpdatedAt'];
    const lines = rows.map(p => ([
      p?.user?.name ?? '',
      p?.user?.email ?? '',
      p?.amount ?? '',
      p?.status ?? '',
      (p?.method || p?.paymentMethod || ''),
      (p?.referenceId || p?.transactionId || ''),
      p?.createdAt ? new Date(p.createdAt).toISOString() : '',
      p?.updatedAt ? new Date(p.updatedAt).toISOString() : ''
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `payouts_${status}_${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  // Quick stats from current page (server-wide stats would require API—keeping client-only here)
  const totalAmount = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const countPaid = rows.filter(r => r.status === 'paid').length;
  const countFailed = rows.filter(r => r.status === 'failed').length;

  return (
    <div className="adminx-card">
      <Toolbar
        title="Payouts"
        right={
          <div className="adminx-fieldset">
            <select className="adminx-input" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
            <select className="adminx-input" value={method} onChange={e=>setMethod(e.target.value)}>
              <option value="all">All methods</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
            </select>
            <input className="adminx-input" placeholder="Search name/email…" value={q}
                   onChange={(e)=>{ setQ(e.target.value); debouncedSearch(); }} />
            <input className="adminx-input adminx-input--sm" type="date" value={from} onChange={e=>{ setFrom(e.target.value); debouncedSearch(); }} />
            <input className="adminx-input adminx-input--sm" type="date" value={to} onChange={e=>{ setTo(e.target.value); debouncedSearch(); }} />
            <button className="adminx-btn" onClick={() => load()}>Apply</button>
            <button className="adminx-btn adminx-btn--ghost" onClick={()=>{ setQ(''); setMethod('all'); setFrom(''); setTo(''); load(); }}>Reset</button>
            <button className="adminx-btn" onClick={exportCsv} title="Export current page as CSV">Export CSV</button>
          </div>
        }
      />

      {/* Quick stats bar */}
      <div className="adminx-paystats">
        <div className="adminx-paystat">
          <div className="adminx-paystat__label">Total Amount (page)</div>
          <div className="adminx-paystat__value">₹{totalAmount.toLocaleString()}</div>
        </div>
        <div className="adminx-paystat">
          <div className="adminx-paystat__label">Paid (page)</div>
          <div className="adminx-paystat__value">{countPaid}</div>
        </div>
        <div className="adminx-paystat">
          <div className="adminx-paystat__label">Failed (page)</div>
          <div className="adminx-paystat__value">{countFailed}</div>
        </div>
        <div className="adminx-paystat">
          <div className="adminx-paystat__label">Requests (page)</div>
          <div className="adminx-paystat__value">{rows.length}</div>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="adminx-paybulk">
        <div className="adminx-sub">Bulk actions on selected</div>
        <div className="adminx-actions">
          <button className="adminx-btn adminx-btn--ok" disabled={!anySelected} onClick={()=>bulkMark('paid')}>Mark Paid</button>
          <button className="adminx-btn adminx-btn--danger" disabled={!anySelected} onClick={()=>bulkMark('failed')}>Mark Failed</button>
        </div>
      </div>

      <div className="adminx-tablewrap">
        <table className="adminx-table adminx-table--fixed">
          <colgroup>
            <col style={{width:'46px'}} />
            <col style={{width:'380px'}} />
            <col style={{width:'140px'}} />
            <col style={{width:'160px'}} />
            <col style={{width:'130px'}} />
            <col style={{width:'180px'}} />
            <col style={{width:'230px'}} />
          </colgroup>
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={allOnPageChecked} onChange={toggleAllOnPage} aria-label="select all" />
              </th>
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {busy ? (
              <tr><td colSpan="7" className="adminx-loading">Loading…</td></tr>
            ) : rows.length ? rows.map(p => (
              <tr key={p._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!selected[p._id]}
                    onChange={()=>toggleOne(p._id)}
                    aria-label={`select ${p?.user?.name || p._id}`}
                  />
                </td>
                <td>
                  <CellNameId name={p.user?.name} id={p.user?.email} />
                  {(p.referenceId || p.transactionId) && (
                    <div className="adminx-sub adminx-mono adminx-trunc" title={`Ref: ${p.referenceId || p.transactionId}`}>
                      Ref: {p.referenceId || p.transactionId}
                    </div>
                  )}
                </td>
                <td className="adminx-strong">₹{p.amount}</td>
                <td><span className="adminx-badge">{p.method || p.paymentMethod || '—'}</span></td>
                <td>
                  <span className={`adminx-badge ${
                    p.status === 'failed' ? 'adminx-badge--danger' :
                    p.status === 'paid' ? 'adminx-badge--ok' :
                    'adminx-badge--warn'
                  }`}>{p.status}</span>
                </td>
                <td className="adminx-sub">
                  <span className="adminx-trunc" title={new Date(p.updatedAt || p.createdAt).toString()}>
                    {new Date(p.updatedAt || p.createdAt).toLocaleString()}
                  </span>
                </td>
                <td>
                  <div className="adminx-actions">
                    <button
                      className="adminx-btn adminx-btn--ghost"
                      onClick={()=>{ setDetailsRow(p); setDetailsOpen(true); }}
                    >
                      View
                    </button>
                    <button
                      className="adminx-btn adminx-btn--ok"
                      disabled={p.status === 'paid'}
                      onClick={async()=>{ await API.admin.markPayout(p._id,{ status:'paid' }); load({ keepPage: true }); }}
                    >
                      Mark Paid
                    </button>
                    <button
                      className="adminx-btn adminx-btn--danger"
                      disabled={p.status === 'failed'}
                      onClick={async()=>{ await API.admin.markPayout(p._id,{ status:'failed', note:'Admin mark' }); load({ keepPage: true }); }}
                    >
                      Fail
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7"><Empty label="No payouts in this filter." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} limit={limit} total={total} onPage={setPage} onLimit={(n)=>{ setLimit(n); setPage(1); }} />

      <PayoutDetailsModal row={detailsRow} open={detailsOpen} onClose={()=>{ setDetailsOpen(false); setDetailsRow(null); }} />
    </div>
  );
}

/* =============================================================================
   Root Admin Dashboard (unchanged structure)
============================================================================= */
export default function AdminDashboard() {
  const [tab, setTab] = useState('users');

  const TabBtn = ({ id, label, icon }) => (
    <button className={`adminx-tab ${tab === id ? 'is-active' : ''}`} onClick={() => setTab(id)}>
      <span className="adminx-tab__icon" aria-hidden>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="adminx-wrap adminx-fullscreen">
      <header className="adminx-hero">
        <div className="adminx-hero__title">Admin Dashboard</div>
        <div className="adminx-hero__sub">Manage users, KYC, rides, and payouts with control.</div>
      </header>

      <div className="adminx-tabs">
        <TabBtn id="users" label="Users" icon="👥" />
        <TabBtn id="kyc" label="KYC" icon="🪪" />
        <TabBtn id="rides" label="Rides" icon="🚘" />
        <TabBtn id="payouts" label="Payouts" icon="💸" />
      </div>

      <main className="adminx-grid">
        {tab === 'users' && <UsersTab />}
        {tab === 'kyc' && <KycTab />}
        {tab === 'rides' && <RidesTab />}
        {tab === 'payouts' && <PayoutsTab />}
      </main>
    </div>
  );
}
