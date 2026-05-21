import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { NearbyFilters } from "@/components/nearby-filters";
import { TopRatedNearby } from "@/components/top-rated-nearby";
import { categories } from "@/lib/categories";
import { getWorkers } from "@/lib/workers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Top Rated Nearby Workers",
  description: "Find top-rated electricians, plumbers, drivers, mechanics, painters, carpenters, and AC repair workers by city."
};

type NearbyPageProps = {
  searchParams: Promise<{
    city?: string;
    category?: string;
    rating?: string;
  }>;
};

export default async function NearbyPage({ searchParams }: NearbyPageProps) {
  const params = await searchParams;
  const rating = params.rating ? Number(params.rating) : undefined;
  const allWorkers = await getWorkers({ sort: "rating" });
  const cities = Array.from(new Set(allWorkers.map((worker) => worker.city).filter(Boolean))).sort();
  const selectedCity = params.city;
  const workers = await getWorkers({
    location: selectedCity,
    category: params.category,
    rating: Number.isFinite(rating) ? rating : undefined,
    sort: "rating"
  });
  const selectedCategory = categories.find((category) => category.slug === params.category);
  const cityLabel = selectedCity || "All cities";
  const topRating = workers[0]?.rating ?? 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand">Nearby workers</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-ink">Top Rated Nearby Workers</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Select a city and category to see the highest-rated local workers first. No live GPS tracking is used.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-brand">City: {cityLabel}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                Category: {selectedCategory?.name ?? "All"}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                Rating: {params.rating ? `${params.rating}+` : "Any"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3">
            <div className="rounded-lg bg-white p-4 text-center">
              <p className="text-2xl font-black text-ink">{workers.length}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Workers</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center">
              <p className="text-2xl font-black text-ink">{topRating || "-"}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Top rating</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center">
              <p className="text-2xl font-black text-ink">{cities.length}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Cities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Suspense>
          <NearbyFilters cities={cities} />
        </Suspense>
      </div>

      <TopRatedNearby workers={workers} selectedCity={selectedCity} selectedCategory={params.category} />

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
        <h2 className="text-xl font-black text-ink">Need a wider search?</h2>
        <p className="mt-2 text-slate-600">Browse all LocalPro workers and sort by rating or experience.</p>
        <Link
          href="/#workers"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-brand px-5 text-sm font-bold text-white transition hover:bg-teal-800"
        >
          Browse all workers
        </Link>
      </div>
    </section>
  );
}
