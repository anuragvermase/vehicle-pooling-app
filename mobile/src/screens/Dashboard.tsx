// mobile/src/screens/Dashboard.tsx
import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { colors } from "../theme/colors";
import { registerForPush } from "../services/notifications";
import { connectSocket } from "../services/socket";
import { logout } from "../services/auth";

type Props = { navigation: { navigate: (screen: string) => void; reset: Function } };

export default function Dashboard({ navigation }: Props) {
  useEffect(() => {
    (async () => {
      try { await connectSocket(); } catch {}
      try { await registerForPush(); } catch {}
    })();
  }, []);

  const btn = {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", marginBottom: 16 }}>
        Dashboard
      </Text>

      <Pressable onPress={() => navigation.navigate("FindRides")} style={btn}>
        <Text style={{ color: colors.text, textAlign: "center" }}>Find Rides</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("CreateRide")} style={btn}>
        <Text style={{ color: colors.text, textAlign: "center" }}>Offer a Ride</Text>
      </Pressable>

      {/* Logout */}
      <Pressable
        onPress={async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
        }}
        style={{ marginTop: 16, padding: 12 }}
      >
        <Text style={{ color: "#9ca3af", textAlign: "center" }}>Logout</Text>
      </Pressable>
    </View>
  );
}
