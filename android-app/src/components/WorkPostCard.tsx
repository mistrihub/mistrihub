import { Image, Linking, Pressable, Share, StyleSheet, Text, View } from "react-native";
import type { WorkPost } from "../types";

export function WorkPostCard({ post }: { post: WorkPost }) {
  async function sharePost() {
    await Share.share({ message: `${post.caption}\nShared from MistriHub` });
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {post.worker?.profilePhoto ? <Image source={{ uri: post.worker.profilePhoto }} style={styles.avatar} /> : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{post.worker?.name ?? "MistriHub worker"}</Text>
          <Text style={styles.meta}>{post.worker?.category ?? "Work update"} {post.worker?.city ? `in ${post.worker.city}` : ""}</Text>
        </View>
      </View>

      {post.mediaType === "video" ? (
        <Pressable style={[styles.media, styles.videoBox]} onPress={() => Linking.openURL(post.mediaUrl)}>
          <Text style={styles.videoText}>Tap to open video</Text>
        </Pressable>
      ) : (
        <Image source={{ uri: post.mediaUrl }} style={styles.media} resizeMode="contain" />
      )}

      <Text style={styles.caption}>{post.caption}</Text>
      <View style={styles.actions}>
        <Text style={styles.action}>Like {post.likeCount}</Text>
        <Text style={styles.action}>Comment {post.commentCount}</Text>
        <Pressable onPress={sharePost}><Text style={styles.action}>Share</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 16, overflow: "hidden", shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#e2e8f0" },
  name: { fontWeight: "900", color: "#14213d", fontSize: 15 },
  meta: { color: "#64748b", fontSize: 12, marginTop: 2 },
  media: { width: "100%", height: 360, backgroundColor: "#000" },
  videoBox: { alignItems: "center", justifyContent: "center" },
  videoText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  caption: { paddingHorizontal: 12, paddingTop: 12, color: "#334155", lineHeight: 20 },
  actions: { padding: 12, flexDirection: "row", gap: 12 },
  action: { fontWeight: "900", color: "#0f766e" }
});
