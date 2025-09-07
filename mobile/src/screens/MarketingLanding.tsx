// src/screens/MarketingLanding.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Pressable,
  Dimensions,
  Linking,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MarketingLanding() {
  const nav = useNavigation<any>();

  const onStartNow = () => nav.navigate("Register");
  const onDownload = async () => {
    const url = "https://example.com/download";
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) Linking.openURL(url);
      else Alert.alert("Download", "Link not configured yet.");
    } catch {}
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0F14" }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* HERO with glass */}
      <LinearGradient colors={["#0a0f1e", "#0b1226", "#101a3b"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 6 }}>
        <LinearGradient colors={["#5B7CFA", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={SS.hero}>
          <BlurView intensity={24} tint="dark" style={SS.heroInner}>
            <Text style={SS.heroLine}>Share Rides,</Text>
            <Text style={[SS.heroLine, { color: "#22c55e" }]}>Save Money</Text>
            <Text style={SS.heroLine}>Help the Planet 🌍</Text>

            <Text style={SS.heroDesc}>
              Join thousands of commuters who save money and reduce carbon footprint by sharing rides. Find the perfect ride match in seconds.
            </Text>

            {/* CTA row */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable
                onPress={async () => { try { await Haptics.selectionAsync(); } catch {} onStartNow(); }}
                accessibilityRole="button"
                accessibilityLabel="Start now, it is free"
                style={SS.ctaPrimary}
              >
                <Text style={{ color: "white", fontWeight: "800" }}>🚀 Start Now – It's Free!</Text>
              </Pressable>

              <Pressable
                onPress={async () => { try { await Haptics.selectionAsync(); } catch {} onDownload(); }}
                accessibilityRole="button"
                accessibilityLabel="Download the app"
                style={SS.ctaGhost}
              >
                <Text style={{ color: "white", fontWeight: "800" }}>📱 Download App</Text>
              </Pressable>
            </View>
          </BlurView>
        </LinearGradient>

        {/* stats pills */}
        <View style={SS.statsWrap}>
          <StatPill icon="people" label="Happy Users" value="50K+" />
          <StatPill icon="car" label="Daily Rides" value="5,000+" />
          <StatPill icon="business" label="Cities" value="25+" />
          <StatPill icon="cash" label="Money Saved" value="₹10L+" />
        </View>
      </LinearGradient>

      {/* WHY CHOOSE */}
      <Accordion title="Why Choose PoolRide? 🚀" subtitle="Future of commuting: safe, affordable, convenient.">
        <FeatureGrid />
      </Accordion>

      {/* TRUSTED BANNER */}
      <LinearGradient colors={["#5B7CFA", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={SS.trustBanner}>
        <Text style={SS.trustTitle}>Trusted by Thousands ✨</Text>
        <View style={SS.trustGrid}>
          <TrustItem value="50,000+" label="Happy Users" />
          <TrustItem value="1M+" label="Rides Completed" />
          <TrustItem value="₹10L+" label="Money Saved" />
          <TrustItem value="4.8/5" label="User Rating" />
        </View>
      </LinearGradient>

      {/* HOW IT WORKS */}
      <Accordion title="How PoolRide Works 🚀">
        <Steps />
      </Accordion>

      {/* FINAL CTA */}
      <LinearGradient colors={["#6D7EF7", "#6C3CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={SS.finalCta}>
        <Text style={SS.finalCtaTitle}>Ready to Start Your Journey? ✨</Text>
        <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
          <Pressable
            onPress={async () => { try { await Haptics.selectionAsync(); } catch {} onStartNow(); }}
            accessibilityRole="button"
            accessibilityLabel="Start now, it is free"
            style={SS.finalCtaPrimary}
          >
            <Text style={{ color: "#1f2937", fontWeight: "900" }}>Start Now – It’s Free!</Text>
          </Pressable>
          <Pressable
            onPress={async () => { try { await Haptics.selectionAsync(); } catch {} onDownload(); }}
            accessibilityRole="button"
            accessibilityLabel="Download the app"
            style={SS.finalCtaGhost}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Download App</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

/* Accordion */
function Accordion({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const rotate = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const to = open ? 0 : 1;
    Animated.timing(rotate, { toValue: to, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    setOpen((v) => !v);
  };

  const iconStyle = {
    transform: [{ rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "90deg"] }) }],
  };

  return (
    <View style={{ marginHorizontal: 12, marginTop: 8 }}>
      <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={`${title}. ${open ? "Collapse" : "Expand"}`} style={SS.accordionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={SS.accordionTitle}>{title}</Text>
          {subtitle ? <Text style={SS.accordionSubtitle}>{subtitle}</Text> : null}
        </View>
        <Animated.View style={iconStyle}>
          <Ionicons name="chevron-forward" size={18} color="#E5E7EB" />
        </Animated.View>
      </Pressable>
      {open ? <View style={{ marginTop: 10 }}>{children}</View> : null}
    </View>
  );
}

/* Small UI bits */
const StatPill = React.memo(function StatPill({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={SS.statPill}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name={icon} size={16} color="#EAF2FF" />
        <Text style={{ color: "#cfe0ff" }}>{label}</Text>
      </View>
      <Text style={{ color: "white", fontWeight: "900", fontSize: 16, marginTop: 6 }}>{value}</Text>
    </View>
  );
});

const FeatureGrid = React.memo(function FeatureGrid() {
  const items = useMemo(
    () => [
      { title: "Smart Matching", desc: "AI finds perfect matches by route, timing & preferences.", icon: <Ionicons name="search" size={20} color="#6E7CFD" />, tint: "#eef2ff", ring: "#8aa0ff" },
      { title: "Cost Splitting", desc: "Split costs fairly among passengers. Save up to 70%.", icon: <Ionicons name="cash" size={20} color="#22c55e" />, tint: "#ecfdf5", ring: "#86efac" },
      { title: "Safety First", desc: "Verified profiles, real-time tracking & emergency help.", icon: <Ionicons name="shield-checkmark" size={20} color="#f87171" />, tint: "#fef2f2", ring: "#fecaca" },
      { title: "Eco Friendly", desc: "Reduce carbon footprint by sharing rides.", icon: <Ionicons name="leaf" size={20} color="#16a34a" />, tint: "#ecfdf5", ring: "#86efac" },
      { title: "Instant Booking", desc: "Book in seconds with our quick flow.", icon: <Ionicons name="flash" size={20} color="#f472b6" />, tint: "#fdf2f8", ring: "#fbcfe8" },
      { title: "Mobile First", desc: "Fast, polished mobile experience with push support.", icon: <MaterialCommunityIcons name="cellphone" size={20} color="#a78bfa" />, tint: "#f3e8ff", ring: "#ddd6fe" },
    ],
    []
  );

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {items.map((it, i) => (
        <View key={i} style={SS.featureCard}>
          <View style={[SS.featureIcon, { backgroundColor: it.tint, borderColor: it.ring }]}>{it.icon}</View>
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
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>{value}</Text>
      <Text style={{ color: "#dbeafe", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const Steps = React.memo(function Steps() {
  const steps = useMemo(
    () => [
      { n: 1, title: "Sign Up", desc: "Create your account in seconds and verify profile.", icon: <Ionicons name="document-text-outline" size={18} color="#93c5fd" /> },
      { n: 2, title: "Find Rides", desc: "Search by pickup/drop with filters and preferences.", icon: <Ionicons name="search" size={18} color="#93c5fd" /> },
      { n: 3, title: "Book & Pay", desc: "Secure payment and instant confirmations.", icon: <Ionicons name="card" size={18} color="#93c5fd" /> },
      { n: 4, title: "Enjoy Ride", desc: "Real-time updates, safety features, and support.", icon: <Ionicons name="car-sport" size={18} color="#93c5fd" /> },
    ],
    []
  );
  return (
    <View style={{ gap: 10 }}>
      {steps.map((s) => (
        <View key={s.n} style={SS.stepCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={SS.stepIndex}>
              <Text style={{ color: "white", fontWeight: "900" }}>{s.n}</Text>
            </View>
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
const SS = StyleSheet.create({
  hero: { margin: 12, padding: 2, borderRadius: 24, overflow: "hidden" },
  heroInner: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heroLine: { color: "white", fontSize: 32, lineHeight: 36, fontWeight: "900" },
  heroDesc: { color: "rgba(255,255,255,0.92)", marginTop: 10 },

  ctaPrimary: { flex: 1, backgroundColor: "#3b82f6", borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#2c58ad" },
  ctaGhost: { flex: 1, backgroundColor: "transparent", borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.7)" },

  statsWrap: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  statPill: { backgroundColor: "rgba(0,0,0,0.25)", borderWidth: 1, borderColor: "#2a3b60", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, minWidth: (width - 48) / 2, flexGrow: 1 },

  trustBanner: { marginHorizontal: 12, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#2a3b60" },
  trustTitle: { color: "white", fontWeight: "900", fontSize: 18, textAlign: "center" },
  trustGrid: { marginTop: 12, flexDirection: "row", justifyContent: "space-between", gap: 12 },

  accordionHeader: { backgroundColor: "#0f1421", borderWidth: 1, borderColor: "#1f2b45", borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center" },
  accordionTitle: { color: "white", fontWeight: "900", fontSize: 18 },
  accordionSubtitle: { color: "#9aa4b2", marginTop: 4 },

  featureCard: { width: (width - 34) / 2, backgroundColor: "#0f1421", borderWidth: 1, borderColor: "#1f2b45", borderRadius: 16, padding: 12 },
  featureIcon: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, padding: 8 },

  finalCta: { margin: 12, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#2a3b60", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.04)" },
  finalCtaTitle: { color: "white", fontWeight: "900", fontSize: 18, textAlign: "center" },
  finalCtaPrimary: { flex: 1, backgroundColor: "white", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  finalCtaGhost: { flex: 1, backgroundColor: "transparent", borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.75)" },

  stepCard: { backgroundColor: "#0f1421", borderWidth: 1, borderColor: "#1f2b45", borderRadius: 16, padding: 12 },
  stepIndex: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#10182a", borderWidth: 1, borderColor: "#2f4366", alignItems: "center", justifyContent: "center" },
});
