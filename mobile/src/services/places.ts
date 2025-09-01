// src/services/places.ts
import Constants from "expo-constants";

export type PlaceLite = {
  place_id?: string;
  text: string;
  lat?: number;
  lng?: number;
  address?: string;
};

const KEY: string =
  ((Constants?.expoConfig?.extra as any)?.GOOGLE_MAPS_API_KEY as string) || "";

const PLACE_BASE = "https://maps.googleapis.com/maps/api/place";
const GEOCODE_BASE = "https://maps.googleapis.com/maps/api/geocode";
const makeSessionToken = () =>
  Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

export async function autocomplete(input: string, sessionToken?: string) {
  if (!input.trim()) return [];
  if (!KEY) return [{ description: input, place_id: `typed:${input}` }];

  const url = `${PLACE_BASE}/autocomplete/json?input=${encodeURIComponent(
    input
  )}&types=geocode&components=country:in&key=${KEY}${
    sessionToken ? `&sessiontoken=${sessionToken}` : ""
  }`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json?.status !== "OK") {
      return [{ description: input, place_id: `typed:${input}` }];
    }
    return (json?.predictions || []) as Array<{ description: string; place_id: string }>;
  } catch {
    return [{ description: input, place_id: `typed:${input}` }];
  }
}

export async function details(placeId: string, sessionToken?: string) {
  if (placeId.startsWith("typed:")) {
    const text = placeId.slice("typed:".length);
    return { text } as PlaceLite;
  }
  if (!KEY) return null;

  const fields = "name,formatted_address,geometry/location,place_id";
  const url = `${PLACE_BASE}/details/json?place_id=${encodeURIComponent(
    placeId
  )}&fields=${fields}&key=${KEY}${sessionToken ? `&sessiontoken=${sessionToken}` : ""}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    const r = json?.result;
    if (!r) return null;
    return {
      place_id: r.place_id,
      text: r.name,
      address: r.formatted_address,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
    } as PlaceLite;
  } catch {
    return null;
  }
}

// NEW: Geocode a free-typed address into lat/lng (so map can show pins)
export async function geocodeText(query: string) {
  if (!KEY || !query.trim()) return null;
  const url = `${GEOCODE_BASE}/json?address=${encodeURIComponent(query)}&key=${KEY}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    const r = json?.results?.[0];
    if (!r) return null;
    return {
      place_id: r.place_id,
      text: r.formatted_address || query,
      address: r.formatted_address,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
    } as PlaceLite;
  } catch {
    return null;
  }
}

export const PlacesSession = { new: makeSessionToken };
