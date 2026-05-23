import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact MistriHub",
  description: "Contact MistriHub for local worker listing and customer support."
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-brand">Contact</p>
      <h1 className="mt-2 text-4xl font-black text-ink">Contact MistriHub</h1>
      <p className="mt-5 leading-8 text-slate-600">For support, for suggestion, worker listing help, business related query, or any issues, contact the MistriHub.in official support email id- mistrihub75@gmail.com .</p>
    </section>
  );
}
