import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { WorkerList } from "@/components/worker-list";
import { categories } from "@/lib/categories";
import { getWorkers } from "@/lib/workers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Workers | MistriHub",
  description: "Search MistriHub workers by category, city, rating, and experience."
};

type SearchPageProps = {
  searchParams: Promise<{
    category?: string;
    location?: string;
    rating?: string;
    sort?: "rating" | "experience" | "newest";
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rating = params.rating ? Number(params.rating) : undefined;
  const workers = await getWorkers({
    category: params.category,
    location: params.location,
    rating: Number.isFinite(rating) ? rating : undefined,
    sort: params.sort
  });
  const selectedCategory = categories.find((category) => category.slug === params.category);
  const hasFilters = Boolean(params.category || params.location || params.rating || params.sort);

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-teal-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-5xl">Search workers</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Find workers by category, city, rating, and experience.
          </p>
        </div>

        <div className="mb-8">
          <Suspense>
            <SearchForm />
          </Suspense>
        </div>

        <div className="mb-6 rounded-xl bg-slate-50 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">Category: {selectedCategory?.name ?? "All"}</span>
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">Location: {params.location || "All"}</span>
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">Rating: {params.rating ? `${params.rating}+` : "Any"}</span>
            <span className="rounded-full bg-white px-3 py-1 text-slate-700">Results: {workers.length}</span>
          </div>
        </div>

        {hasFilters ? <WorkerList workers={workers} /> : <WorkerList workers={workers} />}
      </section>
    </main>
  );
}
