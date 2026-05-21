import type { Metadata } from "next";
import { CategoryGrid } from "@/components/category-grid";

export const metadata: Metadata = {
  title: "Service Categories",
  description: "Browse LocalPro categories including electricians, plumbers, drivers, carpenters, mechanics, painters, and AC repair."
};

export default function CategoriesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">LocalPro categories</p>
        <h1 className="mt-2 text-4xl font-black text-ink">Find the right worker faster</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Browse popular local service categories and connect directly with workers through WhatsApp.
        </p>
      </div>
      <CategoryGrid />
    </section>
  );
}
