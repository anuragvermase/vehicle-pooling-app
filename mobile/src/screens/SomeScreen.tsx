// src/screens/SomeScreen.tsx
import React from "react";
import { View, Text } from "react-native";
import ScreenSafeArea from "../../components/ScreenSafeArea";

export default function SomeScreen() {
  return (
    <ScreenSafeArea style={{ backgroundColor: "#0B0F14" }} edges={["bottom", "left", "right"]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "white" }}>Content respects bottom/side insets, full-bleed at top.</Text>
      </View>
    </ScreenSafeArea>
  );
}
