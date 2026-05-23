import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MistriHub",
  description: "Learn how MistriHub helps customers find trusted local workers in India."
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-brand">About</p>
      <h1 className="mt-2 text-4xl font-black text-ink">About MistriHub</h1>
      <p className="mt-5 leading-8 text-slate-600">MistriHub connects customers with local workers such as electricians, plumbers, drivers, carpenters, mechanics, painters, AC repair technicians, helpers, labourers, and masons. Customers can compare profiles and contact workers directly on WhatsApp.</p>
    </section>
  );
}
