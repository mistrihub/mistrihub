import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, ViewToken } from "react-native";
import { getWorkPosts, getWorkers } from "../lib/api";
import type { WorkPost, Worker } from "../types";
import { WorkPostCard } from "../components/WorkPostCard";

export function FeedScreen({ onOpenWorker }: { onOpenWorker: (worker: Worker) => void }) {
  const [posts, setPosts] = useState<WorkPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 65 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<WorkPost>[] }) => {
    const firstVisible = viewableItems.find((item) => item.isViewable && item.item.mediaType === "video");
    setActivePostId(firstVisible?.item.id ?? null);
  }).current;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [postData, workers] = await Promise.all([getWorkPosts(40), getWorkers({ sort: "rating" })]);
      const workerMap = new Map(workers.map((worker: Worker) => [worker.id, worker]));
      const nextPosts = postData.map((post) => ({ ...post, worker: workerMap.get(post.workerId) }));
      setPosts(nextPosts);
      setActivePostId(nextPosts.find((post) => post.mediaType === "video")?.id ?? null);
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.loader} color="#0f766e" />;
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={posts}
      keyExtractor={(post) => post.id}
      renderItem={({ item }) => <WorkPostCard post={item} active={activePostId === item.id} onOpenWorker={onOpenWorker} />}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      ListHeaderComponent={(
        <>
          <Text style={styles.title}>Latest work photos & videos</Text>
          <Text style={styles.subtitle}>Watch real work updates from local workers.</Text>
        </>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No work updates yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 110 },
  loader: { flex: 1, backgroundColor: "#f8fafc" },
  title: { fontSize: 28, fontWeight: "900", color: "#14213d" },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 16 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40, fontWeight: "800" }
});

