import type { MetadataRoute } from "next";
import { getWorkers } from "@/lib/workers";
import { cityToSlug, priorityServiceSlugs, seoCities } from "@/lib/seo-pages";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mistrihub.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const workers = await getWorkers({ sort: "rating" });
  const now = new Date();
  const servicePages = priorityServiceSlugs.flatMap((category) =>
    seoCities.map((city) => ({
      url: `${siteUrl}/services/${category}/${cityToSlug(city)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75
    }))
  );

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/nearby`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteUrl}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    ...["about", "contact", "privacy", "terms"].map((page) => ({
      url: `${siteUrl}/${page}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6
    })),
    ...servicePages,
    ...workers.map((worker) => ({
      url: `${siteUrl}/workers/${worker.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
