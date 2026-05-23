import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Read the MistriHub terms of use for customers and workers."
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-brand">Terms</p>
      <h1 className="mt-2 text-4xl font-black text-ink">Terms of Use</h1>
      <p className="mt-5 leading-8 text-slate-600">MistriHub is a discovery platform for local workers and customers. Customers contact workers directly, and workers are responsible for the accuracy of their profile, pricing, availability, and services.</p>
      <p className="mt-4 leading-8 text-slate-600">Users should verify worker details before hiring. MistriHub does not process payments in this MVP and does not guarantee work outcomes.</p>
    </section>
  );
}
