import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/categories";
import { cityToSlug, priorityServiceSlugs, seoCities } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "Local Workers Near Me by City | MistriHub Services",
  description: "Find electricians, plumbers, drivers, carpenters, mechanics, painters, AC repair, helpers, labourers, masons, and designers near you by Indian city."
};

export default function ServicesPage() {
  const visibleCategories = categories.filter((category) => priorityServiceSlugs.includes(category.slug));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-brand">Service areas</p>
      <h1 className="mt-2 text-4xl font-black text-ink">Find Local Workers Near Me by Service and City</h1>
      <p className="mt-4 max-w-3xl leading-8 text-slate-600">Browse MistriHub service pages for popular near me searches in Indian cities. Find rated workers, compare profiles, and contact directly on WhatsApp. Fully free, no hidden cost.</p>
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


