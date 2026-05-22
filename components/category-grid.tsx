import Link from "next/link";
import { Car, Drill, Fan, Hammer, Paintbrush, PlugZap, Wrench, Pentool } from "lucide-react";
import { categories } from "@/lib/categories";

const icons = {
  electrician: PlugZap,
  plumber: Wrench,
  driver: Car,
  carpenter: Hammer,
  mechanic: Drill,
  painter: Paintbrush,
  "ac-repair": Fan,
  "graphic-designer": Stylus
};

export function CategoryGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = icons[category.slug];

        return (
          <Link
            key={category.id}
            href={`/?category=${category.slug}#workers`}
            className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-brand">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-ink">{category.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
