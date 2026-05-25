import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { categories } from "../lib/categories";
import { demoWorkers, getWorkers } from "../lib/api";
import type { Worker } from "../types";
import { WorkerCard } from "../components/WorkerCard";

export function HomeScreen({ onOpenWorker }: { onOpenWorker: (worker: Worker) => void }) {
  const [workers, setWorkers] = useState<Worker[]>(demoWorkers);
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await getWorkers({ category: category || undefined, city: city || undefined, sort: "rating" });
      setWorkers(data);
    } catch {
      setWorkers(demoWorkers);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image source={require("../../assets/header-logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Find Trusted Local Workers Near You</Text>
        <Text style={styles.subtitle}>Search electricians, plumbers, drivers, carpenters, mechanics, painters, and AC repair technicians. Fully free, no hidden cost.</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput value={city} onChangeText={setCity} placeholder="City or location" style={styles.input} />
        <Pressable onPress={load} style={styles.searchButton}><Text style={styles.searchText}>Search</Text></Pressable>
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        <Pressable onPress={() => setCategory("")} style={[styles.chip, !category && styles.activeChip]}><Text style={[styles.chipText, !category && styles.activeChipText]}>All</Text></Pressable>
        {categories.map((item) => (
          <Pressable key={item.id} onPress={() => setCategory(item.slug)} style={[styles.chip, category === item.slug && styles.activeChip]}>
            <Text style={[styles.chipText, category === item.slug && styles.activeChipText]}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={load} style={styles.apply}><Text style={styles.applyText}>Apply category filter</Text></Pressable>

      <Text style={styles.sectionTitle}>Top workers</Text>
      {!loading ? <Text style={styles.loadedText}>Loaded {workers.length} workers</Text> : null}
      {loading ? <ActivityIndicator color="#0f766e" /> : workers.map((worker) => <WorkerCard key={worker.id} worker={worker} onOpen={onOpenWorker} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 110 },
  hero: { backgroundColor: "#fff", borderRadius: 24, padding: 18, marginBottom: 14 },
  logo: { width: "100%", height: 92, marginBottom: 8 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "900", color: "#14213d" },
  subtitle: { marginTop: 10, color: "#475569", lineHeight: 22 },
  searchBox: { backgroundColor: "#fff", borderRadius: 18, padding: 10, flexDirection: "row", gap: 8, marginBottom: 18 },
  input: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 12, height: 46, fontWeight: "700" },
  searchButton: { backgroundColor: "#0f766e", borderRadius: 12, paddingHorizontal: 18, justifyContent: "center" },
  searchText: { color: "#fff", fontWeight: "900" },
  sectionTitle: { fontSize: 22, fontWeight: "900", color: "#14213d", marginBottom: 10, marginTop: 4 },
  categoryRow: { gap: 8, paddingBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: "#fff" },
  activeChip: { backgroundColor: "#0f766e" },
  chipText: { color: "#334155", fontWeight: "900" },
  activeChipText: { color: "#fff" },
  apply: { alignSelf: "flex-start", backgroundColor: "#ccfbf1", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 16 },
  applyText: { color: "#0f766e", fontWeight: "900" },
  loadedText: { color: "#64748b", fontWeight: "800", marginBottom: 10 }
});


