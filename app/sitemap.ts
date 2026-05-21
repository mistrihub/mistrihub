import type { MetadataRoute } from "next";
import { getWorkers } from "@/lib/workers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mistrihub.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const workers = await getWorkers({ sort: "rating" });
  const now = new Date();

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
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    ...workers.map((worker) => ({
      url: `${siteUrl}/workers/${worker.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
