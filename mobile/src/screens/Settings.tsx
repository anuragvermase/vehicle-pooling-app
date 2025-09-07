// src/screens/Settings.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, Image, Pressable, TextInput, Modal, Alert, DeviceEventEmitter,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Auth } from "../services/auth";
import { UserAPI, asMessage, http } from "../services/api";


type Me = {
  name?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  avatarUrl?: string;
  subscription?: { plan?: string };
  verification?: { email?: boolean; phone?: boolean };
  stats?: { totalRidesCompleted?: number; completionRate?: number };
};

export default function Settings() {
  const [me, setMe] = useState<Me | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const initials = useMemo(() => (me?.name || me?.email || "U").slice(0, 1).toUpperCase(), [me]);
  const joined = useMemo(
    () => (me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : "—"),
    [me]
  );

  const load = useCallback(async () => {
    try {
      const raw = await Auth.me();
      const u = raw?.user ?? raw?.data?.user ?? raw;
      setMe(u);
      setForm({ name: u?.name || "", phone: u?.phone || "" });
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const sub = DeviceEventEmitter.addListener("user:updated", load);
    return () => sub.remove();
  }, [load]);

  async function copy(t: string) {
    try { await Clipboard.setStringAsync(t || ""); Alert.alert("Copied", t || ""); } catch {}
  }

  const onChangePhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert("Allow photo access to continue.");
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9,
      });
      if (res.canceled || !res.assets?.length) return;
      setSaving(true);
      const formData = new FormData();
      formData.append("avatar", { uri: res.assets[0].uri, name: "avatar.jpg", type: "image/jpeg" } as any);
      const { url, user } = await (UserAPI as any).uploadAvatar(formData);
      const merged = { ...(user ?? {}), avatarUrl: url };
      setMe(merged);
      DeviceEventEmitter.emit("user:updated");
    } catch (e) {
      Alert.alert("Failed to update photo", asMessage(e));
    } finally { setSaving(false); }
  };

  const onSaveProfile = async () => {
    try {
      if (!form.name.trim()) return Alert.alert("Name required");
      setSaving(true);
      const data = await UserAPI.updateProfile({ name: form.name.trim(), phone: form.phone?.trim() });
      const u = data?.user ?? data;
      setMe(u);
      setEditing(false);
      DeviceEventEmitter.emit("user:updated");
      Alert.alert("Saved", "Profile updated");
    } catch (e) { Alert.alert("Save failed", asMessage(e)); }
    finally { setSaving(false); }
  };

  async function changePassword(current: string, next: string) {
    const attempts: Array<{ method: "post" | "put"; url: string; body: any }> = [
      { method: "post", url: "/auth/change-password", body: { currentPassword: current, newPassword: next } },
      { method: "put",  url: "/users/password",       body: { currentPassword: current, newPassword: next } },
      { method: "put",  url: "/auth/password",        body: { currentPassword: current, newPassword: next } },
    ];
    let lastErr: any;
    for (const a of attempts) {
      try { if (a.method === "post") await http.post(a.url, a.body); else await http.put(a.url, a.body); return; }
      catch (e) { lastErr = e; }
    }
    throw lastErr;
  }

  const onSavePassword = async () => {
    if (!pw.current || !pw.next) return Alert.alert("Enter current and new password");
    if (pw.next.length < 6) return Alert.alert("New password must be at least 6 characters");
    if (pw.next !== pw.confirm) return Alert.alert("Confirm password doesn’t match");
    try {
      setPwSaving(true);
      await changePassword(pw.current, pw.next);
      setPwOpen(false); setPw({ current: "", next: "", confirm: "" });
      Alert.alert("Password changed");
    } catch (e) { Alert.alert("Change failed", asMessage(e)); }
    finally { setPwSaving(false); }
  };

  const Card = ({ title, children }: any) => (
    <View style={{ backgroundColor: "#12161C", borderColor: "#23314a", borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <Text style={{ color: "white", fontWeight: "800", marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
  const Row = ({ label, value, right, editable, onChangeText, placeholder }: any) => (
    <View style={{ backgroundColor: "#0f1622", borderColor: "#23314a", borderWidth: 1, padding: 12, borderRadius: 12, marginTop: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ color: "#9aa4b2" }}>{label}</Text>
        {editable ? (
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#6b7280"
            value={value}
            onChangeText={onChangeText}
            style={{ minWidth: 160, textAlign: "right", color: "#e5e7eb" }}
          />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ color: "#e5e7eb" }}>{value ?? "—"}</Text>
            {right || null}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0F14" }} contentContainerStyle={{ paddingBottom: 24 }}>
      <LinearGradient colors={["#0f172a","#0b1220"]} start={{x:0,y:0}} end={{x:1,y:1}}
        style={{ paddingTop: 36, paddingBottom: 18, paddingHorizontal: 16, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, borderBottomColor: "#23314a", borderBottomWidth: 1 }}>
        <View style={{ alignItems: "center" }}>
          <View style={{ width: 110, height: 110, borderRadius: 60, borderWidth: 2, borderColor: "#2d3b52", overflow: "hidden", backgroundColor: "#1a2230" }}>
            {me?.avatarUrl ? <Image source={{ uri: me.avatarUrl }} style={{ width: "100%", height: "100%" }} /> :
              <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
                <Text style={{ color: "white", fontWeight: "900", fontSize: 32 }}>{initials}</Text>
              </View>}
          </View>

          <Pressable onPress={onChangePhoto} disabled={saving}
            style={{ marginTop: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#1a2230", borderWidth: 1, borderColor: "#23314a", borderRadius: 999, flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Ionicons name="image-outline" size={16} color="#e5e7eb" />
            <Text style={{ color: "#e5e7eb", fontWeight: "700" }}>{saving ? "Updating…" : "Change photo"}</Text>
          </Pressable>

          <Text style={{ color: "white", fontWeight: "900", fontSize: 24, marginTop: 10 }}>{me?.name || "—"}</Text>
          <Text style={{ color: "#9aa4b2", marginTop: 2 }}>{me?.email || "—"}</Text>

          <View style={{ flexDirection: "row", gap: 28, marginTop: 14 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "white", fontWeight: "900" }}>{me?.stats?.totalRidesCompleted ?? "—"}</Text>
              <Text style={{ color: "#9aa4b2", fontSize: 12 }}>Total Rides</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "white", fontWeight: "900" }}>{me?.stats?.completionRate ?? "—"}</Text>
              <Text style={{ color: "#9aa4b2", fontSize: 12 }}>Completion</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={{ padding: 16 }}>
        <Card title="Contact">
          <Row label="Name" value={form.name} editable={editing} onChangeText={(v: string) => setForm(f => ({ ...f, name: v }))} placeholder="Your name" />
          <Row label="Email" value={me?.email} right={<Ionicons name="copy-outline" size={16} color="#9aa4b2" onPress={() => copy(me?.email || "")} />} />
          <Row label="Phone" value={editing ? form.phone : me?.phone} editable={editing} onChangeText={(v: string) => setForm(f => ({ ...f, phone: v }))} placeholder="Phone" right={!editing ? <Ionicons name="copy-outline" size={16} color="#9aa4b2" onPress={() => copy(me?.phone || "")} /> : null} />
        </Card>

        <Card title="Membership">
          <Row label="Joined" value={joined} />
          <Row label="Subscription" value={me?.subscription?.plan || "free"} />
        </Card>

        <Card title="Security">
          <Row label="Email Verified" value={me?.verification?.email ? "Yes" : "No"} right={<MaterialCommunityIcons name="shield-check-outline" size={18} color={me?.verification?.email ? "#22c55e" : "#9aa4b2"} />} />
          <Row label="2FA" value="Available" right={<MaterialCommunityIcons name="lock-outline" size={18} color="#9aa4b2" />} />
        </Card>

        {!editing ? (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <Pressable style={{ flex:1, backgroundColor:"#1a2230", borderColor:"#23314a", borderWidth:1, padding:14, borderRadius:14, alignItems:"center" }} onPress={() => setEditing(true)}>
              <Text style={{ color:"#e5e7eb", fontWeight:"800" }}>Edit Profile</Text>
            </Pressable>
            <Pressable style={{ flex:1, backgroundColor:"#3b82f6", borderColor:"#2f5ec1", borderWidth:1, padding:14, borderRadius:14, alignItems:"center" }} onPress={() => setPwOpen(true)}>
              <Text style={{ color:"white", fontWeight:"800" }}>Change Password</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <Pressable style={{ flex:1, backgroundColor:"#1a2230", borderColor:"#23314a", borderWidth:1, padding:14, borderRadius:14, alignItems:"center" }} onPress={() => { setEditing(false); setForm({ name: me?.name || "", phone: me?.phone || "" }); }}>
              <Text style={{ color:"#e5e7eb", fontWeight:"800" }}>Cancel</Text>
            </Pressable>
            <Pressable disabled={saving} style={{ flex:1, backgroundColor:"#22c55e", borderColor:"#177c3e", borderWidth:1, padding:14, borderRadius:14, alignItems:"center", opacity: saving ? 0.7 : 1 }} onPress={onSaveProfile}>
              <Text style={{ color:"#0B0F14", fontWeight:"800" }}>{saving ? "Saving…" : "Save Changes"}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Change Password Modal */}
      <Modal visible={pwOpen} transparent animationType="fade" onRequestClose={() => setPwOpen(false)}>
        <Pressable style={{ flex:1, backgroundColor:"rgba(0,0,0,0.5)" }} onPress={() => setPwOpen(false)}>
          <View style={{ position:"absolute", left:16, right:16, top:"25%", backgroundColor:"#12161C", borderRadius:16, borderWidth:1, borderColor:"#23314a", padding:14 }}>
            <Text style={{ color:"white", fontWeight:"800", marginBottom:10 }}>Change Password</Text>
            {["Current password","New password","Confirm new password"].map((ph, i) => (
              <TextInput
                key={ph}
                placeholder={ph}
                placeholderTextColor="#6b7280"
                secureTextEntry
                value={i===0 ? pw.current : i===1 ? pw.next : pw.confirm}
                onChangeText={(v) => setPw((p) => i===0 ? {...p, current:v} : i===1 ? {...p, next:v} : {...p, confirm:v})}
                style={{ backgroundColor:"#0f1622", color:"#e5e7eb", borderWidth:1, borderColor:"#23314a", borderRadius:10, padding:10, marginBottom:10 }}
              />
            ))}
            <View style={{ flexDirection:"row", gap:10 }}>
              <Pressable style={{ flex:1, backgroundColor:"#1a2230", borderColor:"#23314a", borderWidth:1, padding:12, borderRadius:12, alignItems:"center" }} onPress={() => setPwOpen(false)}>
                <Text style={{ color:"#e5e7eb", fontWeight:"800" }}>Cancel</Text>
              </Pressable>
              <Pressable disabled={pwSaving} style={{ flex:1, backgroundColor:"#3b82f6", borderColor:"#2f5ec1", borderWidth:1, padding:12, borderRadius:12, alignItems:"center", opacity: pwSaving ? 0.7 : 1 }} onPress={onSavePassword}>
                <Text style={{ color:"white", fontWeight:"800" }}>{pwSaving ? "Saving…" : "Save"}</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
