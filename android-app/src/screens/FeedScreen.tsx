import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";
import { getWorkPosts, getWorkers } from "../lib/api";
import type { WorkPost, Worker } from "../types";
import { WorkPostCard } from "../components/WorkPostCard";

export function FeedScreen() {
  const [posts, setPosts] = useState<WorkPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [postData, workers] = await Promise.all([getWorkPosts(40), getWorkers({ sort: "rating" })]);
      const workerMap = new Map(workers.map((worker: Worker) => [worker.id, worker]));
      setPosts(postData.map((post) => ({ ...post, worker: workerMap.get(post.workerId) })));
      setLoading(false);
    }
    void load();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Latest work photos & videos</Text>
      <Text style={styles.subtitle}>Watch real work updates from local workers.</Text>
      {loading ? <ActivityIndicator color="#0f766e" /> : posts.map((post) => <WorkPostCard key={post.id} post={post} />)}
      {!loading && posts.length === 0 ? <Text style={styles.empty}>No work updates yet.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 110 },
  title: { fontSize: 28, fontWeight: "900", color: "#14213d" },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 16 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40, fontWeight: "800" }
});
