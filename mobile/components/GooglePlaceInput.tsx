// src/components/GooglePlaceInput.tsx
import React from "react";
import { View } from "react-native";
import Constants from "expo-constants";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export type PlaceLite = {
  place_id?: string;
  text: string;
  lat?: number;
  lng?: number;
  address?: string;
};

const KEY: string =
  ((Constants?.expoConfig?.extra as any)?.GOOGLE_MAPS_API_KEY as string) || "";

type Props = {
  placeholder: string;
  initialValue?: string;
  dark?: boolean;
  onPlaceSelected: (p: PlaceLite | null) => void;
};

export default function GooglePlaceInput({
  placeholder,
  initialValue,
  dark = true,
  onPlaceSelected,
}: Props) {
  return (
    <View style={{ zIndex: 1000 }}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        fetchDetails
        minLength={1}
        nearbyPlacesAPI="GooglePlacesSearch"
        enablePoweredByContainer={false}
        debounce={200}
        currentLocation={false}
        predefinedPlaces={[]}              // ✅ avoids .filter on undefined
        keepResultsAfterBlur               // list doesn’t flicker on blur
        onFail={() => onPlaceSelected(null)}
        onPress={(data, details) => {
          if (!details) return onPlaceSelected(null);
          onPlaceSelected({
            place_id: data.place_id,
            text: details.name || data.description,
            address: details.formatted_address,
            lat: details.geometry?.location?.lat,
            lng: details.geometry?.location?.lng,
          });
        }}
        query={{
          key: KEY,
          language: "en",
          types: "geocode",
          components: "country:in",        // remove if you want worldwide
        }}
        textInputProps={{
          defaultValue: initialValue,
          placeholderTextColor: dark ? "#9ca3af" : "#e5e7eb",
        }}
        styles={{
          container: { flex: 0 },
          textInputContainer: { padding: 0, margin: 0, backgroundColor: "transparent" },
          textInput: {
            height: 48,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#23314a",
            paddingHorizontal: 12,
            backgroundColor: dark ? "#1f2937" : "#0b1220",
            color: "#e5e7eb",
          },
          listView: {
            position: "absolute",
            top: 52,
            maxHeight: 260,
            backgroundColor: "#0b1220",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#23314a",
            zIndex: 1000,
            elevation: 20, // Android over map
          },
          row: { backgroundColor: "#0b1220" },
          description: { color: "#e5e7eb" },
          separator: { height: 1, backgroundColor: "#23314a" },
        }}
      />
    </View>
  );
}
