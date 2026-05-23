"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { categories } from "@/lib/categories";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(formData: FormData) {
    const params = new URLSearchParams();
    const category = String(formData.get("category") ?? "");
    const location = String(formData.get("location") ?? "");
    const rating = String(formData.get("rating") ?? "");
    const sort = String(formData.get("sort") ?? "");

    if (category) params.set("category", category);
    if (location) params.set("location", location);
    if (rating) params.set("rating", rating);
    if (sort) params.set("sort", sort);

    router.push(`/?${params.toString()}#workers`);
  }

  return (
    <form
      action={onSubmit}
      className="grid gap-2 rounded-xl bg-white p-3 shadow-soft sm:gap-3 md:grid-cols-[1fr_1fr_140px_170px_auto]"
    >
      <label className="sr-only" htmlFor="category">
        Category
      </label>
      <select
        id="category"
        name="category"
        defaultValue={searchParams.get("category") ?? ""}
        className="h-11 rounded-lg bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 sm:h-12"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="location">
        Location
      </label>
      <input
        id="location"
        name="location"
        defaultValue={searchParams.get("location") ?? ""}
        placeholder="Enter city or area"
        className="h-11 rounded-lg bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 sm:h-12"
      />
      <label className="sr-only" htmlFor="rating">
        Rating
      </label>
      <select
        id="rating"
        name="rating"
        defaultValue={searchParams.get("rating") ?? ""}
        className="h-11 rounded-lg bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 sm:h-12"
      >
        <option value="">Any rating</option>
        <option value="4">4.0+</option>
        <option value="4.5">4.5+</option>
        <option value="4.8">4.8+</option>
      </select>
      <label className="sr-only" htmlFor="sort">
        Sort
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={searchParams.get("sort") ?? "rating"}
        className="h-11 rounded-lg bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-teal-100 sm:h-12"
      >
        <option value="rating">Top rated</option>
        <option value="experience">Most experienced</option>
        <option value="newest">Newest</option>
      </select>
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition hover:bg-teal-800 sm:h-12">
        <Search className="h-4 w-4" aria-hidden="true" />
        Search
      </button>
      <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex md:col-span-5">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Search by category and location, then filter by rating or sort by experience.
      </div>
    </form>
  );
}

