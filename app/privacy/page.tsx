import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the MistriHub privacy policy for customer and worker information."
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-brand">Privacy</p>
      <h1 className="mt-2 text-4xl font-black text-ink">Privacy Policy</h1>
      <p className="mt-5 leading-8 text-slate-600">MistriHub collects basic worker profile details, contact information, uploaded images, and customer reviews to operate the platform. Public worker profiles may show name, category, city, ratings, description, phone, WhatsApp, and gallery images.</p>
      <p className="mt-4 leading-8 text-slate-600">We use this information to help customers discover and contact local workers. Do not upload sensitive personal documents or private information to public profile fields.</p>
    </section>
  );
}
