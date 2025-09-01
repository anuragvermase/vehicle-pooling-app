// src/screens/Landing.tsx
import { UserAPI } from "../services/api";
import { Storage } from "../services/storage";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  Alert,
  Image,
  StatusBar,
  Modal,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
  DeviceEventEmitter, // 👈 listen for profile updates
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // 👈 refresh on screen focus
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import LocationInput from "../../components/LocationInput";
import { PlaceLite } from "../services/places";
import { Auth } from "../services/auth";

type Me = {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  profilePicture?: string;
  photoUrl?: string;
  avatar?: string;
};

function getDisplayName(u?: Me) {
  if (!u) return undefined;
  const n =
    u.name ||
    u.fullName ||
    u.username ||
    (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName);
  if (n && n.trim()) return n.trim();
  if (u.email) return u.email.split("@")[0];
  return undefined;
}

export default function Landing({ navigation }: any) {
  const [from, setFrom] = useState<PlaceLite | null>(null);
  const [to, setTo] = useState<PlaceLite | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const canSearch = !!from?.text && !!to?.text;

  const setFromUser = useCallback((u: any) => {
    if (!u) return;
    setMe({
      ...u,
      avatarUrl: u.avatarUrl || u.profilePicture || u.avatar || u.photoUrl,
    });
  }, []);

  // initial load
  useEffect(() => {
    (async () => {
      try {
        const raw = await Auth.me();
        const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw?.profile ?? raw ?? null;
        setFromUser(u);
      } catch {}
    })();
  }, [setFromUser]);

  // refresh on focus or when Profile emits an update
  const refreshUser = useCallback(async () => {
    try {
      const cached = await Storage.get?.("me");
      if (cached) {
        try { setFromUser(JSON.parse(cached)); return; } catch {}
      }
      const raw = await Auth.me();
      const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw?.profile ?? raw ?? null;
      setFromUser(u);
    } catch {}
  }, [setFromUser]);

  useFocusEffect(useCallback(() => { refreshUser(); }, [refreshUser]));
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("user:updated", refreshUser);
    return () => sub.remove();
  }, [refreshUser]);

  const displayName = useMemo(() => getDisplayName(me), [me]);
  const firstName = displayName ? displayName.split(" ")[0] : "Friend";
  const initials = (displayName || me?.email || "U").slice(0, 1).toUpperCase();

  const onSearch = () => {
    if (!canSearch) {
      Alert.alert("Add locations", "Please fill both From and To.");
      return;
    }
    navigation.navigate("FindRides", { from: from?.text, to: to?.text });
  };

  const onLogout = async () => {
    await Auth.logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  // same uploader used by Profile
  const onChangePhoto = async () => {
    try {
      const current = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!current.granted) {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { Alert.alert("Permission needed", "Allow photo/gallery access to continue."); return; }
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });
      if (res.canceled || !res.assets?.length) return;

      const uri = res.assets[0].uri;
      setMe((m) => (m ? { ...m, avatarUrl: uri } : m));

      const form = new FormData();
      form.append("avatar", { uri, name: "avatar.jpg", type: "image/jpeg" } as any);
      const { url, user } = await UserAPI.uploadAvatar(form);

      const merged = { ...(user ?? {}), avatarUrl: url };
      setFromUser(merged);
      await Storage.set?.("me", JSON.stringify(merged));
      DeviceEventEmitter.emit("user:updated");
    } catch (e) {
      Alert.alert("Upload failed", "Please try again.");
    } finally {
      setMenuOpen(false);
    }
  };

  // Render everything in header via FlatList to avoid nested VirtualizedLists
  const renderItem = (_: ListRenderItemInfo<number>) => (
    <>
      <LinearGradient
        colors={["#3B82F6", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ margin: 16, padding: 20, borderRadius: 24, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 }}
      >
        <Text style={{ color: "white", fontSize: 36, fontWeight: "900", letterSpacing: 0.5 }}>CarpoolX</Text>
        <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 6, fontSize: 16 }}>Share your ride. Help reduce traffic.</Text>

        <View style={{ backgroundColor: "rgba(0,0,0,0.35)", marginTop: 16, padding: 14, borderRadius: 16 }}>
          <Text style={{ color: "white", fontWeight: "800", marginBottom: 8, fontSize: 16 }}>Plan a trip</Text>
          <LocationInput value={from} onChange={setFrom} placeholder="Where from?" dark />
          <View style={{ height: 10 }} />
          <LocationInput value={to} onChange={setTo} placeholder="Where to?" dark />
          <Pressable
            onPress={onSearch}
            disabled={!canSearch}
            style={{ marginTop: 12, backgroundColor: canSearch ? "#3B82F6" : "rgba(59,130,246,0.45)", paddingVertical: 14, borderRadius: 14, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>🔎 Search</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <ActionCard icon={<Ionicons name="megaphone" size={22} color="#E6EEF8" />} title="Offer a ride" subtitle="Publish your route and earn on empty seats." onPress={() => navigation.navigate("CreateRide")} />
        <ActionCard icon={<Ionicons name="calendar" size={22} color="#E6EEF8" />} title="My rides" subtitle="See your bookings and offered rides." onPress={() => navigation.navigate("MyRides")} />
        <ActionCard icon={<Ionicons name="person-circle" size={24} color="#E6EEF8" />} title="Profile" subtitle="View and edit your profile." onPress={() => navigation.navigate("Profile")} />
        <ActionCard icon={<MaterialIcons name="logout" size={22} color="#FCA5A5" />} title="Log out" subtitle="Sign out of your account." onPress={onLogout} danger />
      </View>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <StatusBar barStyle="light-content" />

      {/* Top bar on black: greeting + avatar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10, backgroundColor: "#0B0F14", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: "white", fontSize: 14 }}>
          Hi, <Text style={{ fontWeight: "800" }}>{firstName}</Text> 👋
        </Text>
        <Pressable onPress={() => setMenuOpen((v) => !v)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {me?.avatarUrl ? (
            <Image source={{ uri: me.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" }} />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "white", fontWeight: "800" }}>{initials}</Text>
            </View>
          )}
          <Ionicons name="chevron-down" size={18} color="white" />
        </Pressable>
      </View>

      <FlatList data={[1]} keyExtractor={() => "landing"} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled" />

      {/* Avatar menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)}>
          <View style={{ position: "absolute", top: 70, right: 16, backgroundColor: "#12161C", borderRadius: 14, paddingVertical: 8, width: 210, borderWidth: 1, borderColor: "#23314a" }}>
            <MenuItem label={`Signed in as ${firstName}`} muted onPress={() => {}} icon={<Ionicons name="id-card" size={16} color="#9CA3AF" />} />
            <Separator />
            <MenuItem label="View profile" onPress={() => { setMenuOpen(false); navigation.navigate("Profile"); }} icon={<Ionicons name="person-circle" size={18} color="#E5E7EB" />} />
            <MenuItem label="Change photo" onPress={onChangePhoto} icon={<Ionicons name="image" size={18} color="#E5E7EB" />} />
            <Separator />
            <MenuItem label="Log out" danger onPress={() => { setMenuOpen(false); onLogout(); }} icon={<MaterialIcons name="logout" size={18} color="#FCA5A5" />} />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ActionCard({ icon, title, subtitle, onPress, danger = false }: { icon: React.ReactNode; title: string; subtitle?: string; onPress?: () => void; danger?: boolean; }) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: "#12161C", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: danger ? "rgba(252,165,165,0.25)" : "#23314a", flexDirection: "row", alignItems: "center", gap: 14 }}>
      <View style={{ backgroundColor: danger ? "rgba(252,165,165,0.12)" : "#1a2230", width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: danger ? "#FCA5A5" : "white", fontWeight: "800", fontSize: 16 }}>{title}</Text>
        {subtitle ? <Text style={{ color: "#A7B3C2", marginTop: 2, fontSize: 13 }}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#4B5563" />
    </Pressable>
  );
}

function MenuItem({ label, onPress, icon, danger, muted }: { label: string; onPress: () => void; icon?: React.ReactNode; danger?: boolean; muted?: boolean; }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
      {icon}
      <Text style={{ color: danger ? "#FCA5A5" : muted ? "#9CA3AF" : "#E5E7EB", fontWeight: muted ? "600" : "800", fontSize: muted ? 12 : 14 }} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}
function Separator() { return <View style={{ height: 1, backgroundColor: "#23314a", marginVertical: 4 }} />; }
