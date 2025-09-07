// app.config.ts
import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }) => {
  // Use your server's Phone Health IP from the backend logs
  const API_BASE = process.env.API_BASE_URL ?? 'http://192.168.132.193:5000/api';
  const SOCKET = process.env.SOCKET_URL ?? 'http://192.168.132.193:5000';

  // One Google key used everywhere (Expo Go + JS Places/Directions + native maps)
  const MOBILE_KEY =
    process.env.GOOGLE_MAPS_API_KEY ?? 'AIzaSyCVxt5J7BUmd-bjn42YOIjBCSXIZU9jMDg';

  return {
    ...config,
    name: 'carpool',
    slug: 'carpool',
    scheme: 'carpool',
    extra: {
      API_BASE_URL: API_BASE,
      SOCKET_URL: SOCKET,
      GOOGLE_MAPS_API_KEY: MOBILE_KEY,
    },
    ios: {
      bundleIdentifier: 'com.yourcompany.carpool',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'We need your location to find and offer rides nearby.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'We need background location to track rides in progress.',
      },
      config: {
        // Native iOS Maps key
        googleMapsApiKey: MOBILE_KEY,
      },
    },
    android: {
      package: 'com.yourcompany.carpool',
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
      ],
      // Needed because your API uses http:// (not https)
      usesCleartextTraffic: true,
      config: {
        googleMaps: {
          // Native Android Maps key
          apiKey: MOBILE_KEY,
        },
      },
    },
  };
};
