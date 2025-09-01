// src/services/maps.ts
import Constants from "expo-constants";

export type LatLng = { latitude: number; longitude: number };

const KEY: string =
  ((Constants?.expoConfig?.extra as any)?.GOOGLE_MAPS_API_KEY as string) || "";

const DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json";

export function decodePolyline(encoded: string): LatLng[] {
  let index = 0, lat = 0, lng = 0, coordinates: LatLng[] = [];
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; }
    while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; }
    while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coordinates;
}

export async function getRoute(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number }
): Promise<{ points: LatLng[]; distanceText?: string; durationText?: string }> {
  if (!KEY) return { points: [] };
  const url = `${DIRECTIONS_URL}?origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&mode=driving&key=${KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  const route = json?.routes?.[0];
  if (!route) return { points: [] };
  const poly = route.overview_polyline?.points;
  const legs0 = route.legs?.[0];
  return {
    points: poly ? decodePolyline(poly) : [],
    distanceText: legs0?.distance?.text,
    durationText: legs0?.duration?.text,
  };
}
