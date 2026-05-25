import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { Worker } from "../types";

export function WorkerCard({ worker, onOpen }: { worker: Worker; onOpen: (worker: Worker) => void }) {
  function openWhatsapp() {
    const phone = worker.whatsapp.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${phone}?text=Hi ${worker.name}, I found your profile on MistriHub.`);
  }

  return (
    <Pressable style={styles.card} onPress={() => onOpen(worker)}>
      <Image source={{ uri: worker.profilePhoto }} style={styles.photo} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{worker.name}</Text>
          <Text style={styles.rating}>★ {worker.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.meta}>{worker.category} in {worker.city}</Text>
        <Text style={styles.desc} numberOfLines={2}>{worker.shortDescription}</Text>
        <View style={styles.rowBottom}>
          <Text style={styles.price}>From Rs {worker.startingPrice}</Text>
          <Pressable style={styles.whatsapp} onPress={openWhatsapp}>
            <Text style={styles.whatsappText}>WhatsApp</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 12, padding: 12, backgroundColor: "#fff", borderRadius: 18, marginBottom: 12, shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  photo: { width: 82, height: 92, borderRadius: 14, backgroundColor: "#e2e8f0" },
  body: { flex: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "center" },
  name: { flex: 1, fontSize: 16, fontWeight: "900", color: "#14213d" },
  rating: { fontSize: 12, fontWeight: "900", color: "#92400e", backgroundColor: "#fffbeb", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  meta: { marginTop: 2, color: "#0f766e", fontWeight: "800", fontSize: 12 },
  desc: { marginTop: 7, color: "#64748b", lineHeight: 18 },
  rowBottom: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { color: "#0f172a", fontWeight: "800" },
  whatsapp: { backgroundColor: "#0f766e", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  whatsappText: { color: "#fff", fontWeight: "900", fontSize: 12 }
});
