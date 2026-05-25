import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { WorkerList } from "@/components/worker-list";
import { getWorkers } from "@/lib/workers";
import {
  cityToSlug,
  getCategoryBySlug,
  getNearMeKeywords,
  getServicePageDescription,
  getServicePageTitle,
  priorityServiceSlugs,
  seoCities,
  serviceUseCases,
  slugToCity
} from "@/lib/seo-pages";
import type { CategorySlug } from "@/types/worker";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mistrihub.in";

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

  const title = getServicePageTitle(serviceCategory.name, cityName);
  const description = getServicePageDescription(serviceCategory.name, cityName);

  return {
    title,
    description,
    keywords: getNearMeKeywords(serviceCategory.name, cityName),
    alternates: {
      canonical: `/services/${serviceCategory.slug}/${cityToSlug(cityName)}`
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/services/${serviceCategory.slug}/${cityToSlug(cityName)}`,
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
  const relatedCities = seoCities.filter((item) => item !== cityName).slice(0, 8);
  const keywords = getNearMeKeywords(serviceCategory.name, cityName);
  const pageUrl = `${siteUrl}/services/${serviceCategory.slug}/${cityToSlug(cityName)}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` },
        { "@type": "ListItem", position: 3, name: `${serviceCategory.name} in ${cityName}`, item: pageUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${serviceCategory.name} near me in ${cityName}`,
      description: getServicePageDescription(serviceCategory.name, cityName),
      url: pageUrl,
      itemListElement: workers.slice(0, 10).map((worker, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/workers/${worker.id}`,
        name: worker.name
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `How do I find a ${serviceCategory.name.toLowerCase()} near me in ${cityName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Use MistriHub to compare ${serviceCategory.name.toLowerCase()} profiles in ${cityName} by rating, experience, location, and service details.`
          }
        },
        {
          "@type": "Question",
          name: "Is MistriHub free for customers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Customers can browse worker profiles and contact workers directly. MistriHub is fully free with no hidden cost."
          }
        }
      ]
    }
  ];

  return (
    <section className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand">MistriHub services</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-5xl">
              {serviceCategory.name} Near Me in {cityName}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Find trusted {serviceCategory.name.toLowerCase()} workers near you in {cityName} for home, shop, office, and small-site work. Compare ratings, experience, service price, location, and contact directly on WhatsApp. Fully free, no hidden cost.
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

        <div className="mt-8 rounded-xl bg-teal-50 p-4 sm:p-5">
          <h2 className="text-lg font-black text-ink">Popular searches for {serviceCategory.name} in {cityName}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">
                {keyword}
              </span>
            ))}
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
              <p><strong className="text-ink">Is MistriHub free?</strong><br />Yes. MistriHub is fully free for browsing and direct contact, with no hidden cost.</p>
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
                {serviceCategory.name} near me in {relatedCity}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
