import AsyncStorage from "@react-native-async-storage/async-storage";

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const siteUrl = process.env.EXPO_PUBLIC_SITE_URL ?? "https://mistrihub.in";

export type AppSession = {
  access_token: string;
  refresh_token?: string;
  user: { id: string; email?: string };
};

type AuthListener = (event: string, session: AppSession | null) => void;
const sessionKey = "mistrihub_app_session";
const listeners = new Set<AuthListener>();

function notify(event: string, session: AppSession | null) {
  listeners.forEach((listener) => listener(event, session));
}

export async function getStoredSession() {
  const raw = await AsyncStorage.getItem(sessionKey);
  return raw ? (JSON.parse(raw) as AppSession) : null;
}

async function saveSession(session: AppSession | null) {
  if (session) await AsyncStorage.setItem(sessionKey, JSON.stringify(session));
  else await AsyncStorage.removeItem(sessionKey);
  notify(session ? "SIGNED_IN" : "SIGNED_OUT", session);
}

export async function supabaseFetch(path: string, init: RequestInit = {}, useUserToken = false) {
  const session = useUserToken ? await getStoredSession() : null;
  const headers = new Headers(init.headers);
  headers.set("apikey", supabaseAnonKey);
  headers.set("Authorization", `Bearer ${session?.access_token ?? supabaseAnonKey}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  return fetch(`${supabaseUrl}${path}`, { ...init, headers });
}

export const supabase = {
  auth: {
    async getSession() {
      return { data: { session: await getStoredSession() }, error: null };
    },
    onAuthStateChange(callback: AuthListener) {
      listeners.add(callback);
      return { data: { subscription: { unsubscribe: () => { listeners.delete(callback); } } } };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) return { data: null, error: { message: data.error_description || data.msg || "Login failed" } };
      const session: AppSession = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
      await saveSession(session);
      return { data: { session, user: data.user }, error: null };
    },
    async signUp({ email, password }: { email: string; password: string }) {
      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) return { data: null, error: { message: data.error_description || data.msg || "Signup failed" } };
      if (data.access_token && data.user) await saveSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
      return { data, error: null };
    },
    async signOut() {
      await saveSession(null);
      return { error: null };
    }
  }
};

