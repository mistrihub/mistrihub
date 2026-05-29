"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export function ProfileLogoutButton() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!hasSupabaseConfig || !supabase) return;
      const { data } = await supabase.auth.getSession();
      setLoggedIn(Boolean(data.session));
    }

    void loadSession();
  }, []);

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setLoggedIn(false);
    window.location.href = "/";
  }

  if (!loggedIn) return null;

  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={logout}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-rose-50 px-5 text-sm font-bold text-rose-700"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Logout
      </button>
    </div>
  );
}
