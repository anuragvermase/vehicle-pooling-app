import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Storage } from "./storage";

/** Normalize localhost for Android emulator */
function normalizeBase(url: string) {
  if (!url) return url;
  // If someone puts localhost/127.0.0.1, map it to 10.0.2.2 on Android
  if (Platform.OS === "android") {
    const m = url.match(/^http:\/\/(localhost|127\.0\.0\.1)(?::(\d+))?(\/.*)?$/i);
    if (m) {
      const port = m[2] || "5000";
      const rest = m[3] || "/api";
      return `http://10.0.2.2:${port}${rest}`;
    }
  }
  return url;
}

/** Base URL: prefer runtime env, then app config, then safe fallback */
const RUNTIME = (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) || "";
const EXTRA   = (((Constants?.expoConfig?.extra as any) || {}).EXPO_PUBLIC_API_BASE_URL as string | undefined) || "";

export const API_BASE_URL: string =
<<<<<<< HEAD
  normalizeBase(RUNTIME) ||
  normalizeBase(EXTRA)   ||
  (Platform.OS === "android" ? "http://10.0.2.2:5000/api" : "http://localhost:5000/api");
=======
  ((Constants?.expoConfig?.extra as any)?.API_BASE_URL as string) ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://10.0.2.2:5001/api"; // emulator-safe fallback
>>>>>>> 49da7f3afa688b6b73d8649320a99b3cb4523c4e

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
    (config.headers as any)["x-auth-token"] = token;
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
async function getWithFallback<T>(paths: string[], params?: any): Promise<T> {
  let lastErr: any;
  for (const p of paths) {
    try {
      return await unwrap<T>(http.get(p, { params }));
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/** POST with fallbacks */
async function postWithFallback<T>(paths: string[], body?: any): Promise<T> {
  let lastErr: any;
  for (const p of paths) {
    try {
      return await unwrap<T>(http.post(p, body));
    } catch (e) {
      lastErr = e;
    }
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
export type RideDto = {
  _id: string;
  startLocation?: { name?: string };
  endLocation?: { name?: string };
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  driver?: { name?: string };
};

async function getFirst<T>(paths: string[], params?: any): Promise<T> {
  return getWithFallback<T>(paths, params);
}
async function postFirst<T>(paths: string[], body?: any): Promise<T> {
  return postWithFallback<T>(paths, body);
}

export const RideAPI = {
  /** Search rides (GET first, fallback to POST) */
  async list(q: any): Promise<RideDto[]> {
    const getPaths = ["/rides/search", "/rides", "/rides/list"];
    try {
      return await getFirst<RideDto[]>(getPaths, q);
    } catch {
      const postPaths = ["/rides/search", "/rides/list", "/rides"];
      return await postFirst<RideDto[]>(postPaths, q);
    }
  },

  /** Create/offer a ride (with graceful path fallbacks) */
  async create(body: any): Promise<any> {
    const postPaths = ["/rides/create", "/rides", "/rides/new"];
    return await postFirst<any>(postPaths, body);
  },

  async upcomingMe(): Promise<any | null> {
    try {
      const { data } = await http.get("/rides/upcoming/me");
      return data?.ride ?? data ?? null;
    } catch {
      return null;
    }
  },
};
