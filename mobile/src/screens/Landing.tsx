import { UserAPI } from "../services/api";
import { Storage } from "../services/storage";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
  Linking,
  LayoutAnimation,
  UIManager,
  Platform,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LocationInput from "../../components/LocationInput";
import { PlaceLite, geocodeText } from "../services/places";
import { Auth } from "../services/auth";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Me = {
  id?: string; _id?: string; name?: string; firstName?: string; lastName?: string;
  email?: string; phone?: string; avatarUrl?: string; profilePicture?: string; photoUrl?: string; avatar?: string;
};

function getDisplayName(u?: Me) {
  if (!u) return undefined;
  const n = u.name || (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName);
  if (n && n.trim()) return n.trim();
  if (u.email) return u.email.split("@")[0]; // FIX: string (not array)
  return undefined;
}

const SUGGESTIONS = Object.freeze([
  { label: "Home", from: "Home", to: "" },
  { label: "Work", from: "Work", to: "" },
  { label: "Recent", from: "Last pickup", to: "Last drop" },
]);

async function ensureCoords(p: PlaceLite | null): Promise<PlaceLite | null> {
  if (!p) return null;
  if (typeof p.lat === "number" && typeof p.lng === "number") return p;
  const g = await geocodeText(p.text);
  return g ?? p;
}

/* recent searches helpers */
async function pushRecent(from?: string, to?: string) {
  try {
    const key = "recent.searches.v1";
    const raw = await AsyncStorage.getItem(key);
    const arr: Array<{ from: string; to: string }> = raw ? JSON.parse(raw) : [];
    const rec = { from: from || "", to: to || "" };
    const next = [rec, ...arr.filter((x) => x.from !== rec.from || x.to !== rec.to)].slice(0, 3);
    await AsyncStorage.setItem(key, JSON.stringify(next));
    return next;
  } catch { return []; }
}
async function getRecent(): Promise<Array<{ from: string; to: string }>> {
  try {
    const raw = await AsyncStorage.getItem("recent.searches.v1");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function Accordion({
  title, subtitle, initiallyOpen = false, children,
}: { title: string; subtitle?: string; initiallyOpen?: boolean; children: React.ReactNode; }) {
  const [open, setOpen] = useState(initiallyOpen);
  const rotate = useRef(new Animated.Value(initiallyOpen ? 1 : 0)).current;
  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotate, { toValue: open ? 0 : 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    setOpen((v) => !v);
  }, [open, rotate]);
  const iconStyle = useMemo(
    () => ({ transform: [{ rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "90deg"] }) }] }),
    [rotate]
  );
  return (
    <View style={S.sectionWrap}>
      <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={`${title}. ${open ? "Collapse" : "Expand"}`} style={S.accordionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={S.accordionTitle}>{title}</Text>
          {subtitle ? <Text style={S.accordionSubtitle}>{subtitle}</Text> : null}
        </View>
        <Animated.View style={iconStyle}><Ionicons name="chevron-forward" size={18} color="#E5E7EB" /></Animated.View>
      </Pressable>
      {open ? <View style={{ marginTop: 10 }}>{children}</View> : null}
    </View>
  );
}

export default function Landing({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [from, setFrom] = useState<PlaceLite | null>(null);
  const [to, setTo] = useState<PlaceLite | null>(null);
  const [when, setWhen] = useState<Date | null>(null);
  const [seats, setSeats] = useState<number>(1);
  const [me, setMe] = useState<Me | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount] = useState<number>(2);
  const [stats, setStats] = useState<{ trips: number; km: number; co2kg: number }>({ trips: 0, km: 0, co2kg: 0 });
  const [recent, setRecent] = useState<Array<{ from: string; to: string }>>([]);
  const [upcoming, setUpcoming] = useState<any | null>(null);

  const canSearch = !!from?.text && !!to?.text;

  const setFromUser = useCallback((u: any) => {
    if (!u) return;
    setMe({ ...u, avatarUrl: u.avatarUrl || u.profilePicture || u.avatar || u.photoUrl });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await Auth.me();
        const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw ?? null;
        setFromUser(u);
      } catch {}
    })();
  }, [setFromUser]);

  const refreshUser = useCallback(async () => {
    try {
      const cached = await Storage.get?.("me");
      if (cached) { try { setFromUser(JSON.parse(cached)); } catch {} }
      const raw = await Auth.me();
      const u = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw ?? null;
      setFromUser(u);
    } catch {}
  }, [setFromUser]);

  useFocusEffect(useCallback(() => { refreshUser(); }, [refreshUser]));
  useEffect(() => { const sub = DeviceEventEmitter.addListener("user:updated", refreshUser); return () => sub.remove(); }, [refreshUser]);

  const displayName = useMemo(() => getDisplayName(me), [me]);
  const firstName = displayName ? displayName.split(" ")[0] : "Friend"; // FIX
  const initials = (displayName || me?.email || "U").slice(0, 1).toUpperCase();

  useEffect(() => { getRecent().then(setRecent); }, []);

  useEffect(() => {
    (async () => {
      try {
        const BASE: string = ((Constants?.expoConfig?.extra as any)?.API_BASE_URL as string) || "";
        const token = await Storage.getToken?.();
        const res = await fetch(`${BASE.replace(/\/$/, "")}/dashboard/stats`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (res.ok) {
          const data = await res.json();
          if (data?.trips != null) { setStats({ trips: data.trips, km: data.km ?? 0, co2kg: data.co2kg ?? 0 }); return; }
        }
        setStats((s) => (s.trips ? s : { trips: 12, km: 48, co2kg: 7 }));
      } catch { setStats((s) => (s.trips ? s : { trips: 12, km: 48, co2kg: 7 })); }
    })();

    // try upcoming ride if API exists (safe)
    (async () => {
      try {
        const api = await import("../services/api");
        if (api?.RideAPI?.upcomingMe) {
          const data = await api.RideAPI.upcomingMe();
          setUpcoming(data ?? null);
        }
      } catch {}
    })();
  }, []);

  const onSearch = useCallback(async () => {
    if (!canSearch) { Alert.alert("Add locations", "Please fill both From and To."); return; }
    const A = await ensureCoords(from); const B = await ensureCoords(to);
    if (!A || !B) { Alert.alert("Invalid locations", "Please select valid places."); return; }
    try { await Haptics.selectionAsync(); } catch {}
    await pushRecent(A.text, B.text); setRecent(await getRecent());
    navigation.navigate("FindRides", { from: A, to: B, when, seats });
  }, [canSearch, from, to, navigation, when, seats]);

  const onLogout = useCallback(async () => {
    await Auth.logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }, [navigation]);

  const onChangePhoto = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permission needed", "Allow photo/gallery access to continue."); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.9 });
      if (res.canceled || !res.assets?.length) return;
      const uri = res.assets[0].uri; // FIX index
      setMe((m) => (m ? { ...m, avatarUrl: uri } : m));
      const form = new FormData();
      form.append("avatar", { uri, name: "avatar.jpg", type: "image/jpeg" } as any);
      const { url, user } = await UserAPI.uploadAvatar(form);
      const merged = { ...(user ?? {}), avatarUrl: url };
      setFromUser(merged);
      await Storage.set?.("me", JSON.stringify(merged));
      DeviceEventEmitter.emit("user:updated");
    } catch { Alert.alert("Upload failed", "Please try again."); }
    finally { setMenuOpen(false); }
  }, [setFromUser]);

  /* ----------- original landing content ----------- */
  const renderHeader = useCallback(() => (
    <>
      <LinearGradient colors={["#0a0f1e", "#0b1226", "#101a3b"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 6 }}>
        <LinearGradient colors={["#3B82F6", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.heroCard}>
          <BlurView intensity={24} tint="dark" style={S.heroGlass}>
            <Text style={S.brand}>CarpoolX</Text>
            <Text style={S.heroSub}>Share your ride. Help reduce traffic.</Text>

            <View style={S.plannerBox}>
              <Text style={S.plannerTitle}>Plan a trip</Text>
              <LocationInput value={from} onChange={setFrom} placeholder="Where from?" dark />
              <View style={{ height: 10 }} />
              <LocationInput value={to} onChange={setTo} placeholder="Where to?" dark />

              <View style={S.quickRow}>
                <Pressable onPress={() => setWhen((prev) => (prev ? null : new Date()))} accessibilityRole="button" accessibilityLabel="Select date and time" style={S.quickField}>
                  <Ionicons name="time-outline" color="#cfe0ff" size={16} />
                  <Text style={S.quickFieldText}>{when ? new Date(when).toLocaleString() : "When?"}</Text>
                </Pressable>
                <Pressable onPress={() => setSeats((n) => Math.min(6, n + 1))} onLongPress={() => setSeats((n) => Math.max(1, n - 1))} accessibilityRole="adjustable" accessibilityLabel="Adjust seats" style={[S.quickField, { width: 120 }]}>
                  <Ionicons name="people-outline" color="#cfe0ff" size={16} />
                  <Text style={S.quickFieldText}>{seats} seat{seats > 1 ? "s" : ""}</Text>
                </Pressable>
              </View>

              <View style={S.suggestionRow}>
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s.label} onPress={() => { setFrom(s.from ? ({ text: s.from } as any) : null); if (s.to) setTo({ text: s.to } as any); }} style={S.suggestionChip}>
                    <Text style={S.suggestionText}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>

              {recent.length ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {recent.map((r, i) => (
                    <Pressable key={`${r.from}-${r.to}-${i}`} onPress={() => { setFrom({ text: r.from } as any); setTo({ text: r.to } as any); }} style={S.suggestionChip}>
                      <Text style={S.suggestionText}>{r.from} → {r.to}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <Pressable onPress={onSearch} disabled={!canSearch} accessibilityRole="button" accessibilityLabel="Search rides" style={[S.primaryCta, { backgroundColor: canSearch ? "#3B82F6" : "rgba(59,130,246,0.45)" }]}>
                <Text style={S.primaryCtaText}>🔎 Search</Text>
              </Pressable>
            </View>
          </BlurView>
        </LinearGradient>
      </LinearGradient>

      <View style={S.statsRow}>
        <MemoStatBadge label="Trips" value={String(stats.trips)} />
        <MemoStatBadge label="KM Saved" value={String(stats.km)} />
        <MemoStatBadge label="CO₂" value={`${stats.co2kg} kg`} />
      </View>

      <TrustStrip me={me} onVerifyProfile={() => navigation.navigate("Profile")} />

      {/* Upcoming ride (optional) */}
      {upcoming ? (
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: "#12161C", borderColor: "#23314a", borderWidth: 1, borderRadius: 16, padding: 14 }}>
          <Text style={{ color: "white", fontWeight: "800", marginBottom: 6 }}>Your next ride</Text>
          <Text style={{ color: "#cfe0ff", fontWeight: "700" }}>
            {upcoming?.startLocation?.name} → {upcoming?.endLocation?.name}
          </Text>
          <Text style={{ color: "#9aa4b2", marginTop: 4 }}>
            {upcoming?.departureTime ? new Date(upcoming.departureTime).toLocaleString() : ""}
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Pressable onPress={() => navigation.navigate("MyRides")} style={{ flex: 1, backgroundColor: "#3b82f6", borderRadius: 12, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "#2f5ec1" }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Track / Details</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("MyRides")} style={{ flex: 1, backgroundColor: "transparent", borderRadius: 12, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: "#23314a" }}>
              <Text style={{ color: "#e5e7eb", fontWeight: "800" }}>Chat / Support</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </>
  ), [from, to, when, seats, canSearch, onSearch, stats, me, navigation, recent, upcoming]);

  const renderBody = useCallback(() => (
    <View style={{ paddingHorizontal: 16, paddingTop: 6, gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        <QuickTile icon="megaphone" label="Offer a ride" onPress={() => navigation.navigate("CreateRide")} />
        <QuickTile icon="calendar" label="My rides" onPress={() => navigation.navigate("MyRides")} />
        <QuickTile icon="person" label="Profile" onPress={() => navigation.navigate("Profile")} />
        <QuickTile icon="log-out" label="Log out" danger onPress={onLogout} />
      </View>
    </View>
  ), [navigation, onLogout]);

  /* ----------- appended marketing (always visible below) ----------- */
  const renderMarketing = useCallback(() => (
    <>
      <Accordion title="Why Choose PoolRide? 🚀" subtitle="Future of commuting: safe, affordable, convenient.">
        <MemoFeatureGrid />
      </Accordion>
      <LinearGradient colors={["#5B7CFA", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.trustBanner}>
        <Text style={S.trustTitle}>Trusted by Thousands ✨</Text>
        <View style={S.trustGrid}>
          <TrustItem value="50,000+" label="Happy Users" />
          <TrustItem value="1M+" label="Rides Completed" />
          <TrustItem value="₹10L+" label="Money Saved" />
          <TrustItem value="4.8/5" label="User Rating" />
        </View>
      </LinearGradient>
      <Accordion title="How PoolRide Works 🚀">
        <MemoSteps />
      </Accordion>
      <LinearGradient colors={["#6D7EF7", "#6C3CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.finalCtaWrap}>
        <Text style={S.finalCtaTitle}>Ready to Start Your Journey? ✨</Text>
        <View style={S.finalCtaRow}>
          <Pressable onPress={async () => { try { await Haptics.selectionAsync(); } catch {} navigation.navigate("Register"); }} accessibilityRole="button" accessibilityLabel="Start now, it is free" style={S.finalCtaPrimary}>
            <Text style={S.finalCtaPrimaryText}>Start Now – It’s Free!</Text>
          </Pressable>
          <Pressable onPress={async () => {
            try { await Haptics.selectionAsync(); } catch {}
            const url = "https://example.com/download";
            try { const ok = await Linking.canOpenURL(url); if (ok) Linking.openURL(url); else Alert.alert("Download", "Link not configured yet."); } catch {}
          }} accessibilityRole="button" accessibilityLabel="Download the app" style={S.finalCtaGhost}>
            <Text style={S.finalCtaGhostText}>Download App</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </>
  ), [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <StatusBar barStyle="light-content" />

      {/* Top bar */}
      <View style={[S.topBarContainer, { paddingTop: Math.max(insets.top, 8) }]}>
        <View style={S.topBar}>
          <Text style={S.hiText}>Hi, <Text style={{ fontWeight: "800" }}>{firstName}</Text> 👋</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Pressable onPress={() => Alert.alert("Notifications", "Coming soon!")}>
              <Ionicons name="notifications-outline" size={22} color="white" />
              {notifCount > 0 && (<View style={S.badge}><Text style={S.badgeText}>{notifCount}</Text></View>)}
            </Pressable>
            <Pressable onPress={() => setMenuOpen((v) => !v)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {me?.avatarUrl ? (<Image source={{ uri: me.avatarUrl }} style={S.avatar} />) : (
                <View style={S.avatarFallback}><Text style={{ color: "white", fontWeight: "800" }}>{initials}</Text></View>
              )}
              <Ionicons name="chevron-down" size={18} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      <FlatList
        data={[1]}
        keyExtractor={() => "landing"}
        renderItem={() => (<>{renderHeader()}{renderBody()}{renderMarketing()}</>)}
        contentContainerStyle={{ paddingBottom: 96 + Math.max(insets.bottom, 12) }}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={1}
        removeClippedSubviews
        windowSize={5}
      />

      <View style={[S.stickyBar, {
        paddingBottom: Math.max(insets.bottom, 12),
        shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: -4 }, elevation: 12,
      }]}>
        <Pressable onPress={onSearch} disabled={!canSearch} accessibilityRole="button" accessibilityLabel="Search rides"
          style={[S.primaryCta, { backgroundColor: canSearch ? "#3B82F6" : "rgba(59,130,246,0.45)" }]}>
          <Text style={S.primaryCtaText}>Search rides</Text>
        </Pressable>
      </View>

      {/* Avatar menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)}>
          <View style={S.menu}>
            <MenuItem label={`Signed in as ${firstName}`} muted onPress={() => {}} icon={<Ionicons name="id-card" size={16} color="#9CA3AF" />} />
            <Separator />
            <MenuItem label="View profile" onPress={() => { setMenuOpen(false); navigation.navigate("Profile"); }} icon={<Ionicons name="person-circle" size={18} color="#E5E7EB" />} />
            <MenuItem label="Explore features" onPress={() => { setMenuOpen(false); navigation.navigate("MarketingLanding"); }} icon={<Ionicons name="information-circle-outline" size={18} color="#E5E7EB" />} />
            <MenuItem label="Change photo" onPress={onChangePhoto} icon={<Ionicons name="image" size={18} color="#E5E7EB" />} />
            <Separator />
            <MenuItem label="Log out" danger onPress={() => { setMenuOpen(false); onLogout(); }} icon={<MaterialIcons name="logout" size={18} color="#FCA5A5" />} />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const MemoStatBadge = React.memo(function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{label}</Text>
    </View>
  );
});

function TrustStrip({ me, onVerifyProfile }: { me: Me | null; onVerifyProfile: () => void }) {
  const hasAvatar = !!me?.avatarUrl, hasPhone = !!me?.phone, hasEmail = !!me?.email;
  const pct = Math.round(([hasAvatar, hasPhone, hasEmail].filter(Boolean).length / 3) * 100);
  return (
    <View style={S.trustStrip}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: "white", fontWeight: "800", fontSize: 14 }}>Safety & Verification</Text>
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{pct}%</Text>
      </View>
      <View style={S.trustBar}><View style={{ width: `${pct}%`, height: "100%", backgroundColor: "#22c55e" }} /></View>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <Chip text={hasAvatar ? "Photo ✓" : "Add photo"} />
        <Chip text={hasPhone ? "Phone ✓" : "Add phone"} />
        <Chip text={hasEmail ? "Email ✓" : "Add email"} />
      </View>
      <Pressable onPress={onVerifyProfile} style={S.trustCta}><Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>Complete profile</Text></Pressable>
    </View>
  );
}
function Chip({ text }: { text: string }) { return (<View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#1a2230" }}><Text style={{ color: "#c9d6e3", fontSize: 12 }}>{text}</Text></View>); }

const QuickTile = React.memo(function QuickTile({ icon, label, onPress, danger }: { icon: string; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={{ backgroundColor: danger ? "rgba(239,68,68,0.1)" : "#12161C", width: "47%", marginVertical: 6, paddingVertical: 20, borderRadius: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: danger ? "rgba(239,68,68,0.25)" : "#23314a" }}>
      <Ionicons name={icon as any} size={24} color={danger ? "#EF4444" : "white"} />
      <Text style={{ color: danger ? "#EF4444" : "white", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
});

function MenuItem({ label, onPress, icon, danger, muted }: { label: string; onPress: () => void; icon?: React.ReactNode; danger?: boolean; muted?: boolean; }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
      {icon}
      <Text style={{ color: danger ? "#FCA5A5" : muted ? "#9CA3AF" : "#E5E7EB", fontWeight: muted ? "600" : "800", fontSize: muted ? 12 : 14 }} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
function Separator() { return <View style={{ height: 1, backgroundColor: "#23314a", marginVertical: 4 }} />; }

/* marketing small bits */
const MemoFeatureGrid = React.memo(function FeatureGrid() {
  const items = useMemo(() => [
    { title: "Smart Matching", desc: "AI finds perfect matches by route, timing & preferences.", icon: <Ionicons name="search" size={20} color="#6E7CFD" />, tint: "#eef2ff", ring: "#8aa0ff" },
    { title: "Cost Splitting", desc: "Split costs fairly among passengers. Save up to 70%.", icon: <Ionicons name="cash" size={20} color="#22c55e" />, tint: "#ecfdf5", ring: "#86efac" },
    { title: "Safety First", desc: "Verified profiles, real-time tracking & emergency help.", icon: <Ionicons name="shield-checkmark" size={20} color="#f87171" />, tint: "#fef2f2", ring: "#fecaca" },
    { title: "Eco Friendly", desc: "Reduce carbon footprint by sharing rides.", icon: <Ionicons name="leaf" size={20} color="#16a34a" />, tint: "#ecfdf5", ring: "#86efac" },
    { title: "Instant Booking", desc: "Book in seconds with our quick flow.", icon: <Ionicons name="flash" size={20} color="#f472b6" />, tint: "#fdf2f8", ring: "#fbcfe8" },
    { title: "Mobile First", desc: "Fast, polished mobile experience with push support.", icon: <MaterialCommunityIcons name="cellphone" size={20} color="#a78bfa" />, tint: "#f3e8ff", ring: "#ddd6fe" },
  ], []);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 4 }}>
      {items.map((it, i) => (
        <View key={i} style={S.featureCard}>
          <View style={[S.featureIconWrap, { backgroundColor: it.tint, borderColor: it.ring }]}>{it.icon}</View>
          <Text style={{ color: "white", fontWeight: "800", marginTop: 8 }}>{it.title}</Text>
          <Text style={{ color: "#9aa4b2", marginTop: 4 }}>{it.desc}</Text>
          <Pressable style={{ marginTop: 8, alignSelf: "flex-start" }}>
            <Text style={{ color: "#93c5fd", fontWeight: "700" }}>Learn More →</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
});

function TrustItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ width: "48%", alignItems: "center", marginTop: 8 }}>
      <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>{value}</Text>
      <Text style={{ color: "#dbeafe", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const MemoSteps = React.memo(function Steps() {
  const steps = useMemo(() => [
    { n: 1, title: "Sign Up", desc: "Create your account in seconds and verify profile.", icon: <Ionicons name="document-text-outline" size={18} color="#93c5fd" /> },
    { n: 2, title: "Find Rides", desc: "Search by pickup/drop with filters and preferences.", icon: <Ionicons name="search" size={18} color="#93c5fd" /> },
    { n: 3, title: "Book & Pay", desc: "Secure payment and instant confirmations.", icon: <Ionicons name="card" size={18} color="#93c5fd" /> },
    { n: 4, title: "Enjoy Ride", desc: "Real-time updates, safety features, and support.", icon: <Ionicons name="car-sport" size={18} color="#93c5fd" /> },
  ], []);
  return (
    <View style={{ gap: 10 }}>
      {steps.map((s) => (
        <View key={s.n} style={S.stepCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={S.stepIndex}><Text style={{ color: "white", fontWeight: "900" }}>{s.n}</Text></View>
            <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>{s.title}</Text>
            <View style={{ flex: 1, alignItems: "flex-end" }}>{s.icon}</View>
          </View>
          <Text style={{ color: "#9aa4b2", marginTop: 6 }}>{s.desc}</Text>
        </View>
      ))}
    </View>
  );
});

/* Styles */
const S = StyleSheet.create({
  topBarContainer: { backgroundColor: "#0B0F14" },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#0B0F14",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hiText: { color: "white", fontSize: 14 },
  badge: { position: "absolute", right: -4, top: -2, backgroundColor: "#EF4444", borderRadius: 8, paddingHorizontal: 4, minWidth: 16, alignItems: "center" },
  badgeText: { color: "white", fontSize: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  avatarFallback: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center" },

  heroCard: { margin: 16, padding: 2, borderRadius: 28, overflow: "hidden" },
  heroGlass: { padding: 18, borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", overflow: "hidden" },
  brand: { color: "white", fontSize: 34, fontWeight: "900", letterSpacing: 0.5 },
  heroSub: { color: "rgba(255,255,255,0.9)", marginTop: 6, fontSize: 15 },

  plannerBox: { backgroundColor: "rgba(0,0,0,0.30)", marginTop: 16, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  plannerTitle: { color: "white", fontWeight: "800", marginBottom: 8, fontSize: 16 },

  quickRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  quickField: { flex: 1, backgroundColor: "rgba(255,255,255,0.10)", padding: 12, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", flexDirection: "row", justifyContent: "center", gap: 6 },
  quickFieldText: { color: "white", fontWeight: "700" },

  suggestionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  suggestionChip: { backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  suggestionText: { color: "white", fontSize: 12 },

  primaryCta: { marginTop: 12, paddingVertical: 14, borderRadius: 14, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  primaryCtaText: { color: "white", fontWeight: "800", fontSize: 16, letterSpacing: 0.2 },

  statsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },

  trustStrip: { marginHorizontal: 16, marginBottom: 16, padding: 12, backgroundColor: "#0f1421", borderRadius: 16, borderWidth: 1, borderColor: "#1f2b45" },
  trustBar: { height: 8, backgroundColor: "#0f1622", borderRadius: 8, overflow: "hidden", marginTop: 8 },
  trustCta: { marginTop: 10, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#1f2a3a" },

  featureCard: { width: "48%", backgroundColor: "#0f1421", borderWidth: 1, borderColor: "#1f2b45", borderRadius: 16, padding: 12 },
  featureIconWrap: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, padding: 8 },

  trustBanner: { marginHorizontal: 12, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#2a3b60", marginTop: 8 },
  trustTitle: { color: "white", fontWeight: "900", fontSize: 18, textAlign: "center" },
  trustGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },

  finalCtaWrap: { margin: 12, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#2a3b60", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.04)" },
  finalCtaTitle: { color: "white", fontWeight: "900", fontSize: 18, textAlign: "center" },
  finalCtaRow: { flexDirection: "row", gap: 10, width: "100%" },
  finalCtaPrimary: { flex: 1, backgroundColor: "white", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  finalCtaPrimaryText: { color: "#1f2937", fontWeight: "900" },
  finalCtaGhost: { flex: 1, backgroundColor: "transparent", borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.75)" },
  finalCtaGhostText: { color: "white", fontWeight: "900" },

  stickyBar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12, backgroundColor: "rgba(11,15,20,0.9)", borderTopWidth: 1, borderTopColor: "#23314a" },

  menu: { position: "absolute", top: 70, right: 16, backgroundColor: "#12161C", borderRadius: 14, paddingVertical: 8, width: 220, borderWidth: 1, borderColor: "#23314a" },

  sectionWrap: { marginHorizontal: 12, marginTop: 8 },
  accordionHeader: { backgroundColor: "#0f1421", borderWidth: 1, borderColor: "#1f2b45", borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center" },
  accordionTitle: { color: "white", fontWeight: "900", fontSize: 18 },
  accordionSubtitle: { color: "#9aa4b2", marginTop: 4 },

  stepCard: { backgroundColor: "#0f1421", borderWidth: 1, borderColor: "#1f2b45", borderRadius: 16, padding: 12 },
  stepIndex: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#10182a", borderWidth: 1, borderColor: "#2f4366", alignItems: "center", justifyContent: "center" },
});
