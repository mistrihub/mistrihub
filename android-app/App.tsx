import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { FeedScreen } from "./src/screens/FeedScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { WorkerProfileScreen } from "./src/screens/WorkerProfileScreen";
import { getMyWorkerProfile } from "./src/lib/api";
import { AppSession, supabase } from "./src/lib/supabase";
import type { AppScreen, Worker } from "./src/types";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [ownWorker, setOwnWorker] = useState<Worker | null>(null);
  const [authRedirectPending, setAuthRedirectPending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "SIGNED_IN") setAuthRedirectPending(true);
      if (!nextSession) {
        setOwnWorker(null);
        if (screen === "dashboard" || screen === "upload" || screen === "profile") setScreen("home");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [screen]);

  useEffect(() => {
    async function loadOwnProfile() {
      if (!session?.user.id) return;
      const profile = await getMyWorkerProfile(session.user.id);
      setOwnWorker(profile);
      if (authRedirectPending) {
        if (profile) {
          setSelectedWorker(profile);
          setScreen("profile");
        } else {
          setScreen("dashboard");
        }
        setAuthRedirectPending(false);
      }
    }
    void loadOwnProfile();
  }, [session?.user.id, screen, authRedirectPending]);

  function openWorker(worker: Worker) {
    setSelectedWorker(worker);
    setScreen("profile");
  }

  function openOwnProfile() {
    if (ownWorker) {
      setSelectedWorker(ownWorker);
      setScreen("profile");
      return;
    }
    setScreen("dashboard");
  }

  function openEditProfile() {
    setScreen("dashboard");
  }

  function openUploadFeed() {
    setScreen("upload");
  }

  const loggedIn = Boolean(session);
  const active = selectedWorker && screen === "profile";
  const showingOwnProfile = Boolean(active && ownWorker && selectedWorker?.id === ownWorker.id);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Image source={require("./assets/header-logo.png")} style={styles.headerLogo} resizeMode="contain" />
      </View>

      <View style={styles.body}>
        {screen === "home" ? <HomeScreen onOpenWorker={openWorker} /> : null}
        {screen === "feed" ? <FeedScreen onOpenWorker={openWorker} /> : null}
        {screen === "dashboard" ? <DashboardScreen mode="profile" onProfileSaved={(worker) => {
          setOwnWorker(worker);
          setSelectedWorker(worker);
          setScreen("profile");
        }} /> : null}
        {screen === "upload" ? <DashboardScreen mode="upload" onProfileSaved={(worker) => setOwnWorker(worker)} /> : null}
        {active && selectedWorker ? <WorkerProfileScreen worker={selectedWorker} onBack={() => setScreen("home")} onEdit={showingOwnProfile ? openEditProfile : undefined} onUpload={showingOwnProfile ? openUploadFeed : undefined} /> : null}
      </View>

      <View style={styles.tabs}>
        <Tab label="Home" active={screen === "home"} onPress={() => setScreen("home")} />
        {loggedIn ? (
          <>
            <Tab label="Work" active={screen === "feed"} onPress={() => setScreen("feed")} />
            <Tab label="Profile" active={showingOwnProfile} onPress={openOwnProfile} />
          </>
        ) : (
          <>
            <Tab label="Work" active={screen === "feed"} onPress={() => setScreen("feed")} />
            <Tab label="Join" active={screen === "dashboard"} onPress={() => setScreen("dashboard")} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { height: 68, backgroundColor: "#fff", justifyContent: "center", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerLogo: { width: 190, height: 50, alignSelf: "flex-start" },
  body: { flex: 1 },
  tabs: { position: "absolute", left: 16, right: 16, bottom: 16, backgroundColor: "#14213d", borderRadius: 24, padding: 6, flexDirection: "row", gap: 6, shadowColor: "#0f172a", shadowOpacity: 0.22, shadowRadius: 18, elevation: 8 },
  tab: { flex: 1, paddingVertical: 13, borderRadius: 18, alignItems: "center" },
  activeTab: { backgroundColor: "#0f766e" },
  tabText: { color: "#cbd5e1", fontWeight: "900" },
  activeTabText: { color: "#fff" }
});






