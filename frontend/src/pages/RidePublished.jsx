import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import EnhancedMap from '../components/maps/EnhancedMap';
import API from '../services/api';
import './OfferRides.css'; // reuse the same look & feel as OfferRides

const RidePublished = ({ user, onLogout }) => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the ride you just created
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await API.rides.getRideDetails(rideId);
        if (mounted && res?.success) setRide(res.ride);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [rideId]);

  const mapCenter = useMemo(() => {
    if (ride?.startLocation?.lat && ride?.startLocation?.lng) {
      return { lat: ride.startLocation.lat, lng: ride.startLocation.lng };
    }
    return { lat: 20.5937, lng: 78.9629 }; // India center fallback
  }, [ride]);

  const origin = ride ? { lat: ride.startLocation?.lat, lng: ride.startLocation?.lng } : null;
  const destination = ride ? { lat: ride.endLocation?.lat, lng: ride.endLocation?.lng } : null;
  const viaPoints = (ride?.viaLocations || []).map(v => ({ lat: v.lat, lng: v.lng }));

  const handleFindPassengers = () => {
    if (!ride) return;
    const qp = new URLSearchParams({
      from: ride.startLocation?.address || ride.startLocation?.name || '',
      to: ride.endLocation?.address || ride.endLocation?.name || '',
      date: new Date(ride.departureTime).toISOString().slice(0,10),
      passengers: '1',
      fromLat: String(ride.startLocation?.lat),
      fromLng: String(ride.startLocation?.lng),
      toLat: String(ride.endLocation?.lat),
      toLng: String(ride.endLocation?.lng),
      trustCoordinates: 'true',
    });
    if (ride.viaLocations?.[0]) {
      qp.set('via', ride.viaLocations[0].address || ride.viaLocations[0].name || '');
      qp.set('viaLat', String(ride.viaLocations[0].lat));
      qp.set('viaLng', String(ride.viaLocations[0].lng));
    }
    navigate(`/find-ride?${qp.toString()}`);
  };

  const handleGoDashboard = () => navigate('/dashboard');

  if (loading) {
    return (
      <div className="offer-ride-page">
        <header className="ride-navbar-modern">
          <div className="navbar-container">
            <div className="navbar-brand">
              <span className="brand-icon">🚗</span>
              <span>Ride Published</span>
            </div>
          </div>
        </header>

        <main className="offer-ride-main">
          <div className="offer-ride-card center">
            <div className="loader" />
            <h3>Preparing your ride details…</h3>
            <p>Fetching route and schedule</p>
          </div>
        </main>
        <StyleBridge />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="offer-ride-page">
        <header className="ride-navbar-modern">
          <div className="navbar-container">
            <div className="navbar-brand">
              <span className="brand-icon">🚗</span>
              <span>Ride Published</span>
            </div>
          </div>
        </header>

        <main className="offer-ride-main">
          <div className="offer-ride-card center">
            <div className="emoji">😕</div>
            <h3>We couldn’t find that ride</h3>
            <button className="publish-btn" onClick={() => navigate('/offer-ride')}>
              Create a new ride
            </button>
          </div>
        </main>
        <StyleBridge />
      </div>
    );
  }

  const depart = new Date(ride.departureTime);
  const arrive = new Date(depart.getTime() + (ride.duration || 0) * 60000);

  return (
    <div className="offer-ride-page">
      {/* Top nav styled like other OfferRides pages */}
      <header className="ride-navbar-modern">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">🚗</span>
            <span>Ride Published</span>
            <span className="chip">ID: {String(ride._id).slice(-6).toUpperCase()}</span>
          </div>
          <div className="navbar-actions">
            <div className="user-welcome">
              <span className="welcome-text">Welcome</span>
              <span className="user-name">{user?.name || 'You'}</span>
            </div>
            <button className="logout-btn-modern" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="offer-ride-main">
        {/* Same container & layout pattern as OfferRides steps */}
        <div className="form-container-enhanced">
          <div className="form-layout">
            {/* LEFT: review + summary (two-column inside left, like your review step) */}
            <section className="form-section">
              <div className="step-header">
                <h2>🎉 Your ride is live</h2>
                <p>Share this with passengers or let us match for you.</p>
              </div>

              <div className="review-grid">
                {/* Main details */}
                <div className="review-section">
                  {/* Start → Via → End chips */}
                  <div className="rp-route">
                    <div className="dot start" />
                    <div className="loc">{ride.startLocation?.name}</div>
                    {(ride.viaLocations || []).map((v, i) => (
                      <React.Fragment key={i}>
                        <div className="dot via" />
                        <div className="loc">{v?.name}</div>
                      </React.Fragment>
                    ))}
                    <div className="dot end" />
                    <div className="loc">{ride.endLocation?.name}</div>
                  </div>

                  {/* Distance / Duration / Price / Seats */}
                  <div className="route-stats" style={{ marginTop: '1rem' }}>
                    <div className="stat">
                      <span className="stat-value">{ride.distance ?? '--'} km</span>
                      <span className="stat-label">Distance</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {Math.floor((ride.duration ?? 0)/60)}h {(ride.duration ?? 0)%60}m
                      </span>
                      <span className="stat-label">Duration</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">₹{ride.pricePerSeat}</span>
                      <span className="stat-label">Price / seat</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{ride.availableSeats}/{ride.totalSeats}</span>
                      <span className="stat-label">Seats</span>
                    </div>
                  </div>

                  {/* Preview card */}
                  <div className="ride-preview" style={{ marginTop: '1rem' }}>
                    <div className="preview-details"><b>Departure:</b> {depart.toLocaleString()}</div>
                    <div className="preview-details"><b>Arrival (est.):</b> {arrive.toLocaleString()}</div>
                    <div className="preview-details"><b>Driver:</b> {ride.driver?.name || 'You'}</div>
                    <div className="preview-details">
                      <b>Vehicle:</b> {ride.vehicle?.model} • {ride.vehicle?.plateNumber} • {ride.vehicle?.type}
                    </div>

                    {Array.isArray(ride.vehicle?.amenities) && ride.vehicle.amenities.length > 0 && (
                      <div className="preview-amenities" style={{ marginTop: '0.5rem' }}>
                        {ride.vehicle.amenities.map((a, i) => (
                          <span key={i} className="preview-amenity">{a}</span>
                        ))}
                      </div>
                    )}

                    {ride.description && (
                      <div className="preview-more" style={{ marginTop: '0.5rem' }}>
                        {ride.description}
                      </div>
                    )}
                  </div>

                  {/* Actions styled as your form nav */}
                  <div className="form-navigation">
                    <div className="nav-spacer" />
                    <button className="publish-btn" onClick={handleFindPassengers}>Find passengers</button>
                    <button className="prev-btn" onClick={handleGoDashboard}>Go to Dashboard</button>
                  </div>
                </div>

                {/* Summary list (right column of review grid) */}
                <aside className="summary-section">
                  <h4>Ride Summary</h4>
                  <div className="summary-list">
                    <div className="summary-item">
                      <span className="summary-icon">🗓</span>
                      <div>
                        <div className="summary-label">Schedule</div>
                        <div className="summary-value">{depart.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="summary-item">
                      <span className="summary-icon">🚗</span>
                      <div>
                        <div className="summary-label">Vehicle</div>
                        <div className="summary-value">
                          {ride.vehicle?.model || '-'} — {ride.vehicle?.type || '-'}
                        </div>
                      </div>
                    </div>

                    <div className="summary-item">
                      <span className="summary-icon">💵</span>
                      <div>
                        <div className="summary-label">Pricing</div>
                        <div className="summary-value">
                          ₹{ride.pricePerSeat} per seat • {ride.availableSeats} seats
                        </div>
                      </div>
                    </div>

                    {ride.paymentMethods?.length ? (
                      <div className="summary-item">
                        <span className="summary-icon">💳</span>
                        <div>
                          <div className="summary-label">Payment</div>
                          <div className="summary-value">
                            {ride.paymentMethods.join(', ')}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray(ride.vehicle?.amenities) && ride.vehicle.amenities.length > 0 && (
                      <div className="summary-item">
                        <span className="summary-icon">✨</span>
                        <div>
                          <div className="summary-label">Amenities</div>
                          <div className="summary-value">
                            {ride.vehicle.amenities.join(', ')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </section>

            {/* RIGHT: map (same as other steps) */}
            <aside className="map-section">
              <EnhancedMap
                rides={[]}
                selectedRide={null}
                onRideSelect={() => {}}
                center={mapCenter}
                origin={origin}
                destination={destination}
                viaPoints={viaPoints}
                showDirections={Boolean(origin && destination)}
              />
            </aside>
          </div>
        </div>
      </main>

      <StyleBridge />
    </div>
  );
};

/**
 * Tiny bridge styles ONLY for elements not covered in OfferRides.css,
 * so we don’t change your global theme. Improves the bottom buttons & info block look.
 */
const StyleBridge = () => (
  <style>{`
    .center { display:grid; place-items:center; text-align:center; padding:2rem; }
    .loader {
      width: 28px; height: 28px; border: 3px solid transparent;
      border-top-color: currentColor; border-radius: 50%; animation: spin 1s linear infinite;
    }
    .emoji { font-size: 42px; margin-bottom: .5rem; }

    /* 1) Stack buttons on small screens */
@media (max-width: 640px) {
  .form-navigation { flex-direction: column; align-items: stretch; }
  .form-navigation .nav-spacer { display:none; }
  .form-navigation .publish-btn,
  .form-navigation .prev-btn { width: 100%; }
}

/* 2) Slightly soften green glow (if it feels too strong) */
.form-navigation .publish-btn { box-shadow: 0 10px 28px rgba(5,150,105,.30); }
.form-navigation .publish-btn:hover:not(:disabled) { box-shadow: 0 14px 40px rgba(5,150,105,.40); }


    /* Small ID chip next to title */
    .chip {
      margin-left: .75rem; padding: .25rem .6rem; border-radius: 999px;
      font-size: .8rem; background: rgba(0,0,0,.06); color: #2d3748; border: 1px solid rgba(0,0,0,.06);
    }

    /* Route chips (start / via / end) */
    .rp-route { display:flex; flex-wrap:wrap; gap:10px; align-items:center; padding:6px 0 10px; }
    .dot { width:10px; height:10px; border-radius:999px; }
    .dot.start { background:#4f46e5; }
    .dot.via { background:#0ea5e9; }
    .dot.end { background:#ef4444; }
    .loc {
      background:#fff; color:#111; padding:6px 10px; border-radius:999px;
      box-shadow:0 6px 18px rgba(17,24,39,.1); font-size:14px;
    }

    /* ---------- Bottom section polish (only visual) ---------- */
    /* Make the info card light like in the wizard */
    .ride-preview {
      background: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 16px !important;
      padding: 1.25rem !important;
      color: #1f2937 !important;
    }
    .ride-preview b { color: #374151; }
    .ride-preview .preview-details { margin: .35rem 0; }
    .preview-amenities { display:flex; gap:.5rem; flex-wrap:wrap; }
    .preview-amenity {
      background: #e0f2fe; color:#0c4a6e; padding:.25rem .5rem;
      border-radius: 6px; font-size:.8rem; font-weight:500;
    }

    /* Buttons area */
    .form-navigation { justify-content: flex-end; gap: 1rem; }
    .form-navigation .publish-btn {
      border: none !important;
      font-weight: 700;
      padding: 1rem 1.75rem;
      border-radius: 14px;
      box-shadow: 0 14px 40px rgba(5, 150, 105, 0.35); /* softer, premium */
      transform: translateZ(0);
    }
    .form-navigation .publish-btn:hover:not(:disabled) {
      box-shadow: 0 18px 48px rgba(5, 150, 105, 0.45);
    }
    .form-navigation .prev-btn {
      background: #f3f4f6 !important;
      color: #374151 !important;
      border: 2px solid #e5e7eb !important;
      box-shadow: none !important;        /* remove heavy shadow */
      padding: 1rem 1.25rem !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
    }
    .form-navigation .prev-btn:hover:not(:disabled) {
      background: #e5e7eb !important;
      transform: translateX(2px);
    }
  `}</style>
);


export default RidePublished;