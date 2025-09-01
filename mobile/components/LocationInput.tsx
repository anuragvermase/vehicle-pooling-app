// src/components/LocationInput.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import * as ExpoLocation from "expo-location";
import type { PlaceLite } from "../src/services/places";
import {
  autocomplete,
  details,
  geocodeText,
  reverseGeocode,
  PlacesSession,
} from "../src/services/places";

type Props = {
  value: PlaceLite | null;
  onChange: (p: PlaceLite | null) => void;
  placeholder?: string;
  dark?: boolean;
  enableCurrentLocation?: boolean;
};

export default function LocationInput({
  value,
  onChange,
  placeholder = "Location",
  dark = true,
  enableCurrentLocation = true,
}: Props) {
  const [text, setText] = useState(value?.text ?? "");
  const [items, setItems] = useState<
    Array<{ description: string; place_id: string }>
  >([]);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<string>(PlacesSession.new());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText(value?.text ?? "");
  }, [value?.text]);

  // Query Google only when dropdown is open (prevents flicker)
  useEffect(() => {
    if (!open) return;
    if (timer.current) clearTimeout(timer.current);

    // Always push a "Use current location" and "Use typed text" option
    const base = enableCurrentLocation
      ? [{ description: "📍 Use Current Location", place_id: "use:current" }]
      : [];

    if (!text) {
      setItems(base);
      return;
    }

    timer.current = setTimeout(async () => {
      const preds = await autocomplete(text, session);
      const typed = [{ description: `Use “${text}”`, place_id: `typed:${text}` }];
      setItems(base.concat(typed, preds));
    }, 220);
  }, [text, open, session, enableCurrentLocation]);

  const inputStyle = useMemo(
    () => ({
      backgroundColor: dark ? "#1f2937" : "#0b1220",
      color: "#e5e7eb",
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#23314a",
    }),
    [dark]
  );

  async function pickCurrent() {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setItems([
        { description: "Permission denied. Type location instead.", place_id: "perm:denied" },
      ]);
      return;
    }
    const pos = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });
    const full = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
    const chosen: PlaceLite =
      full ?? {
        text: "Current location",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
    onChange(chosen);
    setText(chosen.text);
    setOpen(false);
    setSession(PlacesSession.new());
  }

  async function choose(item: { description: string; place_id: string }) {
    if (item.place_id === "use:current") {
      await pickCurrent();
      return;
    }
    let chosen = await details(item.place_id, session);
    // If user picked "Use “text”", geocode it to get lat/lng
    if (!chosen && item.place_id.startsWith("typed:")) {
      const q = item.place_id.slice("typed:".length);
      chosen = (await geocodeText(q)) ?? { text: q };
    }
    const final: PlaceLite =
      chosen ?? { place_id: item.place_id, text: item.description };

    onChange(final);
    setText(final.text);
    setOpen(false);
    setSession(PlacesSession.new());
  }

  return (
    <View style={{ position: "relative", zIndex: 100 }}>
      <TextInput
        value={text}
        onFocus={() => {
          setOpen(true);
          setSession(PlacesSession.new());
        }}
        // Keep parent in sync WHILE typing so Search button can enable
        onChangeText={(t) => {
          setText(t);
          onChange(t ? { text: t } : null);
        }}
        placeholder={placeholder}
        placeholderTextColor={dark ? "#9ca3af" : "#e5e7eb"}
        autoCapitalize="words"
        style={inputStyle}
      />

      {open && items.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            backgroundColor: "#0b1220",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#23314a",
            maxHeight: 260,
            // Make sure it sits above the map on Android + iOS
            zIndex: 999,
            elevation: 24,
            overflow: "hidden",
          }}
        >
          <FlatList
            nestedScrollEnabled
            keyboardShouldPersistTaps="always"
            data={items}
            keyExtractor={(i) => i.place_id + i.description}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => choose(item)}
                activeOpacity={0.7}
                style={{ padding: 12 }}
              >
                <Text style={{ color: "#e5e7eb" }}>{item.description}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ color: "#93a3b8", padding: 12 }}>No suggestions</Text>
            }
          />
        </View>
      )}
    </View>
  );
}
