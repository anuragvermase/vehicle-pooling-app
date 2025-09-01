import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }) => ({
  ...config,
  name: 'carpool',
  slug: 'carpool',
  scheme: 'carpool',
  extra: {
    API_BASE_URL: process.env.API_BASE_URL ?? 'http://10.170.176.193:5000/api',
    SOCKET_URL: process.env.SOCKET_URL ?? 'http://10.170.176.193:5000',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ?? 'AIzaSyAKv_5fOoT0TGnnkoFiAQSCvhGWpxesCvg',
  },
  ios: {
    bundleIdentifier: 'com.yourcompany.carpool',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'We need your location to find and offer rides nearby.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'We need background location to track rides in progress.',
    },
    config: {
      // lets Apple Maps / Places libs read the key if you use them
      googleMapsApiKey:
        process.env.GOOGLE_MAPS_API_KEY ?? 'AIzaSyAKv_5fOoT0TGnnkoFiAQSCvhGWpxesCvg',
    },
  },
  android: {
    package: 'com.yourcompany.carpool',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
    ],
    // 👇 Needed because your API is http:// (not https)
    usesCleartextTraffic: true,
    config: {
      googleMaps: {
        apiKey:
          process.env.GOOGLE_MAPS_API_KEY ?? 'AIzaSyAKv_5fOoT0TGnnkoFiAQSCvhGWpxesCvg',
      },
    },
  },
});
