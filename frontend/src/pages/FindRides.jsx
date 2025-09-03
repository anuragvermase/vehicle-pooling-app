// FindRides.jsx (single file — keep imports the same)
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useLocation } from 'react-router-dom'; // <-- added
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

  const location = useLocation(); // <-- added

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

  const [filters, setFilters] = useState({
    maxPrice: '',
    minRating: 4.0,
    vehicleType: '',
    amenities: [],
    instantBooking: false,
    sortBy: 'price',
    priceRange: [0, 2000],
    departureTimeRange: ['00:00', '23:59'],
  });

  const searchFormRef = useRef(null);
  const { socket, notifications, removeNotification } = useWebSocket(
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    user
  );

  // ---------- Derived rides (filters + sort) ----------
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
        // pass coords if we have them so backend skips geocoding
        fromLat: locationData.from?.coordinates?.lat,
        fromLng: locationData.from?.coordinates?.lng,
        toLat: locationData.to?.coordinates?.lat,
        toLng: locationData.to?.coordinates?.lng,
        viaLat: locationData.via?.coordinates?.lat,
        viaLng: locationData.via?.coordinates?.lng,
        trustCoordinates:
          !!(locationData.from?.coordinates && locationData.to?.coordinates),
      };

      lastSearchParamsRef.current = params;

      const res = await API.rides.search(params);
      if (res?.success) {
        const list = res.rides || [];
        setRides(list);
        setSearchStep('results');
        if (list.length) setSelectedRide(list[0]);
        await saveSearchToHistory(params);
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

  // ---------- Auto-prefill & auto-search from query params ----------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const from = params.get('from') || '';
    const to = params.get('to') || '';
    const via = params.get('via') || '';
    const date = params.get('date') || '';
    const passengers = Number(params.get('passengers') || 1);

    const fromLat = parseFloat(params.get('fromLat'));
    const fromLng = parseFloat(params.get('fromLng'));
    const toLat = parseFloat(params.get('toLat'));
    const toLng = parseFloat(params.get('toLng'));
    const viaLat = parseFloat(params.get('viaLat'));
    const viaLng = parseFloat(params.get('viaLng'));
    const trustCoordinates = params.get('trustCoordinates') === 'true';

    const hasQuery = from || to || date || params.get('fromLat') || params.get('toLat');

    if (!hasQuery) return;

    // Pre-fill fields
    setSearchData((prev) => ({
      ...prev,
      from,
      to,
      via,
      date: date || prev.date,
      passengers: isFinite(passengers) && passengers > 0 ? passengers : prev.passengers,
    }));

    // Set coordinates & center
    setLocationData((prev) => ({
      ...prev,
      from:
        isFinite(fromLat) && isFinite(fromLng)
          ? { name: from, address: from, coordinates: { lat: fromLat, lng: fromLng } }
          : prev.from,
      to:
        isFinite(toLat) && isFinite(toLng)
          ? { name: to, address: to, coordinates: { lat: toLat, lng: toLng } }
          : prev.to,
      via:
        isFinite(viaLat) && isFinite(viaLng)
          ? { name: via, address: via, coordinates: { lat: viaLat, lng: viaLng } }
          : prev.via,
    }));

    if (isFinite(fromLat) && isFinite(fromLng)) {
      setMapCenter({ lat: fromLat, lng: fromLng });
    }

    // Auto-run search with coords
    (async () => {
      try {
        setSearchStep('searching');
        setIsSearching(true);

        const searchParams = {
          from,
          to,
          via,
          date: date || new Date().toISOString().split('T')[0],
          passengers: isFinite(passengers) && passengers > 0 ? passengers : 1,
          radius: 10,
          fromLat: isFinite(fromLat) ? fromLat : undefined,
          fromLng: isFinite(fromLng) ? fromLng : undefined,
          toLat: isFinite(toLat) ? toLat : undefined,
          toLng: isFinite(toLng) ? toLng : undefined,
          viaLat: isFinite(viaLat) ? viaLat : undefined,
          viaLng: isFinite(viaLng) ? viaLng : undefined,
          trustCoordinates,
        };

        lastSearchParamsRef.current = searchParams;

        const res = await API.rides.search(searchParams);
        if (res?.success) {
          const list = res.rides || [];
          setRides(list);
          setSearchStep('results');
          if (list.length) setSelectedRide(list[0]);
        } else {
          setSearchStep('form');
        }
      } catch (err) {
        console.error('Auto-search error:', err);
        setSearchStep('form');
      } finally {
        setIsSearching(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ---------- Realtime refresh ----------
  useEffect(() => {
    if (!socket || searchStep !== 'results') return;

    const refresh = async () => {
      try {
        if (!lastSearchParamsRef.current) return;
        const res = await API.rides.search(lastSearchParamsRef.current);
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
              </div>

              {/* RIGHT: map */}
              <div className="rs-hero-right">
                <div className="rs-mapwrap">
                  <EnhancedMap
                    rides={[]}
                    selectedRide={null}
                    onRideSelect={() => {}}
                    center={mapCenter}
                    origin={locationData.from?.coordinates}
                    destination={locationData.to?.coordinates}
                    viaPoints={locationData.via ? [locationData.via.coordinates] : []}
                    showDirections={Boolean(locationData.from && locationData.to)}
                  />
                </div>

                {/* Compact teaser style under map (empty state) */}
                <div className="rs-teaser">
                  <div className="rs-teaser-row skeleton" />
                  <div className="rs-teaser-row skeleton" />
                  <div className="rs-teaser-row skeleton" />
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

            {showFilters && (
              <div className="rs-filters">
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
                  <div className="rs-dim">
                    ₹{filters.priceRange[0]} – ₹{filters.priceRange[1]}
                  </div>
                </div>

                <div className="rs-filter">
                  <label>Min rating</label>
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

                <div className="rs-filter">
                  <label>Vehicle</label>
                  {['any', 'hatchback', 'sedan', 'suv', 'luxury'].map((t) => (
                    <button
                      key={t}
                      className={`rs-chip ${
                        filters.vehicleType === t || (t === 'any' && !filters.vehicleType)
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setFilters((p) => ({ ...p, vehicleType: t === 'any' ? '' : t }))
                      }
                    >
                      {t === 'any' ? 'Any' : t}
                    </button>
                  ))}
                </div>

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
              <div className="rs-empty">
                <div className="rs-emoji">😕</div>
                <h3>No rides found</h3>
                <p className="rs-dim">Try adjusting your filters or search criteria</p>
                <button className="rs-secondary" onClick={resetSearch}>
                  Modify search
                </button>
              </div>
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
      className={`rs-ride ${isSelected ? 'selected' : ''} ${
        ride.canBook ? 'bookable' : 'unavailable'
      }`}
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
  .rs-page{min-height:100vh; width:100%; background: radial-gradient(1200px 600px at 20% 10%, rgba(177,70,243,.35), transparent),
                                 radial-gradient(1200px 600px at 80% 80%, rgba(91,62,241,.35), transparent),
                                 linear-gradient(135deg, #3d2aa6 0%, #7a36d0 60%, #ae44f2 100%);
           color:var(--text); padding:28px 0; margin:0}
  .rs-center{display:grid; place-items:center; text-align:center; padding:64px}
  .rs-spinner{width:38px; height:38px; border-radius:50%; border:3px solid rgba(255,255,255,.25); border-top-color:#fff; animation:spin 1s linear infinite; margin-bottom:12px}
  @keyframes spin{to{transform:rotate(360deg)}}

  .rs-header{width:100%; max-width:1100px; margin:0 auto 24px; display:flex; align-items:center; justify-content:space-between; padding:0 20px}
  .rs-brand{display:flex; align-items:center; gap:12px}
  .rs-logo{font-size:22px}
  .rs-title{font-weight:700; font-size:20px}
  .rs-chip{background:rgba(255,255,255,.12); padding:8px 14px; border-radius:999px; border:none; color:#fff; cursor:pointer}
  .rs-chip.active{background:rgba(255,255,255,.22)}
  .rs-right{display:flex; align-items:center; gap:12px}
  .rs-hello{background:#5b6ef5; color:#fff; width:36px; height:36px; border-radius:999px; display:grid; place-items:center; font-weight:700}
  .rs-logout{background:#111; color:#fff; border:1px solid rgba(255,255,255,.2); padding:8px 12px; border-radius:12px; cursor:pointer}

  .rs-main{max-width:1100px; margin:0 auto; width:100%; padding:0 20px}
  .rs-card{background:rgba(255,255,255,.08); backdrop-filter: blur(20px); border-radius:22px; box-shadow:0 20px 50px rgba(0,0,0,.25); padding:28px; width:100%}

  /* HERO */
  .rs-hero-grid{display:grid; grid-template-columns: 1.2fr 1fr; gap:26px}
  .rs-h1{font-size:44px; line-height:1.1; margin:0 0 8px}
  .rs-sub{margin:0 0 18px; color:var(--muted)}
  .rs-form{display:flex; flex-direction:column; gap:14px}
  .rs-row{display:grid; grid-template-columns:1fr 1fr; gap:14px}
  .rs-minirow{display:flex; gap:10px; align-items:center}
  .rs-input{background:#fff; border-radius:16px; padding:12px 14px; color:#111; display:flex; align-items:center; gap:8px; position:relative; box-shadow:0 6px 22px rgba(17,24,39,.08)}
  .rs-input input, .rs-input select{border:none; outline:none; width:100%; font-size:15px; padding-right:30px}
  .rs-pin-icon{position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#666; z-index:1}
  .rs-via{position:relative}
  .rs-x{background:transparent; border:none; color:#333; cursor:pointer; position:absolute; right:8px; top:8px; z-index:2}
  .rs-primary{background: linear-gradient(135deg, #ff4694, #b146f3); color:#fff; font-weight:700; border:none; padding:16px 18px; border-radius:16px; cursor:pointer; box-shadow:0 10px 28px rgba(177,70,243,.35)}
  .rs-primary.small{padding:10px 14px}
  .rs-primary.disabled{opacity:.6; cursor:not-allowed}
  .rs-secondary{background:#fff; color:#111; border:none; padding:12px 16px; border-radius:14px; cursor:pointer}
  .rs-ghost{background:rgba(255,255,255,.14); color:#fff; border:none; padding:8px 12px; border-radius:999px; cursor:pointer}

  .rs-preview{display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,.12); padding:10px 12px; border-radius:12px; color:#fff}
  .rs-price{font-weight:700}

  .rs-mapwrap{height:360px; border-radius:18px; overflow:hidden; background:#0a0a2a; border:1px solid rgba(255,255,255,.1)}
  .rs-teaser{margin-top:12px; background:#f8f9ff; border-radius:14px; padding:10px; display:flex; flex-direction:column; gap:8px; box-shadow:0 8px 22px rgba(17,24,39,.08)}
  .rs-teaser-row{height:46px; border-radius:12px; background:#fff}
  .skeleton{position:relative; overflow:hidden}
  .skeleton::after{content:''; position:absolute; inset:0; background:linear-gradient(90deg, rgba(0,0,0,0), rgba(17,24,39,.06), rgba(0,0,0,0)); transform:translateX(-100%); animation:shimmer 1.4s infinite}
  @keyframes shimmer{to{transform:translateX(100%)}}

  /* RESULTS */
  .rs-results-bar{display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:18px}
  .rs-h2{font-size:34px; margin:0 0 2px}
  .rs-line{font-size:16px}
  .rs-dim{color:var(--muted)}
  .rs-tabs{display:flex; gap:8px; align-items:center}
  .rs-tab{background:#fff; color:#111; border:none; padding:8px 12px; border-radius:12px; cursor:pointer; box-shadow:0 6px 18px rgba(17,24,39,.1)}
  .rs-tab.active{outline:3px solid rgba(255,255,255,.35)}
  .rs-filters{display:flex; flex-wrap:wrap; gap:16px; background:rgba(255,255,255,.08); padding:14px; border-radius:16px; margin-bottom:16px}
  .rs-filter{display:flex; flex-direction:column; gap:6px}
  .rs-check{display:flex; align-items:center; gap:8px}

  .rs-split{display:grid; gap:16px}
  .rs-split.list{grid-template-columns:1fr}
  .rs-split.map{grid-template-columns:1fr}
  .rs-split.split{grid-template-columns:1.1fr 1fr}

  .rs-list{display:flex; flex-direction:column; gap:12px; min-height:200px}
  .rs-list.compact{gap:10px}

  .rs-empty{display:grid; place-items:center; padding:40px 10px; text-align:center; gap:10px; background:rgba(255,255,255,.06); border-radius:16px}
  .rs-emoji{font-size:48px}

  /* COMPACT ROW CARD */
  .rs-rowcard{background:#fff; color:#111; border-radius:14px; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; gap:10px; box-shadow:0 12px 28px rgba(17,24,39,.08); animation:fadeIn .25s ease both}
  .rs-rowcard.selected{outline:3px solid #7b5cf3}
  .rs-row-left{display:flex; align-items:center; gap:10px}
  .rs-avatar{width:44px; height:44px; border-radius:999px}
  .rs-avatar.sm{width:36px; height:36px}
  .rs-row-name{font-weight:700}
  .rs-row-sub{display:flex; align-items:center; gap:6px; color:#6b7280; font-size:13px}
  .rs-star{color:#f59e0b}
  .rs-dotsep{opacity:.6}
  .rs-row-right{text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:2px}
  .rs-price-lg{font-size:20px; font-weight:800}
  .rs-mini-book{background:#111; color:#fff; border:none; padding:6px 10px; border-radius:999px; cursor:pointer; font-size:12px; display:none}
  .rs-rowcard:hover .rs-mini-book{display:inline-block}
  .rs-rowcard.unavailable{opacity:.7}
  @keyframes fadeIn{from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:none)}

  /* LEGACY RIDE CARD (unchanged styles) */
  .rs-ride{background:#fff; color:#111; border-radius:16px; padding:14px; animation:fadeIn .3s ease both}
  .rs-ride.selected{outline:3px solid #7b5cf3}
  .rs-ride-top{display:flex; justify-content:space-between; gap:12px}
  .rs-driver{display:flex; gap:10px; align-items:center}
  .rs-driver-name{font-weight:700}
  .rs-pricebox{text-align:right}
  .rs-badge{margin-top:6px; background:#ffe9a8; padding:2px 8px; border-radius:999px; font-size:12px; display:inline-block}
  .rs-times{display:grid; grid-template-columns:1fr 120px 1fr; align-items:center; padding:8px 0}
  .rs-mid{text-align:center}
  .rs-time{font-weight:700}
  .rs-route{display:flex; gap:8px; align-items:center; flex-wrap:wrap; padding:6px 0}
  .rs-dot{width:8px; height:8px; border-radius:999px}
  .rs-dot.start{background:#4f46e5}
  .rs-dot.via{background:#0ea5e9}
  .rs-dot.end{background:#ef4444}
  .rs-loc{font-size:14px}
  .rs-meta{display:flex; gap:12px; flex-wrap:wrap; justify-content:space-between; color:#333; border-top:1px dashed #e6e6e6; padding-top:10px; margin-top:6px}
  .rs-tags{display:flex; gap:6px; flex-wrap:wrap}
  .rs-tag{background:#f1f1ff; padding:2px 8px; border-radius:999px; font-size:12px}
  .rs-ride-actions{display:flex; justify-content:flex-end; gap:8px; margin-top:10px}

  /* TOASTS */
  .rs-toast{position:fixed; right:18px; bottom:18px; background:#fff; color:#111; padding:12px 14px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.25); display:flex; gap:10px; align-items:flex-start}
  .rs-toast.error{border-left:6px solid #ef4444}
  .rs-toast.success{border-left:6px solid #22c55e}
  .rs-toast .rs-x{position:static; color:#333}

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .rs-page { padding: 16px 0; }
    .rs-main { padding: 0 16px; }
    .rs-hero-grid { grid-template-columns: 1fr; }
    .rs-header { padding: 0 16px; }
    .rs-h1 { font-size: 32px; }
    .rs-h2 { font-size: 28px; }
    .rs-results-bar { flex-direction: column; align-items: flex-start; gap: 12px; }
    .rs-split.split { grid-template-columns: 1fr; }
    .rs-filters { flex-direction: column; }
    .rs-mini-book{display:inline-block}
  }
  `}</style>
);

export default FindRides;