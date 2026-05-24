import Link from "next/link";
import { Car, Drill, Fan, Hammer, Navigation, Paintbrush, PlugZap, Wrench } from "lucide-react";
import { categories } from "@/lib/categories";
import type { CategorySlug } from "@/types/worker";

const icons: Record<CategorySlug, typeof PlugZap> = {
  electrician: PlugZap,
  plumber: Wrench,
  driver: Car,
  carpenter: Hammer,
  mechanic: Drill,
  painter: Paintbrush,
  "ac-repair": Fan,
  "helper-labour": Wrench,
  "mason-plaster": Hammer
};

export function CategoryGrid({ limit }: { limit?: number }) {
  const visibleCategories = categories.slice(0, limit ? Math.max(limit - 1, 0) : categories.length);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        href="/nearby"
        className="group rounded-lg bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft sm:p-5"
      >
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-brand sm:mb-4 sm:h-11 sm:w-11">
          <Navigation className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="font-bold text-ink">Nearby Workers</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">Top rated workers near your current city</p>
      </Link>

      {visibleCategories.map((category) => {
        const Icon = icons[category.slug];

        return (
          <Link
            key={category.id}
            href={`/?category=${category.slug}#workers`}
            className="group rounded-lg bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft sm:p-5"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-brand sm:mb-4 sm:h-11 sm:w-11">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-ink">{category.name}</h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{category.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
