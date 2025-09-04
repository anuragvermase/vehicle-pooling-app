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
  DeviceEventEmitter,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import LocationInput from "../../components/LocationInput";
import { PlaceLite, geocodeText } from "../services/places";
import { Auth } from "../services/auth";

// ———————————————————————————————————————————————————————————
// Types & helpers
// ———————————————————————————————————————————————————————————
type Me = {
  id?: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  profilePicture?: string;
  photoUrl?: string;
  avatar?: string;
};

function getDisplayName(u?: Me) {
  if (!u) return undefined;
  const n = u.name || (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName);
  if (n && n.trim()) return n.trim();
  if (u.email) return u.email.split("@")[0];
  return undefined;
}

const SUGGESTIONS = [
  { label: "Home", from: "Home", to: "" },
  { label: "Work", from: "Work", to: "" },
  { label: "Recent", from: "Last pickup", to: "Last drop" },
];

// Small helper: ensure a PlaceLite has lat/lng (geocode typed text)
async function ensureCoords(p: PlaceLite | null): Promise<PlaceLite | null> {
  if (!p) return null;
  if (typeof p.lat === "number" && typeof p.lng === "number") return p;
  // If user typed something and didn't pick a suggestion, geocode it
  const g = await geocodeText(p.text);
  return g ?? p;
}

// ———————————————————————————————————————————————————————————
// Component
// ———————————————————————————————————————————————————————————
export default function Landing({ navigation }: any) {
  const [from, setFrom] = useState<PlaceLite | null>(null);
  const [to, setTo] = useState<PlaceLite | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount] = useState<number>(2); // 🔔 stub
  const [stats, setStats] = useState<{ trips: number; km: number; co2kg: number }>({ trips: 0, km: 0, co2kg: 0 });

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
        const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw ?? null;
        setFromUser(u);
      } catch {}
    })();
  }, [setFromUser]);

  // refresh on focus or when Profile emits an update
  const refreshUser = useCallback(async () => {
    try {
      const cached = await Storage.get?.("me");
      if (cached) {
        try { setFromUser(JSON.parse(cached)); } catch {}
      }
      const raw = await Auth.me();
      const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw ?? null;
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

  // ——— Stats fetch (safe fallback; uses configured base URL)
  useEffect(() => {
    (async () => {
      try {
        const BASE: string =
          ((Constants?.expoConfig?.extra as any)?.API_BASE_URL as string) || "";
        const token = await Storage.getToken?.();
        const res = await fetch(`${BASE.replace(/\/$/, "")}/dashboard/stats`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.trips != null) {
            setStats({ trips: data.trips, km: data.km ?? 0, co2kg: data.co2kg ?? 0 });
            return;
          }
        }
        // fallback demo numbers
        setStats((s) => s.trips ? s : { trips: 12, km: 48, co2kg: 7 });
      } catch {
        setStats((s) => s.trips ? s : { trips: 12, km: 48, co2kg: 7 });
      }
    })();
  }, []);

  // ——— Actions
  const onSearch = async () => {
    if (!canSearch) {
      Alert.alert("Add locations", "Please fill both From and To.");
      return;
    }
    // make sure both have coordinates before navigating
    const A = await ensureCoords(from);
    const B = await ensureCoords(to);
    if (!A || !B) {
      Alert.alert("Invalid locations", "Please select valid places.");
      return;
    }
    navigation.navigate("FindRides", { from: A, to: B });
  };

  const onLogout = async () => {
    await Auth.logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  // same uploader used by Profile
  const onChangePhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Allow photo/gallery access to continue.");
        return;
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

  // ———————————————————————————————————————————————————————————
  // UI Sections
  // ———————————————————————————————————————————————————————————
  const renderHeader = () => (
    <>
      {/* Gradient Hero */}
      <LinearGradient
        colors={["#3B82F6", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          margin: 16,
          padding: 20,
          borderRadius: 24,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Text style={{ color: "white", fontSize: 34, fontWeight: "900" }}>CarpoolX</Text>
        <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 6, fontSize: 15 }}>
          Share your ride. Help reduce traffic.
        </Text>

        {/* Plan a trip */}
        <View style={{ backgroundColor: "rgba(0,0,0,0.35)", marginTop: 16, padding: 14, borderRadius: 16 }}>
          <Text style={{ color: "white", fontWeight: "800", marginBottom: 8, fontSize: 16 }}>Plan a trip</Text>
          <LocationInput value={from} onChange={setFrom} placeholder="Where from?" dark />
          <View style={{ height: 10 }} />
          <LocationInput value={to} onChange={setTo} placeholder="Where to?" dark />

          {/* Suggestion chips */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s.label}
                onPress={() => {
                  setFrom(s.from ? ({ text: s.from } as any) : null);
                  if (s.to) setTo({ text: s.to } as any);
                }}
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>{s.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onSearch}
            disabled={!canSearch}
            style={{
              marginTop: 12,
              backgroundColor: canSearch ? "#3B82F6" : "rgba(59,130,246,0.45)",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>🔎 Search</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Stats row */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 12 }}>
        <StatBadge label="Trips" value={String(stats.trips)} />
        <StatBadge label="KM Saved" value={String(stats.km)} />
        <StatBadge label="CO₂" value={`${stats.co2kg} kg`} />
      </View>

      {/* Trust & Safety strip */}
      <TrustStrip me={me} onVerifyProfile={() => navigation.navigate("Profile")} />
    </>
  );

  const renderBody = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 6, gap: 12 }}>
      {/* Quick Actions grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        <QuickTile icon="megaphone" label="Offer a ride" onPress={() => navigation.navigate("CreateRide")} />
        <QuickTile icon="calendar" label="My rides" onPress={() => navigation.navigate("MyRides")} />
        <QuickTile icon="person" label="Profile" onPress={() => navigation.navigate("Profile")} />
        <QuickTile icon="settings" label="Settings" onPress={() => navigation.navigate("Settings")} />
        <QuickTile icon="log-out" label="Log out" danger onPress={onLogout} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <StatusBar barStyle="light-content" />

      {/* Top bar on black: greeting + bell + avatar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 10,
          backgroundColor: "#0B0F14",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "white", fontSize: 14 }}>
          Hi, <Text style={{ fontWeight: "800" }}>{firstName}</Text> 👋
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {/* Notifications (stubbed) */}
          <Pressable onPress={() => Alert.alert("Notifications", "Coming soon!")}>
            <Ionicons name="notifications-outline" size={22} color="white" />
            {notifCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  right: -4,
                  top: -2,
                  backgroundColor: "#EF4444",
                  borderRadius: 8,
                  paddingHorizontal: 4,
                  minWidth: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 10 }}>{notifCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Avatar menu open */}
          <Pressable onPress={() => setMenuOpen((v) => !v)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {me?.avatarUrl ? (
              <Image source={{ uri: me.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" }} />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.35)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "800" }}>{initials}</Text>
              </View>
            )}
            <Ionicons name="chevron-down" size={18} color="white" />
          </Pressable>
        </View>
      </View>

      {/* FlatList wrapper prevents nested list warnings later */}
      <FlatList
        data={[1]}
        keyExtractor={() => "landing"}
        renderItem={() => (
          <>
            {renderHeader()}
            {renderBody()}
          </>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      />

      {/* Avatar menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)}>
          <View
            style={{
              position: "absolute",
              top: 70,
              right: 16,
              backgroundColor: "#12161C",
              borderRadius: 14,
              paddingVertical: 8,
              width: 220,
              borderWidth: 1,
              borderColor: "#23314a",
            }}
          >
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

// ———————————————————————————————————————————————————————————
// Small UI primitives
// ———————————————————————————————————————————————————————————
function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function TrustStrip({ me, onVerifyProfile }: { me: Me | null; onVerifyProfile: () => void }) {
  // Basic completion: avatar + phone + email
  const hasAvatar = !!me?.avatarUrl;
  const hasPhone = !!me?.phone;
  const hasEmail = !!me?.email;
  const total = 3;
  const done = [hasAvatar, hasPhone, hasEmail].filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 16, padding: 12, backgroundColor: "#12161C", borderRadius: 16, borderWidth: 1, borderColor: "#23314a" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: "white", fontWeight: "800", fontSize: 14 }}>Safety & Verification</Text>
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{pct}%</Text>
      </View>
      <View style={{ height: 8, backgroundColor: "#0f1622", borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
        <View style={{ width: `${pct}%`, height: "100%", backgroundColor: "#22c55e" }} />
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <Chip text={hasAvatar ? "Photo ✓" : "Add photo"} />
        <Chip text={hasPhone ? "Phone ✓" : "Add phone"} />
        <Chip text={hasEmail ? "Email ✓" : "Add email"} />
      </View>
      <Pressable onPress={onVerifyProfile} style={{ marginTop: 10, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#1f2a3a" }}>
        <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>Complete profile</Text>
      </Pressable>
    </View>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#1a2230" }}>
      <Text style={{ color: "#c9d6e3", fontSize: 12 }}>{text}</Text>
    </View>
  );
}

function QuickTile({ icon, label, onPress, danger }: { icon: string; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: danger ? "rgba(239,68,68,0.1)" : "#12161C",
        width: "47%",
        marginVertical: 6,
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: danger ? "rgba(239,68,68,0.25)" : "#23314a",
      }}
    >
      <Ionicons name={icon as any} size={24} color={danger ? "#EF4444" : "white"} />
      <Text style={{ color: danger ? "#EF4444" : "white", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

function MenuItem({
  label,
  onPress,
  icon,
  danger,
  muted,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  muted?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
      {icon}
      <Text style={{ color: danger ? "#FCA5A5" : muted ? "#9CA3AF" : "#E5E7EB", fontWeight: muted ? "600" : "800", fontSize: muted ? 12 : 14 }} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
function Separator() {
  return <View style={{ height: 1, backgroundColor: "#23314a", marginVertical: 4 }} />;
}
