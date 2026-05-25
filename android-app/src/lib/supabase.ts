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
  try {
    const raw = await AsyncStorage.getItem(sessionKey);
    return raw ? (JSON.parse(raw) as AppSession) : null;
  } catch {
    return null;
  }
}

async function saveSession(session: AppSession | null) {
  if (session) await AsyncStorage.setItem(sessionKey, JSON.stringify(session));
  else await AsyncStorage.removeItem(sessionKey);
  notify(session ? "SIGNED_IN" : "SIGNED_OUT", session);
}

export async function supabaseFetch(path: string, init: RequestInit = {}, useUserToken = false) {
  const session = useUserToken ? await getStoredSession() : null;
  const customHeaders = (init.headers ?? {}) as Record<string, string>;
  const headers: Record<string, string> = {
    ...customHeaders,
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${session?.access_token ?? supabaseAnonKey}`
  };
  if (!headers["Content-Type"] && init.body) headers["Content-Type"] = "application/json";
  return Promise.race([
    fetch(`${supabaseUrl}${path}`, { ...init, headers }),
    new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))
  ]);
}

async function parseAuthResponse(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { msg: text || "Request failed" };
  }
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
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await parseAuthResponse(response);
        if (!response.ok) return { data: null, error: { message: data.error_description || data.msg || "Login failed" } };
        const session: AppSession = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
        await saveSession(session);
        return { data: { session, user: data.user }, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error?.message || "Login failed" } };
      }
    },
    async signUp({ email, password }: { email: string; password: string }) {
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: "POST",
          headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await parseAuthResponse(response);
        if (!response.ok) return { data: null, error: { message: data.error_description || data.msg || "Signup failed" } };
        if (data.access_token && data.user) await saveSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
        return { data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error?.message || "Signup failed" } };
      }
    },
    async signOut() {
      await saveSession(null);
      return { error: null };
    }
  }
};

