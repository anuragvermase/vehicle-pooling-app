// src/screens/CreateRide.tsx
import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, Alert, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import LocationInput from "../../components/LocationInput";
import { PlaceLite } from "../services/places";
import { RideAPI, asMessage } from "../services/api";

export default function CreateRide({ navigation }: any) {
  const [from, setFrom] = useState<PlaceLite | null>(null);
  const [to, setTo] = useState<PlaceLite | null>(null);
  const [datetime, setDatetime] = useState("");
  const [seats, setSeats] = useState("1");
  const [price, setPrice] = useState("100");
  const [vehicle, setVehicle] = useState("");
  const [loading, setLoading] = useState(false);

  const disabled = !from || !to || !datetime.trim() || !seats.trim() || !price.trim();

  const publish = async () => {
    if (disabled) {
      Alert.alert("Missing info", "From, To, Date/Time, Seats and Price are required.");
      return;
    }
    const seatsNum = Number(seats);
    const priceNum = Number(price);
    if (!Number.isFinite(seatsNum) || seatsNum <= 0) {
      Alert.alert("Invalid seats", "Seats must be a positive number."); return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      Alert.alert("Invalid price", "Price must be a valid number."); return;
    }
    const dt = new Date(datetime.replace(" ", "T"));
    if (Number.isNaN(dt.getTime())) {
      Alert.alert("Invalid date", "Use 2025-09-01 08:30 format."); return;
    }
    const iso = dt.toISOString();

    try {
      setLoading(true);
      await RideAPI.create({
        startLocation: {
          name: from!.text,
          ...(typeof from?.lat === "number" && typeof from?.lng === "number"
            ? { coordinates: { lat: from!.lat, lng: from!.lng } } : {}),
        },
        endLocation: {
          name: to!.text,
          ...(typeof to?.lat === "number" && typeof to?.lng === "number"
            ? { coordinates: { lat: to!.lat, lng: to!.lng } } : {}),
        },
        departureTime: iso,
        availableSeats: seatsNum,
        totalSeats: seatsNum,
        pricePerSeat: priceNum,
        vehicle: vehicle ? { model: vehicle } : undefined,
      });

      Alert.alert("Success", "Ride published!");
      // Jump to FindRides with the same query so they see it immediately
      navigation.reset({
        index: 0,
        routes: [{ name: "FindRides", params: { from: from!.text, to: to!.text } }],
      });
    } catch (e) {
      Alert.alert("Error", asMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "#1f2937",
    color: "#e5e7eb",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#23314a",
  } as const;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0b1220" }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "white", fontSize: 24, fontWeight: "800", marginBottom: 16 }}>
          🧳 Offer a Ride
        </Text>

        <LocationInput value={from} onChange={setFrom} placeholder="Starting Point" />
        <View style={{ height: 12 }} />
        <LocationInput value={to} onChange={setTo} placeholder="Destination" />

        <View style={{ height: 12 }} />
        <TextInput
          placeholder="Date/Time (e.g. 2025-09-01 08:30)"
          placeholderTextColor="#9ca3af"
          value={datetime}
          onChangeText={setDatetime}
          autoCapitalize="none"
          style={inputStyle}
        />

        <View style={{ height: 12 }} />
        <TextInput
          placeholder="Seats"
          placeholderTextColor="#9ca3af"
          value={seats}
          onChangeText={setSeats}
          keyboardType="number-pad"
          style={inputStyle}
        />

        <View style={{ height: 12 }} />
        <TextInput
          placeholder="Price per seat (₹)"
          placeholderTextColor="#9ca3af"
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
          style={inputStyle}
        />

        <View style={{ height: 12 }} />
        <TextInput
          placeholder="Vehicle Details (optional)"
          placeholderTextColor="#9ca3af"
          value={vehicle}
          onChangeText={setVehicle}
          style={[inputStyle, { marginBottom: 16 }]}
        />

        <Pressable
          disabled={loading || disabled}
          onPress={publish}
          style={{
            backgroundColor: disabled ? "#3b4a61" : "#22c55e",
            padding: 16,
            borderRadius: 30,
            alignItems: "center",
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
              🚀 Publish Ride
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
