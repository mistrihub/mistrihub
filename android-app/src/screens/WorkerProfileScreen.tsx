import { useEffect, useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { addReview, getReviews } from "../lib/api";
import type { Review, Worker } from "../types";

export function WorkerProfileScreen({ worker, onBack }: { worker: Worker; onBack: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    getReviews(worker.id).then(setReviews);
  }, [worker.id]);

  function callWorker() {
    Linking.openURL(`tel:${worker.phone}`);
  }

  function whatsappWorker() {
    const phone = worker.whatsapp.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${phone}?text=Hi ${worker.name}, I found your profile on MistriHub.`);
  }

  async function submitReview() {
    const nextRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const { error } = await addReview(worker.id, nextRating, reviewText.trim());
    if (error) {
      Alert.alert("Review failed", error.message);
      return;
    }
    setReviewText("");
    Alert.alert("Thank you", "Your review has been submitted.");
    getReviews(worker.id).then(setReviews);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>Back</Text></Pressable>
      <View style={styles.card}>
        <Image source={{ uri: worker.profilePhoto }} style={styles.photo} />
        <Text style={styles.name}>{worker.name}</Text>
        <Text style={styles.meta}>{worker.category} in {worker.city}</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>★ {worker.rating.toFixed(1)}</Text>
          <Text style={styles.stat}>{worker.experienceYears}+ yrs</Text>
          <Text style={styles.stat}>Rs {worker.startingPrice}+</Text>
        </View>
        <Text style={styles.desc}>{worker.bio || worker.shortDescription}</Text>
        <View style={styles.actions}>
          <Pressable onPress={whatsappWorker} style={styles.primary}><Text style={styles.primaryText}>WhatsApp</Text></Pressable>
          <Pressable onPress={callWorker} style={styles.secondary}><Text style={styles.secondaryText}>Call</Text></Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Service details</Text>
        {worker.serviceDetails.map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Add review</Text>
        <TextInput value={rating} onChangeText={setRating} keyboardType="number-pad" placeholder="Rating 1-5" style={styles.input} />
        <TextInput value={reviewText} onChangeText={setReviewText} placeholder="Write review" style={[styles.input, styles.textarea]} multiline />
        <Pressable onPress={submitReview} style={styles.primary}><Text style={styles.primaryText}>Submit review</Text></Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Reviews</Text>
        {reviews.length === 0 ? <Text style={styles.desc}>No reviews yet.</Text> : reviews.map((review) => (
          <View key={review.id} style={styles.review}>
            <Text style={styles.reviewName}>★ {review.rating} {review.customerName}</Text>
            <Text style={styles.desc}>{review.reviewText}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingBottom: 110 },
  back: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "#e0f2fe", borderRadius: 12, marginBottom: 12 },
  backText: { color: "#0369a1", fontWeight: "900" },
  card: { backgroundColor: "#fff", borderRadius: 22, padding: 16, marginBottom: 14, shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  photo: { width: "100%", height: 260, borderRadius: 18, backgroundColor: "#e2e8f0" },
  name: { fontSize: 26, fontWeight: "900", color: "#14213d", marginTop: 14 },
  meta: { color: "#0f766e", fontWeight: "900", marginTop: 4 },
  stats: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  stat: { backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, fontWeight: "900", color: "#334155" },
  desc: { color: "#64748b", lineHeight: 22, marginTop: 8 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  primary: { backgroundColor: "#0f766e", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16, alignItems: "center", flex: 1 },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondary: { backgroundColor: "#f1f5f9", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16, alignItems: "center", flex: 1 },
  secondaryText: { color: "#14213d", fontWeight: "900" },
  heading: { fontSize: 20, fontWeight: "900", color: "#14213d", marginBottom: 8 },
  bullet: { color: "#334155", marginTop: 7, fontWeight: "700" },
  input: { backgroundColor: "#f1f5f9", borderRadius: 14, paddingHorizontal: 12, minHeight: 46, marginBottom: 10, fontWeight: "700" },
  textarea: { minHeight: 90, textAlignVertical: "top", paddingTop: 12 },
  review: { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10, marginTop: 10 },
  reviewName: { color: "#14213d", fontWeight: "900" }
});
