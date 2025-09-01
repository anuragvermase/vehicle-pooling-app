// src/services/auth.ts
import { AuthAPI } from "./api";
import { Storage } from "./storage";

// ---------------- token helpers ----------------
function pickToken(d: any): string | null {
  return (
    d?.accessToken ||
    d?.token ||
    d?.access_token ||
    d?.jwt ||
    d?.data?.accessToken ||
    d?.data?.token ||
    d?.tokens?.access?.token ||
    null
  );
}

async function setToken(token: string) {
  await Storage.set?.("accessToken", String(token));
}
async function clearToken() {
  await Storage.del?.("accessToken");
}

// ---------------- user cache ----------------
const userOf = (raw: any) =>
  raw?.user ?? raw?.data?.user ?? raw?.data ?? raw?.profile ?? raw ?? null;

async function cacheUser(u: any) {
  try { await Storage.set?.("me", JSON.stringify(u)); } catch {}
}
async function getCachedUser(): Promise<any | null> {
  try {
    const v = await Storage.get?.("me");
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

// ------------- JWT fallback (no extra package) -------------
function base64UrlToBase64(input: string) {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  return pad ? b64 + "=".repeat(4 - pad) : b64;
}
async function decodeJwtPayload(): Promise<any | null> {
  try {
    const token = await Storage.get?.("accessToken");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const b64 = base64UrlToBase64(parts[1]);
    // use Buffer if available
    // @ts-ignore
    const json = (typeof Buffer !== "undefined")
      // @ts-ignore
      ? Buffer.from(b64, "base64").toString("utf8")
      // @ts-ignore
      : globalThis.atob
        // @ts-ignore
        ? decodeURIComponent(Array.prototype.map.call(globalThis.atob(b64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""))
        : null;
    return json ? JSON.parse(json) : null;
  } catch { return null; }
}

// ---------------- public API ----------------
export async function login(email: string, password: string) {
  // AuthAPI.login returns data directly (per your api.ts)
  const data = await AuthAPI.login(email, password);
  console.log("LOGIN RESPONSE =>", data);

  const token = pickToken(data);
  if (!token) throw new Error("No token in login response.");
  await setToken(token);

  const u = userOf(data);
  if (u) await cacheUser(u);

  return data;
}

export async function register(payload: {
  name: string; email: string; phone?: string;
  password: string; confirmPassword?: string; role?: string;
}) {
  const body = {
    name: payload.name,
    fullName: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    confirmPassword: payload.confirmPassword ?? payload.password,
    role: payload.role ?? "user",
  };
  const data = await AuthAPI.register(body);
  console.log("REGISTER RESPONSE =>", data);

  const token = pickToken(data);
  if (token) await setToken(token);

  const u = userOf(data);
  if (u) await cacheUser(u);

  return data;
}

export async function logout() {
  await clearToken();
  await Storage.del?.("me");
}

/**
 * Get current user, robust:
 *  1) try AuthAPI.me() (it already tries /auth/me, /users/me, /me, /profile)
 *  2) fall back to cached user from login/register
 *  3) fall back to JWT claims (name/email) so UI shows something meaningful
 */
export async function me() {
  try {
    const data = await AuthAPI.me();
    console.log("ME RESPONSE (AuthAPI.me or fallback) =>", data);
    const u = userOf(data);
    if (u) {
      await cacheUser(u);
      return data;
    }
  } catch (e) {
    console.log("AuthAPI.me failed, using cache/JWT…");
  }

  const cached = await getCachedUser();
  if (cached) {
    console.log("ME from cache =>", cached);
    return { user: cached };
  }

  const claims = await decodeJwtPayload();
  if (claims) {
    console.log("ME via JWT claims =>", claims);
    // Map common claim names to a user shape
    const user = {
      name: claims.name || claims.fullName || claims.given_name || claims.preferred_username,
      firstName: claims.given_name,
      lastName: claims.family_name,
      email: claims.email || claims.sub,
    };
    return { user };
  }

  return {};
}

// keep your existing import style happy
export const Auth = { login, register, logout, me };
