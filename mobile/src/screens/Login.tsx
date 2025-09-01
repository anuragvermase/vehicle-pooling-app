// src/screens/Login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
// ✅ Use NAMED export, not default
import { AuthAPI, asMessage } from "../services/api";
import { Storage } from "../services/storage";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const disabled = !email.trim() || !password.trim();

  const onLogin = async () => {
    if (disabled) return;

    try {
      setLoading(true);
      // AuthAPI.login returns { token }
      const { token } = await AuthAPI.login(email.trim(), password);
      await Storage.setToken(token); // save for interceptors / auth flow
      // Go to app flow
      navigation.reset({
        index: 0,
        routes: [{ name: "Landing" }],
      });
    } catch (e) {
      Alert.alert("Login failed", asMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0b1220", padding: 16, justifyContent: "center" }}>
      <Text style={{ color: "white", fontSize: 28, fontWeight: "800", marginBottom: 16 }}>
        Welcome back
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{
          backgroundColor: "#1f2937",
          color: "#e5e7eb",
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#23314a",
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          backgroundColor: "#1f2937",
          color: "#e5e7eb",
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#23314a",
          marginBottom: 16,
        }}
      />

      <Pressable
        disabled={loading || disabled}
        onPress={onLogin}
        style={{
          backgroundColor: disabled ? "#3b4a61" : "#22c55e",
          padding: 16,
          borderRadius: 30,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
            Sign in
          </Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={{ color: "#93c5fd", textAlign: "center" }}>
          New here? Create an account
        </Text>
      </Pressable>
    </View>
  );
}
