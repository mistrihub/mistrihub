import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { AppSession } from "../lib/supabase";
import { categories } from "../lib/categories";
import { createWorkPost, getMyWorkerProfile, saveWorkerProfile, uploadMedia } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { CategorySlug, Worker } from "../types";

export function DashboardScreen() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [worker, setWorker] = useState<Partial<Worker>>({ categorySlug: "electrician", serviceDetails: [] });
  const [workCaption, setWorkCaption] = useState("");
  const [workPreview, setWorkPreview] = useState<{ uri: string; type: "image" | "video" } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user.id) return;
      const profile = await getMyWorkerProfile(session.user.id);
      if (profile) setWorker(profile);
    }
    void loadProfile();
  }, [session?.user.id]);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("Login failed", error.message);
  }

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) Alert.alert("Signup failed", error.message);
    else Alert.alert("Account created", "Now login and create your worker profile.");
  }

  async function chooseProfilePhoto() {
    Alert.alert("Coming soon", "Photo upload will be enabled after the app launch test is stable.");
  }

  async function chooseWorkMedia() {
    Alert.alert("Coming soon", "Work photo/video upload will be enabled after the app launch test is stable.");
  }

  async function saveProfile() {
    if (!session?.user.id) return;
    setLoading(true);
    const { error } = await saveWorkerProfile(session.user.id, worker);
    setLoading(false);
    if (error) Alert.alert("Save failed", error.message);
    else Alert.alert("Profile saved", "Your MistriHub profile is live.");
  }

  async function publishWorkPost() {
    if (!session?.user.id || !worker.id || !workPreview) return Alert.alert("Profile needed", "Save your worker profile and choose work media first.");
    try {
      setLoading(true);
      const mediaUrl = await uploadMedia(session.user.id, workPreview.uri, "work", workPreview.type);
      const { error } = await createWorkPost(worker.id, mediaUrl, workPreview.type, workCaption || "Recent work update");
      if (error) throw error;
      setWorkPreview(null);
      setWorkCaption("");
      Alert.alert("Published", "Your work update is live.");
    } catch (error: any) {
      Alert.alert("Publish failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Worker login</Text>
          <Text style={styles.subtitle}>Create a free MistriHub worker account.</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={styles.input} />
          <Pressable disabled={loading} onPress={signIn} style={styles.primary}><Text style={styles.primaryText}>Login</Text></Pressable>
          <Pressable disabled={loading} onPress={signUp} style={styles.secondary}><Text style={styles.secondaryText}>Create account</Text></Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Worker dashboard</Text>
      <Text style={styles.subtitle}>Edit profile and upload real work updates.</Text>

      <View style={styles.card}>
        {worker.profilePhoto ? <Image source={{ uri: worker.profilePhoto }} style={styles.profilePhoto} /> : null}
        <Pressable onPress={chooseProfilePhoto} style={styles.secondary}><Text style={styles.secondaryText}>Upload profile photo</Text></Pressable>
        <TextInput value={worker.name ?? ""} onChangeText={(name) => setWorker((current) => ({ ...current, name }))} placeholder="Full name" style={styles.input} />
        <TextInput value={worker.city ?? ""} onChangeText={(city) => setWorker((current) => ({ ...current, city }))} placeholder="City" style={styles.input} />
        <TextInput value={worker.location ?? ""} onChangeText={(location) => setWorker((current) => ({ ...current, location }))} placeholder="Area / location" style={styles.input} />
        <TextInput value={worker.phone ?? ""} onChangeText={(phone) => setWorker((current) => ({ ...current, phone, whatsapp: phone }))} placeholder="WhatsApp number" keyboardType="phone-pad" style={styles.input} />
        <TextInput value={String(worker.experienceYears ?? "")} onChangeText={(value) => setWorker((current) => ({ ...current, experienceYears: Number(value) || 0 }))} placeholder="Experience years" keyboardType="number-pad" style={styles.input} />
        <TextInput value={String(worker.startingPrice ?? "")} onChangeText={(value) => setWorker((current) => ({ ...current, startingPrice: Number(value) || 0 }))} placeholder="Starting price" keyboardType="number-pad" style={styles.input} />
        <TextInput value={worker.shortDescription ?? ""} onChangeText={(shortDescription) => setWorker((current) => ({ ...current, shortDescription }))} placeholder="Short description" style={[styles.input, styles.textarea]} multiline />

        <Text style={styles.label}>Category</Text>
        <View style={styles.wrap}>
          {categories.map((item) => (
            <Pressable key={item.id} onPress={() => setWorker((current) => ({ ...current, categorySlug: item.slug as CategorySlug, category: item.name }))} style={[styles.chip, worker.categorySlug === item.slug && styles.activeChip]}>
              <Text style={[styles.chipText, worker.categorySlug === item.slug && styles.activeChipText]}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable disabled={loading} onPress={saveProfile} style={styles.primary}><Text style={styles.primaryText}>Save profile</Text></Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Upload work photo/video</Text>
        {workPreview ? <Text style={styles.subtitle}>Selected {workPreview.type}: ready to publish</Text> : null}
        <TextInput value={workCaption} onChangeText={setWorkCaption} placeholder="Caption" style={styles.input} />
        <Pressable onPress={chooseWorkMedia} style={styles.secondary}><Text style={styles.secondaryText}>Choose photo/video</Text></Pressable>
        <Pressable disabled={loading} onPress={publishWorkPost} style={styles.primary}><Text style={styles.primaryText}>Publish work update</Text></Pressable>
      </View>

      <Pressable onPress={() => supabase.auth.signOut()} style={styles.logout}><Text style={styles.logoutText}>Logout</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 110 },
  card: { backgroundColor: "#fff", borderRadius: 22, padding: 16, marginBottom: 14, shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  title: { fontSize: 28, fontWeight: "900", color: "#14213d" },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 14, lineHeight: 21 },
  heading: { fontSize: 20, fontWeight: "900", color: "#14213d", marginBottom: 10 },
  label: { color: "#14213d", fontWeight: "900", marginBottom: 8 },
  input: { backgroundColor: "#f1f5f9", borderRadius: 14, paddingHorizontal: 12, minHeight: 48, marginBottom: 10, fontWeight: "700" },
  textarea: { minHeight: 90, textAlignVertical: "top", paddingTop: 12 },
  primary: { backgroundColor: "#0f766e", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondary: { backgroundColor: "#e0f2fe", borderRadius: 14, paddingVertical: 13, alignItems: "center", marginBottom: 10 },
  secondaryText: { color: "#0369a1", fontWeight: "900" },
  profilePhoto: { width: 120, height: 120, borderRadius: 60, alignSelf: "center", marginBottom: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: { backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  activeChip: { backgroundColor: "#0f766e" },
  chipText: { color: "#334155", fontWeight: "900", fontSize: 12 },
  activeChipText: { color: "#fff" },
  logout: { alignItems: "center", paddingVertical: 14 },
  logoutText: { color: "#be123c", fontWeight: "900" }
});


