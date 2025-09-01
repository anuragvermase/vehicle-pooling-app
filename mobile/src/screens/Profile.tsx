// src/screens/Profile.tsx
import { UserAPI } from "../services/api";
import { Storage } from "../services/storage";
import React, { useEffect, useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Auth } from "../services/auth";

type Me = {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  profilePicture?: string;
  photoUrl?: string;
  avatar?: string;
  provider?: string;
  createdAt?: string;
};

function getDisplayName(u?: Me) {
  if (!u) return "Friend";
  const n =
    u.name ||
    u.fullName ||
    u.username ||
    (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName);
  return n?.trim() || (u.email ? u.email.split("@")[0] : "Friend");
}

export default function Profile() {
  const [me, setMe] = useState<Me | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const raw = await Auth.me(); // server or cache
        const u =
          (raw?.user as Me) ??
          (raw?.data?.user as Me) ??
          (raw?.data as Me) ??
          (raw?.profile as Me) ??
          (raw as Me) ??
          null;
        if (u) {
          const avatarUrl = u.avatarUrl || u.profilePicture || u.avatar || u.photoUrl;
          setMe({ ...u, avatarUrl });
          setName(getDisplayName(u));
          setPhone(u.phone || "");
        }
      } catch {}
    })();
  }, []);

  const memberSince = useMemo(() => {
    if (!me?.createdAt) return undefined;
    try {
      return new Date(me.createdAt).toLocaleDateString();
    } catch {
      return undefined;
    }
  }, [me?.createdAt]);

  const displayName = getDisplayName(me);

  const onChangePhoto = async () => {
    try {
      const current = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!current.granted) {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Permission needed", "Allow photo/gallery access to continue.");
          return;
        }
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ok on your SDK
        allowsEditing: false,
        quality: 0.9,
      });
      if (res.canceled || !res.assets?.length) return;

      const uri = res.assets[0].uri;

      // 1) Instant local preview
      setMe((m) => (m ? { ...m, avatarUrl: uri } : m));

      // 2) Persist to server
      const form = new FormData();
      form.append("avatar", { uri, name: "avatar.jpg", type: "image/jpeg" } as any);
      const { url, user } = await UserAPI.uploadAvatar(form);

      // 3) Update state + cache so it survives relogin
      setMe((m) => (m ? { ...m, avatarUrl: url } : m));
      await Storage.set?.("me", JSON.stringify(user));
      Alert.alert("Updated", "Profile photo updated.");
    } catch (e) {
      console.log("Upload avatar error:", e);
      Alert.alert("Upload failed", "Please try again.");
    }
  };

  const onSave = async () => {
    try {
      const body: any = {};
      if (name && name !== displayName) body.name = name.trim();
      if (phone !== me?.phone) body.phone = phone.trim();

      if (!body.name && !body.phone) {
        setEditing(false);
        return;
      }

      const res = await UserAPI.updateProfile(body);
      const u =
        (res?.user as Me) ??
        (res?.data?.user as Me) ??
        (res?.data as Me) ??
        (res?.profile as Me) ??
        (res as Me) ??
        null;

      if (u) {
        const avatarUrl = u.avatarUrl || u.profilePicture || u.avatar || me?.avatarUrl;
        const merged = { ...me, ...u, avatarUrl };
        setMe(merged);
        await Storage.set?.("me", JSON.stringify(merged));
      }

      setEditing(false);
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e) {
      Alert.alert("Update failed", "Please check details and try again.");
    }
  };

  const onCancel = () => {
    setName(displayName);
    setPhone(me?.phone || "");
    setEditing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Title + Edit controls */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "white", fontSize: 28, fontWeight: "900" }}>Profile</Text>
            {!editing ? (
              <Pressable
                onPress={() => setEditing(true)}
                style={{
                  backgroundColor: "#1a2230",
                  borderWidth: 1,
                  borderColor: "#23314a",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#E5E7EB", fontWeight: "800" }}>Edit</Text>
              </Pressable>
            ) : (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={onCancel}
                  style={{
                    backgroundColor: "#1a2230",
                    borderWidth: 1,
                    borderColor: "#23314a",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#E5E7EB", fontWeight: "800" }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={onSave}
                  style={{
                    backgroundColor: "#3B82F6",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "800" }}>Save</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Avatar */}
          <View style={{ alignItems: "center", gap: 14 }}>
            {me?.avatarUrl ? (
              <Image
                source={{ uri: me.avatarUrl }}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 1,
                  borderColor: "#23314a",
                }}
              />
            ) : (
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 1,
                  borderColor: "#23314a",
                  backgroundColor: "#1a2230",
                }}
              />
            )}
            <Pressable
              style={{
                backgroundColor: "#1a2230",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#23314a",
              }}
              onPress={onChangePhoto}
            >
              <Text style={{ color: "#E5E7EB", fontWeight: "800" }}>Change photo</Text>
            </Pressable>
          </View>

          {/* Fields */}
          <View style={{ marginTop: 24, gap: 16 }}>
            {/* Name (editable) */}
            <View>
              <Text style={{ color: "#9CA3AF", marginBottom: 6 }}>Name</Text>
              {!editing ? (
                <Text style={{ color: "#E5E7EB", fontWeight: "800" }}>{displayName}</Text>
              ) : (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="#6B7280"
                  style={input}
                />
              )}
            </View>

            {/* Email (read-only) */}
            {me?.email ? (
              <View>
                <Text style={{ color: "#9CA3AF", marginBottom: 6 }}>Email</Text>
                <Text style={{ color: "#E5E7EB" }}>{me.email}</Text>
              </View>
            ) : null}

            {/* Phone (editable) */}
            <View>
              <Text style={{ color: "#9CA3AF", marginBottom: 6 }}>Phone</Text>
              {!editing ? (
                <Text style={{ color: "#E5E7EB" }}>{me?.phone || "-"}</Text>
              ) : (
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  placeholderTextColor="#6B7280"
                  keyboardType="phone-pad"
                  style={input}
                />
              )}
            </View>

            {/* Optional extras */}
            {me?.provider ? (
              <View>
                <Text style={{ color: "#9CA3AF", marginBottom: 6 }}>Sign-in via</Text>
                <Text style={{ color: "#E5E7EB" }}>{me.provider}</Text>
              </View>
            ) : null}
            {memberSince ? (
              <View>
                <Text style={{ color: "#9CA3AF", marginBottom: 6 }}>Member since</Text>
                <Text style={{ color: "#E5E7EB" }}>{memberSince}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const input = {
  backgroundColor: "#111827",
  color: "#E5E7EB",
  borderWidth: 1,
  borderColor: "#23314a",
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
} as const;
