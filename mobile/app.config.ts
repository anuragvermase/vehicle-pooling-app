// mobile/app.config.ts
import "dotenv/config";
import type { ExpoConfig } from "expo/config";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => {
  // Endpoints (prefer EXPO_PUBLIC_*; fallback to older names for local dev)
  const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://192.168.132.193:5000/api";
  const SOCKET = process.env.EXPO_PUBLIC_SOCKET_URL ?? process.env.SOCKET_URL ?? "http://192.168.132.193:5000";

  // Native Google Maps SDK keys (used at build time; require dev build)
  const ANDROID_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY || "";
  const IOS_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || "";

  // JS Places/Directions key: EXPO_PUBLIC_GOOGLE_PLACES_API_KEY (read at runtime)

  return {
    ...config,
    name: "carpool",
    slug: "carpool",
    scheme: "carpool",
    extra: {
      // Expose only non-sensitive app config to JS
      EXPO_PUBLIC_API_BASE_URL: API_BASE,
      EXPO_PUBLIC_SOCKET_URL: SOCKET,
      // You can also expose EXPO_PUBLIC_GOOGLE_PLACES_API_KEY here if you prefer,
      // but it's already available via process.env at runtime.
      eas: { projectId: "83e1fadd-eaaa-449c-98d3-b1796c7cab16" },
    },
    ios: {
      bundleIdentifier: "com.carpool.carpoolx",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We need your location to find and offer rides nearby.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "We need background location to track rides in progress.",
      },
      config: {
        // Native iOS Maps SDK key (requires dev build)
        googleMapsApiKey: IOS_MAPS_KEY,
      },
    },
    android: {
      package: "com.carpoolx.carpool",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION", "ACCESS_BACKGROUND_LOCATION"],
      usesCleartextTraffic: true, // for LAN http API during dev
      config: {
        // Native Android Maps SDK key (requires dev build)
        googleMaps: { apiKey: ANDROID_MAPS_KEY },
      },
    },
  };
};
