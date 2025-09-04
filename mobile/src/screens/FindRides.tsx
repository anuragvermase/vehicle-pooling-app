// src/screens/FindRides.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import Constants from "expo-constants";
import { RideAPI, asMessage, RideDto } from "../services/api";
import LocationInput from "../../components/LocationInput";
import { PlaceLite, geocodeText } from "../services/places";
import EnhancedMap from "../../components/EnhancedMap";

const SCREEN = Dimensions.get("window");
const MAP_HEIGHT = Math.min(320, SCREEN.height * 0.4);

// Ensure a PlaceLite has lat/lng (for typed text without selection)
async function ensureCoords(p: PlaceLite | null): Promise<PlaceLite | null> {
  if (!p) return null;
  if (typeof p.lat === "number" && typeof p.lng === "number") return p;
  const g = await geocodeText(p.text);
  return g ?? p;
}

// ---- component -------------------------------------------------------------
export default function FindRides({ route }: any) {
  // Expecting full objects from Landing; but we’ll harden here too
  const initialFrom = route?.params?.from as PlaceLite | undefined;
  const initialTo = route?.params?.to as PlaceLite | undefined;

  const [from, setFrom] = useState<PlaceLite | null>(initialFrom ?? null);
  const [to, setTo] = useState<PlaceLite | null>(initialTo ?? null);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<RideDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  const resolvingRef = useRef(false); // prevent loops while geocoding

  const initialRegion = useMemo(
    () => ({ latitude: 28.6139, longitude: 77.2090, latitudeDelta: 0.5, longitudeDelta: 0.5 }),
    []
  );

  // 1) If user typed only text, geocode to get lat/lng
  useEffect(() => {
    (async () => {
      if (resolvingRef.current) return;
      let changed = false;
      if (from && (from.lat == null || from.lng == null)) {
        resolvingRef.current = true;
        const g = await ensureCoords(from);
        if (g && (g.lat != null && g.lng != null)) { setFrom(g); changed = true; }
        resolvingRef.current = false;
      }
      if (to && (to.lat == null || to.lng == null)) {
        resolvingRef.current = true;
        const g = await ensureCoords(to);
        if (g && (g.lat != null && g.lng != null)) { setTo(g); changed = true; }
        resolvingRef.current = false;
      }
    })();
  }, [from?.text, to?.text]);

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

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#0B0F14" }}
      behavior={Platform.select({ ios: "padding", android: undefined })}>
      <EnhancedMap
        height={MAP_HEIGHT}
        center={{ lat: initialRegion.latitude, lng: initialRegion.longitude }}
        showDirections={!!(from?.lat != null && from?.lng != null && to?.lat != null && to?.lng != null)}
        origin={from?.lat != null && from?.lng != null ? { lat: from.lat!, lng: from.lng! } : null}
        destination={to?.lat != null && to?.lng != null ? { lat: to.lat!, lng: to.lng! } : null}
        onRouteInfo={(info) => {
          setDistanceText(info?.distanceText || "");
          setDurationText(info?.durationText || "");
        }}
      />

      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "800", marginBottom: 12 }}>
          Plan your trip
        </Text>

        <LocationInput value={from} onChange={setFrom} placeholder="From" />
        <View style={{ height: 10 }} />
        <LocationInput value={to} onChange={setTo} placeholder="To" />

        {distanceText || durationText ? (
          <Text style={{ color: "#c7d2fe", marginTop: 8 }}>
            {distanceText} • {durationText}
          </Text>
        ) : null}

        <Pressable onPress={search} disabled={!from || !to}
          style={{ backgroundColor: !from || !to ? "#3A4B63" : "#22c55e", padding: 16, borderRadius: 30, marginTop: 14, alignItems: "center" }}>
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
                <Text style={{ color: "#c7d2fe", marginTop: 4 }}>
                  {new Date(item.departureTime).toLocaleString()}
                </Text>
                <Text style={{ color: "#c7d2fe", marginTop: 4 }}>
                  ₹ {item.pricePerSeat} • {item.availableSeats} seat(s)
                </Text>
                {item.driver?.name ? (
                  <Text style={{ color: "#9ca3af", marginTop: 2 }}>Driver: {item.driver.name}</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
