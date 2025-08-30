export default ({ config }) => ({
  ...config,
  name: "carpool",
  slug: "carpool",
  scheme: "carpool",
  extra: {
    API_URL: "http://192.168.206.193:5000/api",   // backend with /api
    SOCKET_URL: "http://192.168.206.193:5000",   // socket
    GOOGLE_MAPS_API_KEY: "dev"
  },
  android: {
    package: "com.yourcompany.carpool",
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION"
    ]
  }
});
