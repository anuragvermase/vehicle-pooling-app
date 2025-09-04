# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Maps setup

- API keys: Configure `GOOGLE_MAPS_API_KEY` in `mobile/app.config.ts` (under `extra` and platform-specific `ios.config.googleMapsApiKey` / `android.config.googleMaps.apiKey`). The mobile app reads this key to call Google Directions and Places APIs.
- Libraries already included: `react-native-maps` for the map view and `react-native-google-places-autocomplete` for place search.
- New component: `mobile/components/EnhancedMap.tsx` mirrors web `EnhancedMap.jsx`. It supports:
  - origin/destination directions with optional via points
  - ride markers and selection
  - user location marker
- Usage example:
  - See `mobile/src/screens/FindRides.tsx` where `EnhancedMap` renders the route between selected places and returns `distanceText`/`durationText` via `onRouteInfo`.
