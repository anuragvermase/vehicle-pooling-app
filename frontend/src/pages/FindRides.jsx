// FindRides.jsx (single file — keep imports the same)
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import EnhancedMap from '../components/maps/EnhancedMap';
import LocationSearchInput from '../components/maps/LocationSearchInput';
import API from '../services/api';
import useWebSocket from '../hooks/useWebSockets';

// IMPORTANT: this was accidentally commented out in your file due to same-line // comment
const libraries = ['places', 'geometry'];

const FindRides = ({ user, onLogout }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // ---------- State ----------
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    via: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    passengers: 1,
  });

  const [locationData, setLocationData] = useState({ from: null, to: null, via: null });
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.209 });
  const [searchStep, setSearchStep] = useState('form'); // 'form' | 'searching' | 'results'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map' | 'split'
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showViaInput, setShowViaInput] = useState(false);
  const lastSearchParamsRef = useRef(null);

  const [recent, setRecent] = useState([]);            // NEW
  const [recentOpen, setRecentOpen] = useState(true);  // NEW

  const quickRoutes = [                                 // NEW
    { from: 'New Delhi', to: 'Gurugram' },
    { from: 'Noida', to: 'Connaught Place' },
    { from: 'Bengaluru', to: 'Airport' },
    { from: 'Pune', to: 'Hinjawadi' },
  ];

  // NEW: amenity options + resetFilters (for modal)
  const amenityOptions = [
    { id: 'ac', label: 'AC' },
    { id: 'music', label: 'Music' },
    { id: 'charging', label: 'Charging' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'water', label: 'Water' },
    { id: 'sanitizer', label: 'Sanitizer' },
  ];
  const resetFilters = () => {
    setFilters({
      maxPrice: '',
      minRating: 0,
      vehicleType: '',
      amenities: [],
      instantBooking: false,
      sortBy: 'price',
      priceRange: [0, 2000],
      departureTimeRange: ['00:00', '23:59'],
    });
  };

  const searchFormRef = useRef(null);
  const { socket, notifications, removeNotification } = useWebSocket(
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001',
    user
  );

  // ---------- Derived rides (filters + sort) ----------
  const [filters, setFilters] = useState({
    maxPrice: '',
    minRating: 0,
    vehicleType: '',
    amenities: [],
    instantBooking: false,
    sortBy: 'price',
    priceRange: [0, 2000],
    departureTimeRange: ['00:00', '23:59'],
  });

  const filteredRides = useMemo(() => {
    let filtered = [...rides];

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (r) => (r.currentPrice ?? r.pricePerSeat ?? 0) <= parseInt(filters.maxPrice, 10)
      );
    }

    if (filters.minRating) {
      filtered = filtered.filter(
        (r) => (r.driver?.rating?.average ?? 0) >= parseFloat(filters.minRating)
      );
    }

    if (filters.vehicleType) {
      filtered = filtered.filter(
        (r) => (r.vehicle?.type || '').toLowerCase() === filters.vehicleType.toLowerCase()
      );
    }

    if (filters.amenities.length) {
      filtered = filtered.filter((r) =>
        filters.amenities.every((a) => (r.vehicle?.amenities || []).includes(a))
      );
    }

    if (filters.instantBooking) {
      filtered = filtered.filter((r) => r.bookingPolicy?.instantBooking);
    }

    filtered = filtered.filter((r) => {
      const p = r.currentPrice ?? r.pricePerSeat ?? 0;
      return p >= filters.priceRange[0] && p <= filters.priceRange[1];
    });

    filtered = filtered.filter((r) => {
      const t = new Date(r.departureTime).toTimeString().slice(0, 5);
      return t >= filters.departureTimeRange[0] && t <= filters.departureTimeRange[1];
    });

    filtered.sort((a, b) => {
      const ap = a.currentPrice ?? a.pricePerSeat ?? 0;
      const bp = b.currentPrice ?? b.pricePerSeat ?? 0;

      switch (filters.sortBy) {
        case 'price':
          return ap - bp;
        case 'rating':
          return (b.driver?.rating?.average ?? 0) - (a.driver?.rating?.average ?? 0);
        case 'time':
          return new Date(a.departureTime) - new Date(b.departureTime);
        case 'duration':
          return (a.duration ?? 0) - (b.duration ?? 0);
        case 'distance':
          return (a.distance ?? 0) - (b.distance ?? 0);
        case 'relevance': {
          const aScore =
            (a.driver?.rating?.average ?? 0) * 0.4 +
            ((2000 - ap) / 2000) * 0.3 +
            ((a.availableSeats ?? 0) / Math.max(a.totalSeats ?? 1, 1)) * 0.3;
          const bScore =
            (b.driver?.rating?.average ?? 0) * 0.4 +
            ((2000 - bp) / 2000) * 0.3 +
            ((b.availableSeats ?? 0) / Math.max(b.totalSeats ?? 1, 1)) * 0.3;
          return bScore - aScore;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [rides, filters]);

  // ---------- Location select + route + price ----------
  const handleLocationSelect = async (locationType, location) => {
    setLocationData((prev) => ({ ...prev, [locationType]: location }));
    setSearchData((prev) => ({ ...prev, [locationType]: location.name || '' }));

    if (location?.coordinates) setMapCenter(location.coordinates);

    if (
      (locationType === 'to' && locationData.from) ||
      (locationType === 'from' && locationData.to)
    ) {
      await calculateRouteAndPrice(
        locationType === 'from' ? location : locationData.from,
        locationType === 'to' ? location : locationData.to,
        locationData.via
      );
    }
  };

  const calculateRouteAndPrice = useCallback(
    async (from = locationData.from, to = locationData.to, via = locationData.via) => {
      if (!from || !to || !window.google) return;

      try {
        const directionsService = new window.google.maps.DirectionsService();
        const waypoints = via?.coordinates ? [{ location: via.coordinates, stopover: true }] : [];

        const result = await directionsService.route({
          origin: from.coordinates,
          destination: to.coordinates,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        });

        const leg = result.routes?.[0]?.legs?.[0];
        if (!leg) return;

        const distanceKm = (leg.distance?.value || 0) / 1000;
        const durationMin = Math.round((leg.duration?.value || 0) / 60);
        setRouteInfo({ distance: Number(distanceKm.toFixed(1)), duration: durationMin });

        // Simple local estimate (₹)
        const baseFare = 35,
          perKm = 12,
          perMin = 2;
        const hour = new Date().getHours();
        const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
        const surge = isPeak ? 1.2 : 1.0;
        const raw = (baseFare + distanceKm * perKm + durationMin * perMin) * surge;

        setPriceEstimate({
          min: Math.max(50, Math.round(raw * 0.9)),
          max: Math.round(raw * 1.15),
        });
      } catch (e) {
        console.error(e);
      }
    },
    [locationData]
  );

  // ---------- Search ----------
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchStep('searching');
    setIsSearching(true);

    try {
      const params = {
        from: searchData.from,
        to: searchData.to,
        via: searchData.via,
        date: searchData.date,
        time: searchData.time,
        passengers: searchData.passengers,
        radius: 10,
        userLocation: locationData.from?.coordinates,
        group: true,
      };

      // ✅ add trusted coordinates if available
      if (locationData.from?.coordinates?.lat && locationData.from?.coordinates?.lng) {
        params.fromLat = locationData.from.coordinates.lat;
        params.fromLng = locationData.from.coordinates.lng;
      }
      if (locationData.to?.coordinates?.lat && locationData.to?.coordinates?.lng) {
        params.toLat = locationData.to.coordinates.lat;
        params.toLng = locationData.to.coordinates.lng;
      }
      if (locationData.via?.coordinates?.lat && locationData.via?.coordinates?.lng) {
        params.viaLat = locationData.via.coordinates.lat;
        params.viaLng = locationData.via.coordinates.lng;
      }
      if (params.fromLat && params.fromLng && params.toLat && params.toLng) {
        params.trustCoordinates = true;     // tell backend to skip geocoding and use geo search
      }

      lastSearchParamsRef.current = params;

      const res = await API.rides.search(params);
      if (res?.success) {
        const list = res.rides || [];
        setRides(list);
        setSearchStep('results');
        if (list.length) setSelectedRide(list[0]);
        await saveSearchToHistory(params);
        loadRecent(); // NEW
      } else {
        setSearchStep('form');
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchStep('form');
    } finally {
      setIsSearching(false);
    }
  };

  // ---------- Realtime refresh ----------
  useEffect(() => {
    if (!socket || searchStep !== 'results') return;

    const refresh = async () => {
      try {
        if (!lastSearchParamsRef.current) return;
        const res = await API.rides.search({ ...lastSearchParamsRef.current, group: true }); // ✅ keep grouped
        if (res?.success) setRides(res.rides || []);
      } catch (e) {
        console.error('Realtime refresh error:', e);
      }
    };

    const evts = ['ride_created', 'ride_updated', 'ride_cancelled', 'ride_match_found'];
    evts.forEach((ev) => socket.on(ev, refresh));

    return () => evts.forEach((ev) => socket.off(ev, refresh));
  }, [socket, searchStep]);

  // ---------- Booking ----------
  const handleBookRide = async (ride) => {
    if (!ride?.canBook) return;

    try {
      const ok = await showBookingConfirmation(ride);
      if (!ok) return;

      const bookingData = {
        seatsToBook: searchData.passengers,
        pickupLocation: locationData.from,
        dropoffLocation: locationData.to,
        viaLocation: locationData.via,
        paymentMethod: 'cash',
        specialRequests: '',
      };

      const res = await API.rides.book(ride._id, bookingData);
      if (res?.success) {
        showBookingSuccess(res.booking, ride);
        setRides((prev) =>
          prev.map((r) =>
            r._id === ride._id
              ? { ...r, availableSeats: (r.availableSeats || 0) - searchData.passengers }
              : r
          )
        );
      }
    } catch (e) {
      console.error('Booking error:', e);
      showBookingError(e.message || 'Unknown error');
    }
  };

  const showBookingConfirmation = (ride) =>
    new Promise((resolve) => {
      const total =
        (ride.currentPrice ?? ride.pricePerSeat ?? 0) * Math.max(searchData.passengers, 1);
      const confirmed = window.confirm(
        `Book this ride?\n\nDriver: ${ride.driver?.name}\nPrice: ₹${total}\nDeparture: ${new Date(
          ride.departureTime
        ).toLocaleString()}`
      );
      resolve(confirmed);
    });

  const showBookingSuccess = (booking) => {
    alert(
      `🎉 Booking Confirmed!\n\nBooking ID: ${booking?._id}\nTotal: ₹${booking?.totalAmount ?? ''}`
    );
  };

  const showBookingError = (message) => alert(`❌ Booking Failed\n\n${message}`);

  // ---------- Utils ----------
  const swapLocations = () => {
    setSearchData((p) => ({ ...p, from: p.to, to: p.from }));
    setLocationData((p) => ({ ...p, from: p.to, to: p.from }));
  };

  const resetSearch = () => {
    setSearchStep('form');
    setRides([]);
    setSelectedRide(null);
    setPriceEstimate(null);
    setRouteInfo(null);
  };

  const saveSearchToHistory = async (p) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const entry = { ...p, timestamp: new Date().toISOString(), id: Date.now() };
      const upd = [entry, ...history.filter((h) => !(h.from === entry.from && h.to === entry.to))].slice(
        0,
        10
      );
      localStorage.setItem('searchHistory', JSON.stringify(upd));
    } catch (e) {
      console.error('History save error:', e);
    }
  };

  const loadRecent = () => {                   // NEW
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setRecent(history);
    } catch { }
  };

  const clearForm = () => {                    // NEW
    setSearchData((p) => ({ ...p, from: '', to: '', via: '' }));
    setLocationData((p) => ({ ...p, from: null, to: null, via: null }));
    setRouteInfo(null);
    setPriceEstimate(null);
  };

  const applyQuickRoute = (q) => {             // NEW
    setSearchData((p) => ({ ...p, from: q.from, to: q.to }));
  };

  useEffect(loadRecent, []);                    // NEW

  /* ===================== NEW helpers for 0-results actions ===================== */
  const rerunSearch = async (overrides = {}) => {
    if (!lastSearchParamsRef.current) return;
    const params = { ...lastSearchParamsRef.current, ...overrides, group: true }; // ✅ keep grouped
    lastSearchParamsRef.current = params;
    setIsSearching(true);
    try {
      const res = await API.rides.search(params);
      if (res?.success) {
        setRides(res.rides || []);
        if ((res.rides || []).length) setSelectedRide(res.rides[0]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const tryNearbyDate = async (deltaDays) => {
    const cur = new Date(searchData.date);
    const next = new Date(cur.getTime() + deltaDays * 86400000);
    const nx = next.toISOString().slice(0, 10);
    setSearchData((p) => ({ ...p, date: nx }));
    await rerunSearch({ date: nx });
  };

  const expandRadius = async () => {
    const current = Number(lastSearchParamsRef.current?.radius || 10);
    const next = current < 25 ? 25 : current < 50 ? 50 : 75;
    await rerunSearch({ radius: next });
  };

  const relaxFiltersOnce = () => {
    setFilters((p) => ({
      ...p,
      minRating: 0,
      vehicleType: '',
      priceRange: [0, 5000],
      instantBooking: false,
    }));
  };

  const postARide = () => {
    window.location.assign('/offer-ride');
  };
  /* ============================================================================ */

  // ---------- Loading ----------
  if (!isLoaded) {
    return (
      <div className="rs-page">
        <div className="rs-center">
          <div className="rs-spinner" />
          <h3>Loading Google Maps…</h3>
          <p>Preparing your ride search experience</p>
        </div>
        <StyleChunk />
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="rs-page">
      {/* Header */}
      <header className="rs-header">
        <div className="rs-brand">
          <span className="rs-logo">🚗</span>
          <span className="rs-title">RideShare</span>
          {searchStep === 'results' && (
            <button className="rs-chip" onClick={resetSearch}>
              New Search
            </button>
          )}
        </div>

        <div className="rs-right">
          <div className="rs-hello">{(user?.name || 'AS').slice(0, 2).toUpperCase()}</div>
          <button className="rs-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* NEW: small stats strip under header */}
      {/* Stats strip */}
      <div className="rs-stats">
        <div className="rs-stat">
          <span>👥</span><b>2,340</b><small>active drivers</small>
        </div>
        <div className="rs-stat">
          <span>🧭</span><b>48</b><small>cities covered</small>
        </div>
        <div className="rs-stat">
          <span>⭐</span><b>4.7</b><small>avg. driver rating</small>
        </div>
      </div>


      {/* MAIN */}
      <main className="rs-main">
        {searchStep === 'form' && (
          <div className="rs-card rs-hero">
            <div className="rs-hero-grid">
              {/* LEFT: form */}
              <div className="rs-hero-left">
                <h1 className="rs-h1">Where are you going?</h1>
                <p className="rs-sub">Find rides instantly with real-time tracking</p>

                <form ref={searchFormRef} onSubmit={handleSearch} className="rs-form">
                  <div className="rs-input">
                    <LocationSearchInput
                      placeholder="Pickup location"
                      value={searchData.from}
                      onChange={(e) => setSearchData((p) => ({ ...p, from: e.target.value }))}
                      onPlaceSelect={(loc) => handleLocationSelect('from', loc)}
                    />
                    <i className="fas fa-map-pin rs-pin-icon"></i>
                  </div>

                  <div className="rs-input">
                    <LocationSearchInput
                      placeholder="Drop-off location"
                      value={searchData.to}
                      onChange={(e) => setSearchData((p) => ({ ...p, to: e.target.value }))}
                      onPlaceSelect={(loc) => handleLocationSelect('to', loc)}
                    />
                    <i className="fas fa-map-marker-alt rs-pin-icon"></i>
                  </div>

                  {/* date & passengers */}
                  <div className="rs-row">
                    <div className="rs-input">
                      <input
                        type="date"
                        value={searchData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSearchData((p) => ({ ...p, date: e.target.value }))}
                      />
                    </div>
                    <div className="rs-input">
                      <select
                        value={searchData.passengers}
                        onChange={(e) =>
                          setSearchData((p) => ({ ...p, passengers: parseInt(e.target.value, 10) }))
                        }
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'passenger' : 'passengers'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* swap + via */}
                  <div className="rs-minirow">
                    <button
                      type="button"
                      className="rs-ghost"
                      onClick={swapLocations}
                      disabled={!searchData.from || !searchData.to}
                    >
                      ⇄ Swap
                    </button>
                    {!showViaInput ? (
                      <button
                        type="button"
                        className="rs-ghost"
                        onClick={() => setShowViaInput(true)}
                      >
                        + Add stop
                      </button>
                    ) : (
                      <div className="rs-input rs-via">
                        <LocationSearchInput
                          placeholder="Stop along the way"
                          value={searchData.via}
                          onChange={(e) => setSearchData((p) => ({ ...p, via: e.target.value }))}
                          onPlaceSelect={(loc) => handleLocationSelect('via', loc)}
                        />
                        <i className="fas fa-dot-circle rs-pin-icon"></i>
                        <button
                          type="button"
                          className="rs-x"
                          onClick={() => {
                            setShowViaInput(false);
                            setSearchData((p) => ({ ...p, via: '' }));
                            setLocationData((p) => ({ ...p, via: null }));
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* NEW: clear form */}
                    <button
                      type="button"
                      className="rs-ghost"
                      onClick={clearForm}
                      title="Clear pickup, drop-off and stop"
                    >
                      Clear
                    </button>
                  </div>

                  {/* NEW: quick routes */}
                  <div className="rs-quick">
                    {quickRoutes.map((q) => (
                      <button key={q.from + q.to} className="rs-chip" onClick={() => applyQuickRoute(q)}>
                        {q.from} → {q.to}
                      </button>
                    ))}
                  </div>

                  {/* route + price preview */}
                  {routeInfo && priceEstimate && (
                    <div className="rs-preview">
                      <div>
                        {routeInfo.distance} km • {Math.floor(routeInfo.duration / 60)}h{' '}
                        {routeInfo.duration % 60}m
                      </div>
                      <div className="rs-price">
                        ₹{priceEstimate.min} – ₹{priceEstimate.max}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="rs-primary"
                    disabled={!searchData.from || !searchData.to || isSearching}
                  >
                    {isSearching ? 'Searching…' : 'Search rides'}
                  </button>
                </form>

                {/* NEW: Recent searches (uses your existing localStorage history) */}
                {recent.length > 0 && (
                  <div className="rs-recent">
                    <button className="rs-recent-toggle" onClick={() => setRecentOpen((v) => !v)}>
                      {recentOpen ? '▼' : '►'} Recent searches
                    </button>
                    {recentOpen && (
                      <div className="rs-recent-list">
                        {recent.slice(0, 6).map((r) => (
                          <button
                            key={r.id}
                            className="rs-chip"
                            onClick={async () => {
                              // update plain strings
                              setSearchData((p) => ({
                                ...p,
                                from: r.from,
                                to: r.to,
                                date: r.date,
                                time: r.time || '',
                                passengers: r.passengers || 1,
                              }));

                              // re-geocode to restore map pins
                              const geocoder = new window.google.maps.Geocoder();

                              const geocode = (addr) =>
                                new Promise((resolve) => {
                                  geocoder.geocode({ address: addr }, (results, status) => {
                                    if (status === 'OK' && results[0]) {
                                      const loc = results[0].geometry.location;
                                      resolve({
                                        name: addr,
                                        address: results[0].formatted_address,
                                        coordinates: { lat: loc.lat(), lng: loc.lng() },
                                        placeId: results[0].place_id,
                                      });
                                    } else {
                                      resolve(null);
                                    }
                                  });
                                });

                              const fromLoc = await geocode(r.from);
                              const toLoc = await geocode(r.to);

                              setLocationData((p) => ({
                                ...p,
                                from: fromLoc,
                                to: toLoc,
                              }));

                              if (fromLoc?.coordinates) setMapCenter(fromLoc.coordinates);
                            }}
                            title={`${r.from} → ${r.to}`}
                          >
                            {r.from} → {r.to}
                          </button>
                        ))}


                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT: map */}
              <div className="rs-hero-right">
                <div className="rs-mapwrap">
                  <EnhancedMap
                    rides={[]}
                    selectedRide={null}
                    onRideSelect={() => { }}
                    center={mapCenter}
                    origin={locationData.from?.coordinates}
                    destination={locationData.to?.coordinates}
                    viaPoints={locationData.via ? [locationData.via.coordinates] : []}
                    showDirections={Boolean(locationData.from && locationData.to)}
                  />
                  {/* NEW: subtle overlay badges */}
                  <div className="rs-mapoverlay">
                    {locationData.from && <span className="rs-tag sm">Start pinned</span>}
                    {locationData.to && <span className="rs-tag sm">Destination set</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {searchStep === 'searching' && (
          <div className="rs-card rs-center rs-searching">
            <div className="rs-loader">
              <div className="rs-loader-circle"></div>
              <div className="rs-car">🚗</div>
            </div>
            <h2>Finding your perfect ride…</h2>
            <p>Searching through available rides with real-time data</p>
          </div>
        )}

        {searchStep === 'results' && (
          <div className="rs-card rs-results">
            <div className="rs-results-bar">
              <div>
                <h2 className="rs-h2">{filteredRides.length} rides found</h2>
                <div className="rs-line">
                  {searchData.from} → {searchData.to}
                </div>
                <div className="rs-line rs-dim">
                  {new Date(searchData.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {searchData.time && ` at ${searchData.time}`}
                </div>
              </div>

              <div className="rs-tabs">
                <button
                  className={`rs-tab ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  📋 List
                </button>
                <button
                  className={`rs-tab ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                >
                  🗺 Map
                </button>
                <button
                  className={`rs-tab ${viewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setViewMode('split')}
                >
                  ⚌ Split
                </button>
                <button
                  className={`rs-chip ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters((s) => !s)}
                >
                  🎛 Filters
                </button>
              </div>
            </div>

            {/* MODAL FILTERS */}
            {showFilters && (
              <div className="rs-filters-modal" role="dialog" aria-modal="true" onClick={() => setShowFilters(false)}>
                <div className="rs-filters-card" onClick={(e) => e.stopPropagation()}>
                  <div className="rs-fhead">
                    <h3>Filters</h3>
                    <button className="rs-x" aria-label="Close" onClick={() => setShowFilters(false)}>✕</button>
                  </div>

                  <div className="rs-fgrid">
                    {/* Sort by */}
                    <div className="rs-filter">
                      <label>Sort by</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}
                      >
                        <option value="relevance">Best match</option>
                        <option value="price">Lowest price</option>
                        <option value="rating">Highest rated</option>
                        <option value="time">Departure time</option>
                        <option value="duration">Shortest trip</option>
                      </select>
                    </div>

                    {/* Price max (uses priceRange[1]) */}
                    <div className="rs-filter">
                      <label>Price max</label>
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        value={filters.priceRange[1]}
                        onChange={(e) =>
                          setFilters((p) => ({
                            ...p,
                            priceRange: [p.priceRange[0], parseInt(e.target.value, 10)],
                          }))
                        }
                      />
                      <div className="rs-dim">₹{filters.priceRange[0]} – ₹{filters.priceRange[1]}</div>
                    </div>

                    {/* Min rating */}
                    <div className="rs-filter">
                      <label>Min rating</label>
                      <div className="rs-chiprow">
                        {[3.0, 3.5, 4.0, 4.5].map((r) => (
                          <button
                            key={r}
                            className={`rs-chip ${filters.minRating === r ? 'active' : ''}`}
                            onClick={() => setFilters((p) => ({ ...p, minRating: r }))}
                          >
                            {r}+ ⭐
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vehicle type */}
                    <div className="rs-filter">
                      <label>Vehicle</label>
                      <div className="rs-chiprow">
                        {['', 'hatchback', 'sedan', 'suv', 'luxury'].map((t) => (
                          <button
                            key={t || 'any'}
                            className={`rs-chip ${filters.vehicleType === t ? 'active' : ''}`}
                            onClick={() => setFilters((p) => ({ ...p, vehicleType: t }))}
                          >
                            {t ? t : 'Any'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="rs-filter rs-amenities">
                      <label>Amenities</label>
                      <div className="rs-chiprow">
                        {amenityOptions.map((a) => {
                          const active = filters.amenities.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              className={`rs-chip ${active ? 'active' : ''}`}
                              onClick={() =>
                                setFilters((p) => ({
                                  ...p,
                                  amenities: active
                                    ? p.amenities.filter((x) => x !== a.id)
                                    : [...p.amenities, a.id],
                                }))
                              }
                            >
                              {a.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Departure window */}
                    <div className="rs-filter">
                      <label>Departure window</label>
                      <div className="rs-timebox">
                        <input
                          type="time"
                          value={filters.departureTimeRange[0]}
                          onChange={(e) =>
                            setFilters((p) => ({
                              ...p,
                              departureTimeRange: [e.target.value, p.departureTimeRange[1]],
                            }))
                          }
                        />
                        <span className="rs-sep">—</span>
                        <input
                          type="time"
                          value={filters.departureTimeRange[1]}
                          onChange={(e) =>
                            setFilters((p) => ({
                              ...p,
                              departureTimeRange: [p.departureTimeRange[0], e.target.value],
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Instant booking */}
                    <div className="rs-filter">
                      <label className="rs-check">
                        <input
                          type="checkbox"
                          checked={filters.instantBooking}
                          onChange={(e) =>
                            setFilters((p) => ({ ...p, instantBooking: e.target.checked }))
                          }
                        />
                        Instant booking only
                      </label>
                    </div>
                  </div>

                  <div className="rs-factions">
                    <button className="rs-ghost" onClick={resetFilters}>Reset</button>
                    <button className="rs-primary small" onClick={() => setShowFilters(false)}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={`rs-split ${viewMode}`}>
              {(viewMode === 'list' || viewMode === 'split') && (
                <div className="rs-list compact">
                  {filteredRides.map((ride, idx) => (
                    <CompactRideRow
                      key={ride._id}
                      ride={ride}
                      isSelected={selectedRide?._id === ride._id}
                      onSelect={() => setSelectedRide(ride)}
                      onBook={() => handleBookRide(ride)}
                      passengers={searchData.passengers}
                      appearDelay={idx * 50}
                    />
                  ))}
                </div>
              )}

              {(viewMode === 'map' || viewMode === 'split') && (
                <div className="rs-mapwrap">
                  <EnhancedMap
                    rides={filteredRides}
                    selectedRide={selectedRide}
                    onRideSelect={setSelectedRide}
                    center={mapCenter}
                    origin={locationData.from?.coordinates}
                    destination={locationData.to?.coordinates}
                    viaPoints={locationData.via ? [locationData.via.coordinates] : []}
                    showDirections={true}
                  />
                </div>
              )}
            </div>

            {filteredRides.length === 0 && (
              <>
                <div className="rs-empty">
                  <div className="rs-emoji">😕</div>
                  <h3>No rides found</h3>
                  <p className="rs-dim">Try adjusting your filters or use one of the quick actions below</p>

                  {/* Action buttons row */}
                  <div className="rs-cta-row">
                    <button className="rs-secondary" onClick={() => tryNearbyDate(-1)} disabled={isSearching}>
                      ← Previous day
                    </button>
                    <button className="rs-secondary" onClick={() => tryNearbyDate(+1)} disabled={isSearching}>
                      Next day →
                    </button>
                    <button className="rs-secondary" onClick={expandRadius} disabled={isSearching}>
                      Expand radius
                    </button>
                    <button className="rs-secondary" onClick={relaxFiltersOnce}>
                      Relax filters
                    </button>
                    <button className="rs-primary small" onClick={postARide}>
                      🚀 Post a ride
                    </button>
                  </div>

                  <button className="rs-secondary" onClick={resetSearch} style={{ marginTop: 8 }}>
                    Modify search
                  </button>
                </div>
                {/* ⬆️ Quick routes & Recent searches were intentionally removed on results page */}
              </>
            )}
          </div>
        )}
      </main>

      {/* Notifications */}
      {notifications.map((n) => (
        <div key={n.id} className={`rs-toast ${n.type}`}>
          <div>
            <strong>{n.title}</strong>
            <div>{n.message}</div>
          </div>
          <button className="rs-x" onClick={() => removeNotification(n.id)}>
            ✕
          </button>
        </div>
      ))}

      <StyleChunk />
    </div>
  );
};

// ---------- Compact row (results list) ----------
const CompactRideRow = ({
  ride,
  isSelected,
  onSelect,
  onBook,
  passengers,
  appearDelay = 0,
}) => {
  const perSeat = ride.currentPrice ?? ride.pricePerSeat ?? 0;
  const totalPrice = perSeat * Math.max(passengers || 1, 1);

  return (
    <div
      className={`rs-rowcard ${isSelected ? 'selected' : ''} ${!ride.canBook ? 'unavailable' : ''}`}
      style={{ animationDelay: `${appearDelay}ms` }}
      onClick={onSelect}
      title="View details"
    >
      <div className="rs-row-left">
        <img
          className="rs-avatar sm"
          src={
            ride.driver?.profilePicture ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              ride.driver?.name || 'Driver'
            )}&background=4F46E5&color=fff`
          }
          alt={ride.driver?.name || 'Driver'}
        />
        <div className="rs-row-info">
          <div className="rs-row-name">{ride.driver?.name || 'Driver'}</div>
          <div className="rs-row-sub">
            <span className="rs-star">★</span>
            <span>{(ride.driver?.rating?.average ?? 0).toFixed(1)}</span>
            <span className="rs-dotsep">•</span>
            <span className="rs-car">{ride.vehicle?.model || 'Vehicle'}</span>
          </div>
        </div>
      </div>

      <div className="rs-row-right">
        <div className="rs-price-lg">₹{totalPrice}</div>
        {passengers > 1 && (
          <div className="rs-dim sm">
            ₹{perSeat} × {passengers}
          </div>
        )}
        <button
          className="rs-mini-book"
          disabled={!ride.canBook}
          onClick={(e) => {
            e.stopPropagation();
            onBook();
          }}
        >
          Book
        </button>
      </div>
    </div>
  );
};

// ---------- Legacy card (kept in case you want to switch back) ----------
const RideCard = ({ ride, isSelected, onSelect, onBook, passengers, appearDelay = 0 }) => {
  const perSeat = ride.currentPrice ?? ride.pricePerSeat ?? 0;
  const totalPrice = perSeat * Math.max(passengers || 1, 1);
  const departureTime = new Date(ride.departureTime);
  const arrivalTime = new Date(departureTime.getTime() + (ride.duration ?? 0) * 60000);

  return (
    <div
      className={`rs-ride ${isSelected ? 'selected' : 'unselected'} ${ride.canBook ? 'bookable' : 'unavailable'}`}
      style={{ animationDelay: `${appearDelay}ms` }}
      onClick={onSelect}
    >
      <div className="rs-ride-top">
        <div className="rs-driver">
          <img
            className="rs-avatar"
            src={
              ride.driver?.profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                ride.driver?.name || 'Driver'
              )}&background=4F46E5&color=fff`
            }
            alt={ride.driver?.name || 'Driver'}
          />
          <div>
            <div className="rs-driver-name">{ride.driver?.name || 'Driver'}</div>
            <div className="rs-dim">
              ⭐ {(ride.driver?.rating?.average ?? 0).toFixed(1)} (
              {ride.driver?.rating?.count ?? 0})
            </div>
            <div className="rs-dim">{ride.driver?.stats?.totalRidesOffered ?? 0} trips</div>
          </div>
        </div>
        <div className="rs-pricebox">
          <div className="rs-price-lg">₹{totalPrice}</div>
          {passengers > 1 && (
            <div className="rs-dim">
              ₹{perSeat} × {passengers}
            </div>
          )}
          {ride.dynamicPricing?.enabled && (ride.dynamicPricing?.currentMultiplier ?? 1) > 1 && (
            <div className="rs-badge">⚡ {ride.dynamicPricing.currentMultiplier}x surge</div>
          )}
        </div>
      </div>

      <div className="rs-times">
        <div>
          <div className="rs-time">
            {departureTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </div>
          <div className="rs-dim">Departure</div>
        </div>
        <div className="rs-mid">
          <span className="rs-dim">
            {Math.floor((ride.duration ?? 0) / 60)}h {(ride.duration ?? 0) % 60}m
          </span>
        </div>
        <div>
          <div className="rs-time">
            {arrivalTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </div>
          <div className="rs-dim">Arrival</div>
        </div>
      </div>

      <div className="rs-route">
        <div className="rs-dot start" />
        <span className="rs-loc">{ride.startLocation?.name || 'Start'}</span>
        {(ride.viaLocations || []).map((v, i) => (
          <React.Fragment key={i}>
            <div className="rs-dot via" />
            <span className="rs-loc">{v?.name || 'Stop'}</span>
          </React.Fragment>
        ))}
        <div className="rs-dot end" />
        <span className="rs-loc">{ride.endLocation?.name || 'End'}</span>
      </div>

      <div className="rs-meta">
        <div>
          🚗 {ride.vehicle?.model || 'Vehicle'} • {ride.vehicle?.color || '—'} •{' '}
          {ride.vehicle?.plateNumber || '—'}
        </div>
        <div>
          👥 {ride.availableSeats ?? 0} / {ride.totalSeats ?? 0} seats
        </div>
        {(ride.vehicle?.amenities || []).length > 0 && (
          <div className="rs-tags">
            {ride.vehicle.amenities.slice(0, 3).map((a, i) => (
              <span key={i} className="rs-tag">
                {a}
              </span>
            ))}
            {ride.vehicle.amenities.length > 3 && (
              <span className="rs-tag">+{ride.vehicle.amenities.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="rs-ride-actions">
        <button
          className="rs-ghost"
          onClick={(e) => {
            e.stopPropagation();
            if (ride.driver?.phone) window.open(`tel:${ride.driver.phone}`);
          }}
        >
          📞 Contact
        </button>
        <button
          className={`rs-primary small ${!ride.canBook ? 'disabled' : ''}`}
          disabled={!ride.canBook}
          onClick={(e) => {
            e.stopPropagation();
            onBook();
          }}
        >
          🎫 Book ride
        </button>
      </div>
    </div>
  );
};

// ---------- Inline styles (single-file) ----------
const StyleChunk = () => (
  <style>{`
  :root{
    --bg:#0f0f3a; --grad1:#5b3ef1; --grad2:#b146f3;
    --card:#1b1c4f; --soft:#2a2b6b; --text:#f4f6ff; --muted:#cdd3ff;
    --white:#ffffff; --chip:#3a3cc0;
  }
  *{box-sizing:border-box}
  body{margin:0; width:100%; overflow-x:hidden}
  .rs-page{
    min-height:100vh; width:100%;
    background:
      radial-gradient(1200px 700px at 15% 10%, rgba(177,70,243,.28), transparent),
      radial-gradient(1000px 600px at 85% 85%, rgba(91,62,241,.25), transparent),
      linear-gradient(135deg, #3b2aa6 0%, #7a36d0 55%, #b244f2 100%);
    color:var(--text); padding:32px 0; margin:0
  }
  .rs-center{display:grid; place-items:center; text-align:center; padding:64px}
  .rs-spinner{width:38px; height:38px; border-radius:50%; border:3px solid rgba(255,255,255,.25); border-top-color:#fff; animation:spin 1s linear infinite; margin-bottom:12px}
  @keyframes spin{to{transform:rotate(360deg)}}

  .rs-header{width:100%; max-width:1280px; margin:0 auto 12px; display:flex; align-items:center; justify-content:space-between; padding:0 20px}
  .rs-brand{display:flex; align-items:center; gap:12px}
  .rs-logo{font-size:22px}
  .rs-title{font-weight:800; font-size:22px; letter-spacing:.2px}
  .rs-chip{background:rgba(255,255,255,.12); padding:8px 14px; border-radius:999px; border:1px solid rgba(255,255,255,.18); color:#fff; cursor:pointer}
  .rs-chip.active{background:rgba(255,255,255,.22)}
  .rs-right{display:flex; align-items:center; gap:12px}
  .rs-hello{background:#5b6ef5; color:#fff; width:36px; height:36px; border-radius:999px; display:grid; place-items:center; font-weight:700}
  .rs-logout{background:#111; color:#fff; border:1px solid rgba(255,255,255,.2); padding:8px 12px; border-radius:12px; cursor:pointer}

  /* Stats row */
  .rs-stats{max-width:1280px; margin:0 auto 18px; padding:0 20px; display:flex; gap:12px; flex-wrap:wrap}
  .rs-stat{background:linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.08)); border:1px solid rgba(255,255,255,.18); border-radius:12px; padding:8px 12px; display:flex; align-items:center; gap:8px; backdrop-filter:blur(8px)}
  .rs-stat b{font-size:16px}
  .rs-stat small{color:var(--muted)}

  /* Main container */
  .rs-main{max-width:1280px; margin:0 auto; width:100%; padding:0 20px}

  /* Card as a premium glass panel */
  .rs-card {
    background:
      radial-gradient(1000px 700px at -20% -20%, rgba(255,255,255,.08), transparent),
      rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.18);
    backdrop-filter: blur(14px);
    border-radius:28px;
    box-shadow:0 30px 80px rgba(0,0,0,.35);
    padding:40px;
    width:100%;
    min-height:88vh;
    display:flex; flex-direction:column; justify-content:center;
  }

  /* HERO */
  .rs-hero-grid{display:grid; grid-template-columns: 1.15fr 1fr; gap:40px; align-items:stretch; height:100%}
  .rs-h1{font-size:48px; line-height:1.08; margin:0 0 10px; font-weight:900; letter-spacing:.3px}
  .rs-sub{margin:0 0 16px; color:var(--muted)}

  .rs-form{display:flex; flex-direction:column; gap:12px}
  .rs-row{display:grid; grid-template-columns:1fr 1fr; gap:12px}
  .rs-minirow{display:flex; gap:10px; align-items:center}
  .rs-input{
    background:#fff; border-radius:16px; padding:14px 16px; color:#111; display:flex; align-items:center; gap:8px;
    position:relative; box-shadow:0 8px 24px rgba(17,24,39,.10); border:1px solid rgba(0,0,0,0);
  }
  .rs-input input, .rs-input select{border:none; outline:none; width:100%; font-size:16px; padding-right:30px; background:transparent}
  .rs-input:focus-within{outline:0; box-shadow:0 0 0 3px rgba(99,102,241,.35)}
  .rs-pin-icon{position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#666; z-index:1}
  .rs-via{position:relative}
  .rs-x{background:transparent; border:none; color:#333; cursor:pointer; position:absolute; right:8px; top:8px; z-index:2}

  .rs-primary{
    background: linear-gradient(135deg, #ff4694, #b146f3);
    color:#fff; font-weight:800; border:none; padding:18px 20px; border-radius:16px; cursor:pointer;
    box-shadow:0 16px 38px rgba(177,70,243,.35); transition:transform .15s ease, box-shadow .15s ease;
  }
  .rs-primary:hover{ transform:translateY(-1px); box-shadow:0 22px 48px rgba(177,70,243,.45) }
  .rs-primary.small{padding:10px 14px}
  .rs-primary.disabled{opacity:.6; cursor:not-allowed}
  .rs-secondary{background:#fff; color:#111; border:1px solid #eee; padding:12px 16px; border-radius:14px; cursor:pointer; box-shadow:0 10px 22px rgba(17,24,39,.08)}
  .rs-ghost{background:rgba(255,255,255,.14); color:#fff; border:1px solid rgba(255,255,255,.28); padding:8px 12px; border-radius:999px; cursor:pointer}

  .rs-preview{display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,.12); padding:12px 14px; border-radius:12px; color:#fff}
  .rs-price{font-weight:800}

  /* quick routes & recent */
  .rs-quick{display:flex; flex-wrap:wrap; gap:8px; margin-top:6px}
  .rs-recent{margin-top:12px}
  .rs-recent-toggle{background:rgba(255,255,255,.1); color:#fff; border:1px solid rgba(255,255,255,.25); padding:8px 10px; border-radius:10px; cursor:pointer}
  .rs-recent-list{display:flex; flex-wrap:wrap; gap:8px; margin-top:10px}
  .rs-chip{background:#fff; color:#111; border:none; border-radius:999px; padding:8px 12px; box-shadow:0 6px 18px rgba(17,24,39,.10)}

  /* map */
  .rs-mapwrap{height:760px; border-radius:18px; overflow:hidden; background:#0a0a2a; border:1px solid rgba(255,255,255,.12); position:relative; box-shadow:0 20px 60px rgba(0,0,0,.28)}
  .rs-mapoverlay{position:absolute; left:10px; top:10px; display:flex; gap:6px; pointer-events:none}
  .rs-tag{background:rgba(255,255,255,.18); padding:6px 10px; border-radius:999px; font-size:12px}
  .rs-tag.sm{font-size:11px; padding:4px 8px}

  /* Results */
  .rs-results-bar{display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:28px}
  .rs-h2{font-size:32px; margin:0 0 2px; font-weight:900}
  .rs-line{font-size:16px}
  .rs-dim{color:var(--muted)}
  .rs-tabs{display:flex; gap:8px; align-items:center}
  .rs-tab{background:#fff; color:#111; border:none; padding:8px 12px; border-radius:12px; cursor:pointer; box-shadow:0 6px 18px rgba(17,24,39,.1)}
  .rs-tab.active{outline:3px solid rgba(255,255,255,.35)}

  /* Filters modal */
  .rs-filters{display:none}
  .rs-filters-modal{
    position: fixed; inset: 0; z-index: 60;
    background: rgba(10,12,28,.45);
    backdrop-filter: blur(6px);
    display:flex; align-items:center; justify-content:center;
    padding: 20px;
  }
  .rs-filters-card{
    width: min(980px, 96vw);
    background: rgba(255,255,255,.10);
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 18px;
    box-shadow: 0 30px 80px rgba(0,0,0,.45);
    padding: 18px 18px 14px;
    color: var(--text);
  }
  .rs-fhead{display:flex; align-items:center; justify-content:space-between; padding: 4px 4px 10px; border-bottom: 1px solid rgba(255,255,255,.12); margin-bottom: 14px;}
  .rs-fhead h3{ margin:0; font-size:20px; font-weight:800 }
  .rs-fgrid{ display:grid; grid-template-columns: 1fr 1fr; gap:14px 18px; }
  .rs-filter{ display:flex; flex-direction:column; gap:8px }
  .rs-chiprow{ display:flex; flex-wrap:wrap; gap:8px }
  .rs-timebox{ display:flex; align-items:center; gap:8px }
  .rs-sep{ opacity:.7 }
  .rs-factions{ display:flex; justify-content:flex-end; gap:10px; margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.12); }
  .rs-filters-card select, .rs-filters-card input[type="time"], .rs-filters-card input[type="range"]{ background:#fff; color:#111; border:none; border-radius:10px; padding:8px 10px; box-shadow:0 6px 18px rgba(17,24,39,.10); }
  .rs-filters-card input[type="range"]{ padding:0 }
  .rs-filters-card .rs-chip{ background:#fff; color:#111; border:none; border-radius:999px; padding:8px 12px; box-shadow:0 6px 18px rgba(17,24,39,.10); }
  .rs-filters-card .rs-chip.active{ outline:3px solid rgba(255,255,255,.35) }

  /* Empty state */
  .rs-empty{ display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:70px 20px; gap:14px; background:rgba(255,255,255,.06); border-radius:16px; margin-top:30px; box-shadow:0 14px 36px rgba(0,0,0,.20)}
  .rs-empty h3{ font-size:22px; margin:6px 0; }
  .rs-empty .rs-emoji{ font-size:56px; margin-bottom:4px; }
  .rs-cta-row{ display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:14px; }

  /* List rows */
  .rs-list{display:flex; flex-direction:column; gap:12px; min-height:200px}
  .rs-rowcard{background:#fff; color:#111; border-radius:14px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; box-shadow:0 12px 28px rgba(17,24,39,.10); animation:fadeIn .25s ease both}
  .rs-rowcard.selected{outline:3px solid #7b5cf3}
  .rs-row-left{display:flex; align-items:center; gap:10px}
  .rs-avatar{width:44px; height:44px; border-radius:999px}
  .rs-avatar.sm{width:36px; height:36px}
  .rs-row-name{font-weight:800}
  .rs-row-sub{display:flex; align-items:center; gap:6px; color:#6b7280; font-size:13px}
  .rs-star{color:#f59e0b}
  .rs-dotsep{opacity:.6}
  .rs-row-right{text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:2px}
  .rs-price-lg{font-size:20px; font-weight:900}
  .rs-mini-book{background:#111; color:#fff; border:none; padding:6px 10px; border-radius:999px; cursor:pointer; font-size:12px; display:none}
  .rs-rowcard:hover .rs-mini-book{display:inline-block}
  .rs-rowcard.unavailable{opacity:.7}
  @keyframes fadeIn{from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:none)}

  /* Toasts */
  .rs-toast{position:fixed; right:18px; bottom:18px; background:#fff; color:#111; padding:12px 14px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.25); display:flex; gap:10px; align-items:flex-start}
  .rs-toast.error{border-left:6px solid #ef4444}
  .rs-toast.success{border-left:6px solid #22c55e}
  .rs-toast .rs-x{position:static; color:#333}

  /* Responsive */
  @media (max-width: 1024px){
    .rs-card{min-height: auto; padding:28px}
    .rs-mapwrap{height:480px}
  }
  @media (max-width: 900px) {
    .rs-hero-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .rs-page { padding: 16px 0; }
    .rs-main { padding: 0 16px; }
    .rs-header { padding: 0 16px; }
    .rs-h1 { font-size: 34px; }
    .rs-h2 { font-size: 26px; }
    .rs-results-bar { flex-direction: column; align-items: flex-start; gap: 12px; }
    .rs-fgrid{ grid-template-columns: 1fr; }
  }
  `}</style>
);

export default FindRides;
