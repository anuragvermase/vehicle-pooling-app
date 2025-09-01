// src/navigation/RootNavigator.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthAPI } from "../services/api";
import { Storage } from "../services/storage";

// Screens
import Landing from "../screens/Landing";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Dashboard from "../screens/Dashboard";
import FindRides from "../screens/FindRides";
import CreateRide from "../screens/CreateRide";
import MyRides from "../screens/MyRides";
import Profile from "../screens/Profile";

export type RootParams = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Landing: undefined;
  Dashboard: undefined;
  FindRides: undefined;
  CreateRide: undefined;
  MyRides: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootParams>();

function Splash({ navigation }: any) {
  useEffect(() => {
    (async () => {
      try {
        const token = await Storage.getToken();
        if (token) {
          // optionally validate token
          await AuthAPI.me();
          navigation.reset({ index: 0, routes: [{ name: "Landing" }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      } catch {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    })();
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerBackTitleVisible: false, headerTitleAlign: "center" }}
    >
      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ title: "Login" }} />
      <Stack.Screen name="Register" component={Register} options={{ title: "Create Account" }} />
      <Stack.Screen name="Landing" component={Landing} options={{ title: "Welcome" }} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="FindRides" component={FindRides} options={{ title: "Find Rides" }} />
      <Stack.Screen name="CreateRide" component={CreateRide} options={{ title: "Offer a Ride" }} />
      <Stack.Screen name="MyRides" component={MyRides} options={{ title: "My Rides" }} />
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
}
