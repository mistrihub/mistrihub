"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, Search, X } from "lucide-react";
import { categories } from "@/lib/categories";

export function NearbyFilters({ cities }: { cities: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(formData: FormData) {
    const params = new URLSearchParams();
    const city = String(formData.get("city") ?? "");
    const category = String(formData.get("category") ?? "");
    const rating = String(formData.get("rating") ?? "");

    if (city) params.set("city", city);
    if (category) params.set("category", category);
    if (rating) params.set("rating", rating);

    router.push(`/nearby?${params.toString()}`);
  }

  return (
    <form action={onSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_150px_auto_auto]">
      <label className="sr-only" htmlFor="nearby-city">
        City
      </label>
      <select
        id="nearby-city"
        name="city"
        defaultValue={searchParams.get("city") ?? ""}
        className="h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand"
      >
        <option value="">All cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="nearby-category">
        Category
      </label>
      <select
        id="nearby-category"
        name="category"
        defaultValue={searchParams.get("category") ?? ""}
        className="h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="nearby-rating">
        Rating
      </label>
      <select
        id="nearby-rating"
        name="rating"
        defaultValue={searchParams.get("rating") ?? ""}
        className="h-12 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand"
      >
        <option value="">Any rating</option>
        <option value="4">4.0+</option>
        <option value="4.5">4.5+</option>
        <option value="4.8">4.8+</option>
      </select>

        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition hover:bg-teal-800">
          <Search className="h-4 w-4" aria-hidden="true" />
          Find
        </button>

        <Link
          href="/nearby"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-ink transition hover:border-brand"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Filter className="h-4 w-4" aria-hidden="true" />
        No GPS tracking. Choose a city or area and LocalPro ranks workers by rating.
      </div>
    </form>
  );
}
