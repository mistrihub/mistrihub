import { useEffect, useState } from "react";
import { Image, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { addWorkPostComment, addWorkPostShare, getWorkPostComments, likeWorkPost } from "../lib/api";
import type { WorkPost, WorkPostComment, Worker } from "../types";

function FeedVideo({ uri, active }: { uri: string; active: boolean }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = false;
    videoPlayer.volume = 1;
  });

  useEffect(() => {
    player.muted = false;
    player.volume = 1;
    if (active) player.play();
    else player.pause();
  }, [active, player]);

  return <VideoView player={player} style={styles.media} contentFit="contain" nativeControls={false} />;
}

export function WorkPostCard({ post, active = true, onOpenWorker }: { post: WorkPost; active?: boolean; onOpenWorker?: (worker: Worker) => void }) {
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [liked, setLiked] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<WorkPostComment[]>([]);
  const [busy, setBusy] = useState(false);

  async function sharePost() {
    await addWorkPostShare(post.id);
    await Share.share({ message: `${post.caption}\nShared from MistriHub` });
  }

  async function handleLike() {
    if (busy || liked) return;
    setBusy(true);
    const { error } = await likeWorkPost(post.id);
    setBusy(false);
    if (!error) {
      setLiked(true);
      setLikeCount((count) => count + 1);
    }
  }

  async function openComments() {
    const nextOpen = !commentOpen;
    setCommentOpen(nextOpen);
    if (nextOpen && comments.length === 0) setComments(await getWorkPostComments(post.id));
  }

  async function submitComment() {
    const text = commentText.trim();
    if (!text || busy) return;
    setBusy(true);
    const { error } = await addWorkPostComment(post.id, text);
    setBusy(false);
    if (!error) {
      setCommentText("");
      setCommentCount((count) => count + 1);
      setComments([{ id: `${Date.now()}`, postId: post.id, visitorName: "App user", commentText: text, createdAt: new Date().toISOString() }, ...comments]);
      setCommentOpen(true);
    }
  }

  const headerContent = (
    <View style={styles.headerInner}>
      {post.worker?.profilePhoto ? <Image source={{ uri: post.worker.profilePhoto }} style={styles.avatar} /> : <View style={styles.avatar} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{post.worker?.name ?? "MistriHub worker"}</Text>
        <Text style={styles.meta}>{post.worker?.category ?? "Work update"} {post.worker?.city ? `in ${post.worker.city}` : ""}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {post.worker && onOpenWorker ? (
        <Pressable onPress={() => onOpenWorker(post.worker as Worker)} style={styles.header}>{headerContent}</Pressable>
      ) : (
        <View style={styles.header}>{headerContent}</View>
      )}

      {post.mediaType === "video" ? <FeedVideo uri={post.mediaUrl} active={active} /> : <Image source={{ uri: post.mediaUrl }} style={styles.media} resizeMode="contain" />}

      <Text style={styles.caption}>{post.caption}</Text>
      <View style={styles.actions}>
        <Pressable disabled={busy || liked} onPress={handleLike} style={styles.actionButton}>
          <Text style={[styles.actionIcon, liked && styles.actionDone]}>♡</Text>
          <Text style={[styles.actionCount, liked && styles.actionDone]}>{likeCount}</Text>
        </Pressable>
        <Pressable onPress={openComments} style={styles.actionButton}>
          <Text style={styles.actionIcon}>▢</Text>
          <Text style={styles.actionCount}>{commentCount}</Text>
        </Pressable>
        <Pressable onPress={sharePost} style={styles.actionButton}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionCount}>Share</Text>
        </Pressable>
      </View>

      {commentOpen ? (
        <View style={styles.commentBox}>
          <View style={styles.commentInputRow}>
            <TextInput value={commentText} onChangeText={setCommentText} placeholder="Write a comment" style={styles.commentInput} />
            <Pressable disabled={busy} onPress={submitComment} style={styles.commentButton}><Text style={styles.commentButtonText}>Post</Text></Pressable>
          </View>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentName}>{comment.visitorName}</Text>
              <Text style={styles.commentText}>{comment.commentText}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 16, overflow: "hidden", shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  header: { padding: 12 },
  headerInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#e2e8f0" },
  name: { fontWeight: "900", color: "#14213d", fontSize: 15 },
  meta: { color: "#64748b", fontSize: 12, marginTop: 2 },
  media: { width: "100%", height: 390, backgroundColor: "#000" },
  caption: { paddingHorizontal: 12, paddingTop: 12, color: "#334155", lineHeight: 20 },
  actions: { padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  actionButton: { minWidth: 58, minHeight: 38, borderRadius: 999, backgroundColor: "#ecfeff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 10 },
  actionIcon: { fontSize: 20, color: "#0f766e", fontWeight: "900" },
  actionCount: { fontSize: 12, color: "#0f766e", fontWeight: "900" },
  actionDone: { color: "#64748b" },
  commentBox: { paddingHorizontal: 12, paddingBottom: 12 },
  commentInputRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  commentInput: { flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: "#f1f5f9", paddingHorizontal: 12, fontWeight: "700" },
  commentButton: { backgroundColor: "#0f766e", borderRadius: 12, paddingHorizontal: 14, justifyContent: "center" },
  commentButtonText: { color: "#fff", fontWeight: "900" },
  commentItem: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 10, marginTop: 6 },
  commentName: { color: "#14213d", fontWeight: "900", fontSize: 12 },
  commentText: { color: "#334155", marginTop: 2 }
});
