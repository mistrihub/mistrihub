"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, UploadCloud, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type HeaderWorkerState = {
  loggedIn: boolean;
  workerId: string;
  profilePhoto: string;
};

function useHeaderWorker() {
  const [state, setState] = useState<HeaderWorkerState>({
    loggedIn: false,
    workerId: "",
    profilePhoto: ""
  });

  useEffect(() => {
    async function loadAccount() {
      if (!hasSupabaseConfig || !supabase) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        setState({ loggedIn: false, workerId: "", profilePhoto: "" });
        return;
      }

      const { data } = await supabase
        .from("workers")
        .select("id, profile_photo")
        .eq("user_id", userId)
        .maybeSingle();

      setState({
        loggedIn: true,
        workerId: data?.id ? String(data.id) : "",
        profilePhoto: data?.profile_photo ? String(data.profile_photo) : ""
      });
    }

    void loadAccount();
  }, []);

  return state;
}

export function HeaderAccount() {
  const { loggedIn, workerId, profilePhoto } = useHeaderWorker();

  if (loggedIn && profilePhoto) {
    return (
      <Link
        href={workerId ? `/workers/${workerId}` : "/dashboard?panel=profile"}
        className="relative inline-flex h-10 w-10 overflow-hidden rounded-full bg-slate-100 ring-2 ring-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        aria-label="View logged in worker profile"
      >
        <Image src={profilePhoto} alt="Worker profile" fill className="object-cover" sizes="40px" />
      </Link>
    );
  }

  return (
    <Link
      href="/auth"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-0 sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
    >
      <UserPlus className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Join</span>
    </Link>
  );
}

export function HeaderDashboardButton() {
  const { loggedIn } = useHeaderWorker();

  if (!loggedIn) return null;

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard?panel=profile"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-ink transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-0 sm:h-10 sm:w-10"
        aria-label="Edit worker profile"
        title="Edit profile"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link
        href="/dashboard?panel=upload"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-0 sm:h-10 sm:w-10"
        aria-label="Upload work feed"
        title="Upload feed"
      >
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}


