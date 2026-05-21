import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth-panel";

export const metadata: Metadata = {
  title: "Worker Login",
  description: "Create or access your LocalPro worker account."
};

export default function AuthPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_430px] lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Worker platform</p>
        <h1 className="mt-2 text-4xl font-black leading-tight text-ink">Create your LocalPro worker profile</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Sign up with email and password, add your services, upload photos, and start receiving customer enquiries on WhatsApp.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Own profile", "Public reviews", "Direct leads"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-ink">
              {item}
            </div>
          ))}
        </div>
      </div>
      <AuthPanel />
    </section>
  );
}
