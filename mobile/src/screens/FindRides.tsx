// mobile/src/screens/FindRides.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View, Text, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { RideAPI, asMessage } from "../services/api";
import LocationInput from "../../components/LocationInput";
import { PlaceLite } from "../services/places";
import * as Location from "expo-location";

const SCREEN = Dimensions.get("window");
const MAP_HEIGHT = Math.min(320, SCREEN.height * 0.4);

// Use runtime env for JS calls (Directions API)
const GMAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "";

/* -------- helpers -------- */
type LatLng = { latitude: number; longitude: number };

function toLatLng(p?: PlaceLite | null): LatLng | null {
  if (p && typeof p.lat === "number" && typeof p.lng === "number") {
    return { latitude: p.lat, longitude: p.lng };
  }
  return null;
}

// tiny polyline decoder
function decodePolyline(encoded: string): LatLng[] {
  let index = 0, lat = 0, lng = 0, points: LatLng[] = [];
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

async function getDirections(a: LatLng, b: LatLng) {
  if (!GMAPS_KEY) return null;
  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${a.latitude},${a.longitude}&destination=${b.latitude},${b.longitude}` +
    `&mode=driving&key=${GMAPS_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  const route = json?.routes?.[0];
  if (!route) return null;
  const leg = route.legs?.[0];
  return {
    coords: decodePolyline(route.overview_polyline?.points || ""),
    distanceText: leg?.distance?.text || "",
    durationText: leg?.duration?.text || "",
  };
}

/* -------- screen -------- */
export default function FindRides({ route }: any) {
  const initialFrom = route?.params?.from as PlaceLite | undefined;
  const initialTo = route?.params?.to as PlaceLite | undefined;

  const [from, setFrom] = useState<PlaceLite | null>(initialFrom ?? null);
  const [to, setTo] = useState<PlaceLite | null>(initialTo ?? null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");

  const mapRef = useRef<MapView | null>(null);

  const [initialRegion, setInitialRegion] = useState({
    latitude: 28.6139, longitude: 77.2090, latitudeDelta: 0.5, longitudeDelta: 0.5,
  });

  // Center map on user if permitted
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setInitialRegion({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          });
        }
      } catch {}
    })();
  }, []);

  const fitMap = useCallback((A?: LatLng | null, B?: LatLng | null) => {
    const a = A ?? toLatLng(from);
    const b = B ?? toLatLng(to);
    if (a && b && mapRef.current) {
      mapRef.current.fitToCoordinates([a, b], {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    } else if (a && mapRef.current) {
      mapRef.current.animateToRegion({ ...a, latitudeDelta: 0.08, longitudeDelta: 0.08 });
    }
  }, [from, to]);

  // when both sides available -> draw route
  useEffect(() => {
    (async () => {
      const A = toLatLng(from);
      const B = toLatLng(to);
      setRouteCoords([]); setDistanceText(""); setDurationText("");
      if (A && B) {
        try {
          const r = await getDirections(A, B);
          if (r) {
            setRouteCoords(r.coords);
            setDistanceText(r.distanceText);
            setDurationText(r.durationText);
            fitMap(A, B);
          }
        } catch {}
      } else if (A) {
        fitMap(A, null);
      }
    })();
  }, [from?.lat, from?.lng, to?.lat, to?.lng, fitMap]);

  const search = async () => {
    setError(null); setList(null);
    try {
      setLoading(true);
      const payload: any = {
        from: from?.text, to: to?.text,
        fromLat: from?.lat, fromLng: from?.lng,
        toLat: to?.lat, toLng: to?.lng,
      };
      const data = await RideAPI.list(payload);
      setList(data || []);
    } catch (e) {
      setError(asMessage(e)); setList([]);
    } finally {
      setLoading(false);
    }
  };

  const pin = (p: PlaceLite | null, color: string) =>
    p && typeof p.lat === "number" && typeof p.lng === "number" ? (
      <Marker coordinate={{ latitude: p.lat!, longitude: p.lng! }} pinColor={color} />
    ) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0B0F14" }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width: "100%", height: MAP_HEIGHT }}
        initialRegion={initialRegion}
        onMapReady={() => fitMap()}
      >
        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={5} />}
        {pin(from, "#22c55e")}
        {pin(to, "#3b82f6")}
      </MapView>

      {/* Panel */}
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Plan your trip</Text>

        <LocationInput value={from} onChange={setFrom} placeholder="From" dark />
        <View style={{ height: 10 }} />
        <LocationInput value={to} onChange={setTo} placeholder="To" dark />

        {distanceText || durationText ? (
          <Text style={{ color: "#c7d2fe", marginTop: 8 }}>
            {distanceText} • {durationText}
          </Text>
        ) : null}

        <Pressable
          onPress={search}
          disabled={!from || !to}
          style={{
            backgroundColor: !from || !to ? "#3A4B63" : "#22c55e",
            padding: 16,
            borderRadius: 30,
            marginTop: 14,
            alignItems: "center",
          }}
        >
          {loading ? <ActivityIndicator color="#0B0F14" /> : <Text style={{ color: "#0B0F14", fontWeight: "800", fontSize: 16 }}>🚀 Search Ride</Text>}
        </Pressable>

        <View style={{ height: 12 }} />
        {error ? (
          <Text style={{ color: "#FF7B7B", textAlign: "center" }}>{error}</Text>
        ) : list === null && loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : list && list.length === 0 ? (
          <Text style={{ color: "#c7d2fe", textAlign: "center" }}>No rides found</Text>
        ) : (
          <FlatList
            data={list || []}
            keyExtractor={(i) => i._id}
            renderItem={({ item }) => (
              <View style={{ backgroundColor: "#12161C", padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "#23314a" }}>
                <Text style={{ color: "white", fontWeight: "700" }}>
                  {item.startLocation?.name} → {item.endLocation?.name}
                </Text>
                <Text style={{ color: "#c7d2fe", marginTop: 4 }}>{new Date(item.departureTime).toLocaleString()}</Text>
                <Text style={{ color: "#c7d2fe", marginTop: 4 }}>₹ {item.pricePerSeat} • {item.availableSeats} seat(s)</Text>
                {item.driver?.name ? <Text style={{ color: "#9ca3af", marginTop: 2 }}>Driver: {item.driver.name}</Text> : null}
              </View>
            )}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
