// src/components/maps/EnhancedMapDark.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  Circle,
  OverlayView,
} from "@react-google-maps/api";

const libraries = ["places", "geometry"];
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }; // Bengaluru
const FALLBACK_ZOOM = 12;

/** Geolocation tuning */
const MAX_SAMPLES = 6;               // gather up to this many readings
const LOCATION_TIMEOUT_MS = 20000;   // cap the watch
const ACCURACY_GOAL_METERS = 50;     // stop early when we hit this
const ACCEPTABLE_ACCURACY = 200;     // only center if <= this (good enough)
const POOR_ACCURACY = 500;           // warn if worse than this
const TELEPORT_KM = 50;              // reject fixes > 50 km away from last good

export default function EnhancedMapDark({
  rides = [],
  selectedRide = null,
  onRideSelect,
  center = DEFAULT_CENTER,
  zoom = 11,
  showDirections = false,
  origin = null,
  destination = null,
  viaPoints = [],
  onMapClick,
  isInteractive = true,
  userLocation = null,
  height = "380px",
}) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // User location & UI state
  const [currentUserLocation, setCurrentUserLocation] = useState(userLocation);
  const [lastGoodLocation, setLastGoodLocation] = useState(userLocation || null);
  const [accuracy, setAccuracy] = useState(null);
  const [activeCenter, setActiveCenter] = useState(center || DEFAULT_CENTER);
  const [activeZoom, setActiveZoom] = useState(zoom);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [geoWarn, setGeoWarn] = useState(null);

  const isSecureContext =
    typeof window !== "undefined" &&
    (window.location.protocol === "https:" || window.location.hostname === "localhost");

  // --- Dark map style ---
  const darkMapStyles = useMemo(
    () => [
      { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#1f2937" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#9aa2af" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#9aa2af" }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1b2533" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#2b3544" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9aa2af" }] },
      { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#2b3544" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#374151" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#111827" }] },
    ],
    []
  );

  const mapContainerStyle = {
    width: "100%",
    height,
    borderRadius: "20px",
    position: "relative",
  };

  // ---------- Utils ----------
  const centerOn = useCallback((pos, z = 15) => {
    setActiveCenter(pos);
    setActiveZoom(z);
    const gm = window.google?.maps;
    if (mapRef.current && gm) {
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(z);
    }
  }, []);

  const kmDist = (a, b) => {
    if (!a || !b) return Infinity;
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s1 =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
    return R * c;
  };

  /** STRICT geolocation: fresh samples, high accuracy, keep best, early stop */
  const acquireBestLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ error: "Geolocation not supported" });
        return;
      }

      const opts = {
        enableHighAccuracy: true,
        timeout: LOCATION_TIMEOUT_MS,
        maximumAge: 0, // FORCE FRESH
      };

      let best = null; // { coords, accuracy }
      let samples = 0;
      let watchId = null;
      let stopped = false;

      const stop = () => {
        if (stopped) return;
        stopped = true;
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        resolve(best || { error: "No location fix" });
      };

      const hardTimer = setTimeout(stop, LOCATION_TIMEOUT_MS);

      watchId = navigator.geolocation.watchPosition(
        (p) => {
          const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
          const acc = typeof p.coords.accuracy === "number" ? p.coords.accuracy : null;

          // Reject obvious teleports relative to last good fix (IP-based jumps)
          if (lastGoodLocation && kmDist(lastGoodLocation, coords) > TELEPORT_KM) {
            // ignore this sample
          } else {
            if (!best || (acc !== null && acc < (best.accuracy ?? Infinity))) {
              best = { coords, accuracy: acc };
            }
          }

          samples += 1;

          // Stop early if goal met, else after MAX_SAMPLES
          if ((acc !== null && acc <= ACCURACY_GOAL_METERS) || samples >= MAX_SAMPLES) {
            clearTimeout(hardTimer);
            stop();
          }
        },
        () => {
          clearTimeout(hardTimer);
          stop();
        },
        opts
      );
    });
  }, [lastGoodLocation]);

  const locateMe = useCallback(async () => {
    setLocating(true);
    setGeoError(null);
    setGeoWarn(null);
    try {
      const perm = await (navigator.permissions?.query({ name: "geolocation" }).catch(() => null));
      if (perm && perm.state === "denied") {
        setGeoError("Location permission denied. Enable precise location.");
        // Do not recenter on a denied/unknown fix
        return;
      }

      const result = await acquireBestLocation();

      if (result?.error) {
        setGeoError("Couldn't determine location.");
        return;
      }

      const { coords, accuracy: acc } = result;
      const coarse = acc == null || acc > ACCEPTABLE_ACCURACY;

      if (coarse) {
        // If we already have a last good fix, keep it and just warn.
        if (lastGoodLocation) {
          setGeoWarn("Low-accuracy fix ignored (enable Precise location / Wi-Fi). Keeping last good position.");
          setAccuracy(acc ?? null);
          return; // DO NOT recenter on the coarse reading
        }
        // Otherwise, allow a gentle center but don't zoom too close
        setGeoWarn("Low-accuracy location (enable Precise location / Wi-Fi).");
        setCurrentUserLocation(coords);
        setAccuracy(acc ?? null);
        centerOn(coords, 13);
        return;
      }

      // Good fix — accept & persist
      setCurrentUserLocation(coords);
      setLastGoodLocation(coords);
      setAccuracy(acc ?? null);
      centerOn(coords, acc && acc < 30 ? 17 : 15);
    } finally {
      setLocating(false);
    }
  }, [acquireBestLocation, centerOn, lastGoodLocation]);

  // Auto-locate first time (only on HTTPS/localhost)
  useEffect(() => {
    if (!currentUserLocation && isSecureContext) {
      locateMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSecureContext]);

  // If a good location later updates, re-center
  useEffect(() => {
    if (currentUserLocation) centerOn(currentUserLocation, 15);
  }, [currentUserLocation, centerOn]);

  // ---------- Directions ----------
  const calculateRoute = useCallback(async () => {
    const gm = window.google?.maps;
    if (!gm || !origin || !destination) return;
    const directionsService = new gm.DirectionsService();
    const waypoints = (viaPoints || []).map((pt) => ({
      location: { lat: pt.lat, lng: pt.lng },
      stopover: true,
    }));
    try {
      const results = await directionsService.route({
        origin,
        destination,
        waypoints,
        travelMode: gm.TravelMode.DRIVING,
        optimizeWaypoints: true,
        provideRouteAlternatives: false,
      });
      setDirectionsResponse(results);
    } catch (err) {
      console.error("Directions error:", err);
      setDirectionsResponse(null);
    }
  }, [origin, destination, viaPoints]);

  useEffect(() => {
    if (!isLoaded) return;
    if (showDirections && origin && destination) calculateRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, origin, destination, viaPoints, showDirections]);

  // ---------- Map lifecycle ----------
  const onLoad = useCallback((m) => {
    setMap(m);
    mapRef.current = m;
  }, []);
  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  // ---------- Safe icon builders ----------
  const buildSize = (w, h) => {
    const gm = window.google?.maps;
    return gm ? new gm.Size(w, h) : undefined;
  };
  const buildPoint = (x, y) => {
    const gm = window.google?.maps;
    return gm ? new gm.Point(x, y) : undefined;
  };

  const getRideMarkerIcon = (ride, isSelected) => {
    const price = ride.currentPrice || ride.pricePerSeat || ride.price || 0;
    const color = isSelected ? "4F46E5" : "10B981";
    const svg =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg width='50' height='50' xmlns='http://www.w3.org/2000/svg'>
          <circle cx='25' cy='25' r='22' fill='#${color}' stroke='white' stroke-width='3'/>
          <text x='25' y='30' text-anchor='middle' fill='white' font-size='10' font-weight='bold'>₹${price}</text>
        </svg>`
      );
    return {
      url: svg,
      scaledSize: buildSize(50, 50),
      origin: buildPoint(0, 0),
      anchor: buildPoint(25, 25),
    };
  };

  const userIcon = {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg width='26' height='26' xmlns='http://www.w3.org/2000/svg'>
          <circle cx='13' cy='13' r='11' fill='#4285F4' stroke='white' stroke-width='2'/>
          <circle cx='13' cy='13' r='3.5' fill='white'/>
        </svg>`
      ),
    get scaledSize() {
      return buildSize(26, 26);
    },
    get origin() {
      return buildPoint(0, 0);
    },
    get anchor() {
      return buildPoint(13, 13);
    },
  };

  // ---------- Render ----------
  if (!isLoaded) {
    return (
      <div
        style={{
          ...mapContainerStyle,
          display: "grid",
          placeItems: "center",
          background: "#0f172a",
          border: "1px solid #1f2937",
        }}
      >
        <div style={{ color: "#9ca3af" }}>Loading Google Maps…</div>
      </div>
    );
  }

  // Pixel offset for OverlayView label (place above marker)
  const labelOffset = (width = 0, height = 0) => ({
    x: -Math.round((width || 96) / 2),
    y: -(height || 28) - 18,
  });

  return (
    <div style={{ position: "relative" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={activeCenter}
        zoom={activeZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: isInteractive ? "cooperative" : "none",
          styles: darkMapStyles,
          backgroundColor: "#0f172a",
        }}
      >
        {/* User location marker + accuracy circle */}
        {currentUserLocation && (
          <>
            <Marker position={currentUserLocation} icon={userIcon} title="Your location" zIndex={1000} />
            {typeof accuracy === "number" && accuracy > 0 && (
              <>
                <Circle
                  center={currentUserLocation}
                  radius={accuracy}
                  options={{ strokeOpacity: 0.45, fillOpacity: 0.18 }}
                />
                {/* Accuracy label only when not terrible */}
                {accuracy <= POOR_ACCURACY && (
                  <OverlayView
                    position={currentUserLocation}
                    mapPaneName={OverlayView.FLOAT_PANE}
                    getPixelPositionOffset={() => labelOffset(110, 28)}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: "white",
                        color: "#111",
                        boxShadow: "0 6px 20px rgba(0,0,0,.25)",
                        pointerEvents: "none",
                        border: "1px solid rgba(0,0,0,.08)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Accuracy: ±{Math.round(accuracy)} m
                    </div>
                  </OverlayView>
                )}
              </>
            )}
          </>
        )}

        {/* Ride markers */}
        {Array.isArray(rides) &&
          rides.map((ride) => {
            const pos =
              ride?.startLocation?.coordinates ||
              ride?.coordinates ||
              ride?.startLocation ||
              null;
            if (!pos?.lat || !pos?.lng) return null;

            const isSelected =
              (selectedRide?._id && selectedRide?._id === ride._id) ||
              (selectedRide?.id && selectedRide?.id === ride.id);

            return (
              <Marker
                key={ride._id || ride.id}
                position={{ lat: pos.lat, lng: pos.lng }}
                icon={getRideMarkerIcon(ride, isSelected)}
                onClick={() => {
                  setSelectedMarker(ride._id || ride.id);
                  onRideSelect && onRideSelect(ride);
                }}
                title={`${ride?.startLocation?.name || ride?.from} → ${ride?.endLocation?.name || ride?.to}`}
              />
            );
          })}

        {/* Via points */}
        {viaPoints?.map((pt, i) => (
          <Marker
            key={`via-${i}`}
            position={{ lat: pt.lat, lng: pt.lng }}
            icon={{
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(
                  `<svg width='30' height='30' xmlns='http://www.w3.org/2000/svg'>
                    <circle cx='15' cy='15' r='12' fill='#F59E0B' stroke='white' stroke-width='2'/>
                    <text x='15' y='20' text-anchor='middle' fill='white' font-size='10' font-weight='bold'>${i + 1}</text>
                  </svg>`
                ),
              scaledSize: buildSize(30, 30),
              anchor: buildPoint(15, 15),
            }}
            title={`Stop ${i + 1}`}
          />
        ))}

        {/* Selected ride info */}
        {selectedMarker && selectedRide && (
          <InfoWindow
            position={{
              lat:
                selectedRide?.startLocation?.coordinates?.lat ||
                selectedRide?.coordinates?.lat,
              lng:
                selectedRide?.startLocation?.coordinates?.lng ||
                selectedRide?.coordinates?.lng,
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ minWidth: 200 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {selectedRide?.startLocation?.name || selectedRide?.from} →{" "}
                {selectedRide?.endLocation?.name || selectedRide?.to}
              </div>
              <div style={{ fontSize: 13, color: "#111" }}>
                <div>👤 {selectedRide?.driver?.name || "Driver"}</div>
                <div>⭐ {selectedRide?.driver?.rating?.average || selectedRide?.driver?.rating || 0}</div>
                <div>
                  ⏰{" "}
                  {selectedRide?.departureTime
                    ? new Date(selectedRide.departureTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </div>
                {typeof selectedRide?.availableSeats === "number" && (
                  <div>👥 {selectedRide.availableSeats} seats available</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {selectedRide?.driver?.phone && (
                  <button
                    onClick={() => window.open(`tel:${selectedRide.driver.phone}`)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    📞 Contact
                  </button>
                )}
                <button
                  onClick={() => {
                    // wire your book flow
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 10,
                    border: "none",
                    background: "#4F46E5",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  🎫 Book
                </button>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Directions */}
        {directionsResponse && showDirections && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: false,
              polylineOptions: { strokeColor: "#4F46E5", strokeWeight: 4, strokeOpacity: 0.85 },
            }}
          />
        )}
      </GoogleMap>

      {/* Floating controls */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          gap: 8,
          zIndex: 2,
        }}
      >
        <button
          onClick={locateMe}
          disabled={locating}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
          title="Center on my location"
        >
          {locating ? "Getting precise…" : "Locate me"}
        </button>
      </div>

      {/* Non-fatal notices */}
      {(geoError || geoWarn) && (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            padding: "6px 10px",
            borderRadius: 10,
            background: geoError ? "#ef4444" : "#f59e0b",
            color: "white",
            zIndex: 2,
          }}
        >
          {geoError || geoWarn}
        </div>
      )}
    </div>
  );
}