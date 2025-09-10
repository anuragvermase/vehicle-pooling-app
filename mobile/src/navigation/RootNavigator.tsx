// src/navigation/RootNavigator.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenSafeArea from "../../components/ScreenSafeArea";
import { AuthAPI } from "../services/api";
import { Storage } from "../services/storage";

// Screens
import Landing from "../screens/Landing";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Dashboard from "../screens/Dashboard";
import FindRides from "../screens/FindRides";
import Settings from "../screens/Settings";
import CreateRide from "../screens/CreateRide";
import MyRides from "../screens/MyRides";
import Profile from "../screens/Profile";
import MarketingLanding from "../screens/MarketingLanding";

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
  Settings: undefined;
  MarketingLanding: undefined;
};

const Stack = createNativeStackNavigator<RootParams>();

// Small HOC to inject ScreenSafeArea around any screen
function withSafeArea(
  Component: React.ComponentType<any>,
  edges?: Array<"top" | "bottom" | "left" | "right">
) {
  return function Wrapped(props: any) {
    return (
      <ScreenSafeArea style={{ backgroundColor: "#0B0F14" }} edges={edges}>
        <Component {...props} />
      </ScreenSafeArea>
    );
  };
}

function Splash({ navigation }: any) {
  useEffect(() => {
    (async () => {
      try {
        const token = await Storage.getToken();
        if (token) {
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
      <Stack.Screen name="Splash" component={withSafeArea(Splash)} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={withSafeArea(Login)} options={{ title: "Login" }} />
      <Stack.Screen name="Register" component={withSafeArea(Register)} options={{ title: "Create Account" }} />

      {/* Landing has custom top bar and sticky bottom CTA; keep header hidden.
         Default safe-area (top+bottom) is applied by the wrapper. */}
<Stack.Screen
  name="Landing"
  component={withSafeArea(Landing, ["left", "right"])}
  options={{ headerShown: false }}
/>
      <Stack.Screen name="Dashboard" component={withSafeArea(Dashboard)} />
      <Stack.Screen name="FindRides" component={withSafeArea(FindRides)} options={{ title: "Find Rides" }} />
      <Stack.Screen name="CreateRide" component={withSafeArea(CreateRide)} options={{ title: "Offer a Ride" }} />
      <Stack.Screen name="MyRides" component={withSafeArea(MyRides)} options={{ title: "My Rides" }} />
      <Stack.Screen name="Profile" component={withSafeArea(Profile)} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={withSafeArea(Settings)} options={{ title: "Settings" }} />
      <Stack.Screen name="MarketingLanding" component={withSafeArea(MarketingLanding)} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
}
