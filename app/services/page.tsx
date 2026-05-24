import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/categories";
import { cityToSlug, priorityServiceSlugs, seoCities } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Local Services by City",
  description: "Browse MistriHub service pages by category and city, including electricians, plumbers, AC repair, helpers, labourers, and masons."
};

export default function ServicesPage() {
  const visibleCategories = categories.filter((category) => priorityServiceSlugs.includes(category.slug));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-brand">Service areas</p>
      <h1 className="mt-2 text-4xl font-black text-ink">Find local workers by service and city</h1>
      <p className="mt-4 max-w-3xl leading-8 text-slate-600">Browse useful MistriHub pages for popular services in major Indian cities. These pages help customers find rated workers and contact them directly on WhatsApp.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {visibleCategories.map((category) => (
          <article key={category.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-ink">{category.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {seoCities.map((city) => (
                <Link
                  key={city}
                  href={`/services/${category.slug}/${cityToSlug(city)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-brand hover:text-brand"
                >
                  {city}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

