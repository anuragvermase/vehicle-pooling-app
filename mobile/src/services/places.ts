// src/services/places.ts
import Constants from "expo-constants";

export type PlaceLite = {
  place_id?: string;
  text: string;
  lat?: number;
  lng?: number;
  address?: string;
};

type Prediction = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

const KEY: string =
  ((Constants?.expoConfig?.extra as any)?.GOOGLE_MAPS_API_KEY as string) || "";

const PLACE_BASE = "https://maps.googleapis.com/maps/api/place";
const GEOCODE_BASE = "https://maps.googleapis.com/maps/api/geocode";

const makeSessionToken = () =>
  Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

export async function autocomplete(
  input: string,
  sessionToken?: string,
  bias?: { lat: number; lng: number } | null
) {
  if (!input.trim()) return [];
  if (!KEY) return [{ description: input, place_id: `typed:${input}` }];

  const params = new URLSearchParams({
    input,
    key: KEY,
    components: "country:in",
    types: "geocode",
  });

  if (sessionToken) params.append("sessiontoken", sessionToken);
  if (bias?.lat && bias?.lng) {
    params.append("location", `${bias.lat},${bias.lng}`);
    params.append("radius", String(30000));
  }

  const url = `${PLACE_BASE}/autocomplete/json?${params.toString()}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json?.status !== "OK") {
      return [{ description: input, place_id: `typed:${input}` }];
    }
    const preds: Prediction[] = json?.predictions || [];
    return preds.map((p) => ({
      description: p.description,
      place_id: p.place_id,
      structured_formatting: p.structured_formatting,
    }));
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

  const fields = "name,formatted_address,geometry,place_id";
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
      text: r.name || r.formatted_address,
      address: r.formatted_address,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
    } as PlaceLite;
  } catch {
    return null;
  }
}

// Geocode a free-typed address into lat/lng
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

// Reverse geocode lat/lng -> address/name
export async function reverseGeocode(lat: number, lng: number): Promise<PlaceLite | null> {
  if (!KEY) return null;
  const url = `${GEOCODE_BASE}/json?latlng=${lat},${lng}&key=${KEY}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    const r = json?.results?.[0];
    if (!r) return null;
    return {
      place_id: r.place_id,
      text: r.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      address: r.formatted_address,
      lat,
      lng,
    };
  } catch {
    return null;
  }
}

export const PlacesSession = { new: makeSessionToken };
