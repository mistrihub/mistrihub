import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { WorkerList } from "@/components/worker-list";
import { getWorkers } from "@/lib/workers";
import {
  cityToSlug,
  getCategoryBySlug,
  getServicePageDescription,
  getServicePageTitle,
  priorityServiceSlugs,
  seoCities,
  serviceUseCases,
  slugToCity
} from "@/lib/seo-pages";
import type { CategorySlug } from "@/types/worker";

export const dynamic = "force-dynamic";

type ServiceCityPageProps = {
  params: Promise<{
    category: string;
    city: string;
  }>;
};

export function generateStaticParams() {
  return priorityServiceSlugs.flatMap((category) =>
    seoCities.map((city) => ({
      category,
      city: cityToSlug(city)
    }))
  );
}

export async function generateMetadata({ params }: ServiceCityPageProps): Promise<Metadata> {
  const { category, city } = await params;
  const serviceCategory = getCategoryBySlug(category);
  const cityName = slugToCity(city);

  if (!serviceCategory) {
    return { title: "Service not found" };
  }

  return {
    title: getServicePageTitle(serviceCategory.name, cityName),
    description: getServicePageDescription(serviceCategory.name, cityName),
    alternates: {
      canonical: `/services/${serviceCategory.slug}/${cityToSlug(cityName)}`
    },
    openGraph: {
      title: getServicePageTitle(serviceCategory.name, cityName),
      description: getServicePageDescription(serviceCategory.name, cityName),
      type: "website"
    }
  };
}

export default async function ServiceCityPage({ params }: ServiceCityPageProps) {
  const { category, city } = await params;
  const serviceCategory = getCategoryBySlug(category);
  const cityName = slugToCity(city);

  if (!serviceCategory) {
    notFound();
  }

  const workers = await getWorkers({
    category: serviceCategory.slug,
    location: cityName,
    sort: "rating"
  });
  const useCases = serviceUseCases[serviceCategory.slug as CategorySlug];
  const relatedCities = seoCities.filter((item) => item !== cityName).slice(0, 6);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand">MistriHub services</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-5xl">
              Top {serviceCategory.name}s in {cityName}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Find trusted {serviceCategory.name.toLowerCase()} workers in {cityName} for home, shop, office, and small-site work. Compare ratings, experience, location, and contact directly on WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-brand">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {cityName}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{workers.length} worker profiles</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Sorted by rating</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 sm:p-5">
            <h2 className="text-xl font-black text-ink">Popular {serviceCategory.name} work</h2>
            <ul className="mt-4 space-y-3">
              {useCases.map((useCase) => (
                <li key={useCase} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <WorkerList workers={workers} />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 sm:p-6">
            <h2 className="text-xl font-black text-ink sm:text-2xl">How to choose a good {serviceCategory.name.toLowerCase()} in {cityName}</h2>
            <p className="mt-4 leading-8 text-slate-600">
              Check the worker profile photo, service details, experience, customer rating, review count, and nearby location before contacting. MistriHub keeps the process simple so you can shortlist workers quickly and speak with them directly on WhatsApp.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 sm:p-6">
            <h2 className="text-xl font-black text-ink sm:text-2xl">FAQs</h2>
            <div className="mt-4 space-y-4 text-slate-600">
              <p><strong className="text-ink">Can I call directly?</strong><br />Yes. Worker profiles include WhatsApp and call options when provided.</p>
              <p><strong className="text-ink">Does MistriHub take payment?</strong><br />No. This MVP helps customers discover and contact workers directly.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-black text-ink sm:text-2xl">Related city searches</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedCities.map((relatedCity) => (
              <Link
                key={relatedCity}
                href={`/services/${serviceCategory.slug}/${cityToSlug(relatedCity)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:text-brand"
              >
                {serviceCategory.name} in {relatedCity}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

