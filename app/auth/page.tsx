import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth-panel";

export const metadata: Metadata = {
  title: "Worker Login",
  description: "Create or access your LocalPro worker account."
};

export default function AuthPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_430px] lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Worker platform</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">Create your MistriHub worker account</h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          Sign up with email and password first. After login, open Upload Feed from your dashboard to add work photos/videos and manage your public worker profile.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Free account", "Public profile", "Upload after login"].map((item) => (
            <div key={item} className="rounded-lg bg-white p-4 text-sm font-bold text-ink shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </div>
      <AuthPanel />
    </section>
  );
}


