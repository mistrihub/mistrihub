import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { categories } from "@/lib/categories";
import type { Worker } from "@/types/worker";
import { WorkerCard } from "@/components/worker-card";

function pluralizeCategory(name: string) {
  if (name === "AC Repair") return "AC Repair Technicians";
  if (name.endsWith("r")) return `${name}s`;
  return `${name}s`;
}

export function TopRatedNearby({
  workers,
  selectedCity,
  selectedCategory
}: {
  workers: Worker[];
  selectedCity?: string;
  selectedCategory?: string;
}) {
  const visibleCategories = categories.filter((category) => {
    if (selectedCategory) return category.slug === selectedCategory;
    return workers.some((worker) => worker.categorySlug === category.slug);
  });

  if (workers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-2xl font-black text-ink">No nearby workers found</h2>
        <p className="mt-2 text-slate-600">Try another city, category, or rating filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {visibleCategories.map((category) => {
        const categoryWorkers = workers
          .filter((worker) => worker.categorySlug === category.slug)
          .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
          .slice(0, 6);

        if (categoryWorkers.length === 0) return null;

        const cityLabel = selectedCity || categoryWorkers[0]?.city || "your city";

        return (
          <section key={category.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand">
                  <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                  Top rated nearby
                </p>
                <h2 className="mt-2 text-2xl font-black text-ink sm:text-3xl">
                  Top {pluralizeCategory(category.name)} in {cityLabel}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Showing {categoryWorkers.length} worker{categoryWorkers.length === 1 ? "" : "s"} sorted by highest rating.
                </p>
              </div>
              <Link
                href={`/?category=${category.slug}${selectedCity ? `&location=${encodeURIComponent(selectedCity)}` : ""}&sort=rating#workers`}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand"
              >
                View all
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categoryWorkers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
