"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMessage("");

    if (!hasSupabaseConfig || !supabase) {
      setMessage("Add Supabase keys to .env.local to enable worker accounts.");
      return;
    }

    setLoading(true);
    const response =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    setMessage(mode === "signup" ? "Account created. Check your email if confirmation is enabled." : "Logged in.");
    router.push("/dashboard");
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`h-10 rounded-md text-sm font-bold ${mode === "signup" ? "bg-white text-brand shadow-sm" : "text-slate-600"}`}
        >
          Sign up
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`h-10 rounded-md text-sm font-bold ${mode === "login" ? "bg-white text-brand shadow-sm" : "text-slate-600"}`}
        >
          Login
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <span className="mt-2 flex h-12 items-center gap-2 rounded-lg border border-slate-200 px-3">
            <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full outline-none"
              placeholder="worker@example.com"
            />
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <span className="mt-2 flex h-12 items-center gap-2 rounded-lg border border-slate-200 px-3">
            <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full outline-none"
              placeholder="Minimum 6 characters"
            />
          </span>
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className="h-12 w-full rounded-lg bg-brand text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Please wait..." : mode === "signup" ? "Create worker account" : "Login"}
        </button>
        {message ? <p className="rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700">{message}</p> : null}
      </div>
    </div>
  );
}
