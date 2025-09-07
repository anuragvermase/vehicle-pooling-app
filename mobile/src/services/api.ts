// mobile/src/services/api.ts
import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import { Storage } from "./storage";

/** Base URL (prefer app.config.ts -> extra.API_BASE_URL) */
export const API_BASE_URL: string =
  ((Constants?.expoConfig?.extra as any)?.API_BASE_URL as string) ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://10.0.2.2:5001/api"; // emulator-safe fallback

const BASE = API_BASE_URL.replace(/\/$/, "");

export const http = axios.create({
  baseURL: BASE,
  timeout: 20000,
});

/** Read token regardless of Storage shape */
async function readToken(): Promise<string | null> {
  try {
    const gt = (Storage as any)?.getToken;
    if (typeof gt === "function") {
      const t = await gt();
      if (t) return String(t);
    }
    const g = (Storage as any)?.get;
    if (typeof g === "function") {
      const t = await g("accessToken");
      if (t) return String(t);
    }
  } catch {}
  return null;
}

/** Attach auth headers */
http.interceptors.request.use(async (config) => {
  const token = await readToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    (config.headers as any)["x-auth-token"] = token; // some servers use this
  }
  return config;
});

/** unwrap helper */
function unwrap<T>(p: Promise<{ data: T }>): Promise<T> {
  return p.then((r) => r.data);
}

/** nice error */
export function asMessage(err: unknown) {
  const e = err as AxiosError<any>;
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.response?.data?.error) return e.response.data.error;
  if (e?.message) return e.message;
  return "Something went wrong. Please try again.";
}

/** GET with fallbacks */
async function getWithFallback<T>(paths: string[]): Promise<T> {
  let lastErr: any;
  for (const p of paths) {
    try {
      return await unwrap<T>(http.get(p));
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

/* =========================
   AUTH API
   ========================= */
export const AuthAPI = {
  login(email: string, password: string) {
    return unwrap<any>(http.post("/auth/login", { email, password }));
  },
  register(body: any) {
    return unwrap<any>(http.post("/auth/register", body));
  },
  me() {
    return getWithFallback<any>(["/auth/me", "/users/me", "/me", "/profile"]);
  },
  google(idToken: string) {
    return unwrap<any>(http.post("/auth/google", { idToken }));
  },
  logout() {
    return unwrap<any>(http.post("/auth/logout"));
  },
};

/* =========================
   USER API (avatar/profile)
   ========================= */
export const UserAPI = {
  uploadAvatar(form: FormData) {
    return unwrap<{ success: boolean; url: string; user: any }>(
      http.post("/auth/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
  updateProfile(body: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
    profilePicture?: string;
    avatar?: string;
  }) {
    return unwrap<any>(http.put("/auth/profile", body));
  },
};

/* =========================
   RIDES API
   ========================= */

// Minimal shape used by FindRides UI
export type RideDto = {
  _id: string;
  startLocation?: { name?: string };
  endLocation?: { name?: string };
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  driver?: { name?: string };
};

// helper: GET with params across multiple paths
async function getFirst<T>(paths: string[], params?: any): Promise<T> {
  let lastErr: any;
  for (const p of paths) {
    try {
      return await unwrap<T>(http.get(p, { params }));
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

// helper: POST with same params (fallback if server expects body)
async function postFirst<T>(paths: string[], body?: any): Promise<T> {
  let lastErr: any;
  for (const p of paths) {
    try {
      return await unwrap<T>(http.post(p, body));
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

export const RideAPI = {
  /**
   * q can include: from, to, fromLat, fromLng, toLat, toLng, date, seats, etc.
   */
  async list(q: any): Promise<RideDto[]> {
    const getPaths = ["/rides/search", "/rides", "/rides/list"];
    try {
      return await getFirst<RideDto[]>(getPaths, q);
    } catch {
      const postPaths = ["/rides/search", "/rides/list", "/rides"];
      return await postFirst<RideDto[]>(postPaths, q);
    }
  },
  async upcomingMe(): Promise<any | null> {
    try {
      const { data } = await http.get("/rides/upcoming/me");
      return data?.ride ?? data ?? null;
    } catch { return null; }
  },
};
