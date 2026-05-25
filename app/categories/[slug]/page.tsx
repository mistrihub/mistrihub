import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { WorkerList } from "@/components/worker-list";
import { categories } from "@/lib/categories";
import { cityToSlug, getNearMeKeywords, seoCities } from "@/lib/seo-pages";
import { getWorkers } from "@/lib/workers";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return { title: "Category not found" };
  }

  return {
    title: `${category.name} Near Me | Trusted Local Workers - MistriHub`,
    description: `Find trusted ${category.name.toLowerCase()} near me on MistriHub. Compare profiles, ratings, experience, location, and contact directly on WhatsApp. Fully free, no hidden cost.`,
    keywords: getNearMeKeywords(category.name, "India")
  };
}

export default async function CategoryWorkersPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const workers = await getWorkers({ category: category.slug, sort: "rating" });

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-teal-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-5xl">{category.name}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{category.description}. Find trusted {category.name.toLowerCase()} near me, compare profiles, and contact directly on WhatsApp. Fully free, no hidden cost.</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {workers.length} profile{workers.length === 1 ? "" : "s"} found
          </p>
        </div>

        <WorkerList workers={workers} />

        <div className="mt-10 rounded-xl bg-slate-50 p-4 sm:p-6">
          <h2 className="text-xl font-black text-ink">Popular {category.name} city searches</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {seoCities.slice(0, 12).map((city) => (
              <Link
                key={city}
                href={`/services/${category.slug}/${cityToSlug(city)}`}
                className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:text-brand"
              >
                {category.name} near me in {city}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}


