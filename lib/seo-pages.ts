import { categories } from "@/lib/categories";
import type { CategorySlug } from "@/types/worker";

export const seoCities = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Jaipur",
  "Ahmedabad",
  "Kolkata",
  "Chennai",
  "Lucknow"
];

export const priorityServiceSlugs: CategorySlug[] = [
  "electrician",
  "plumber",
  "ac-repair",
  "carpenter",
  "painter",
  "mechanic",
  "helper-labour",
  "mason-plaster"
];

export const serviceUseCases: Record<CategorySlug, string[]> = {
  electrician: ["fan installation", "switchboard repair", "MCB checks", "wiring repair", "light fitting"],
  plumber: ["leak repair", "tap fitting", "pipe blockage", "bathroom plumbing", "kitchen plumbing"],
  driver: ["hourly driver", "daily driver", "airport drop", "family travel", "outstation trip"],
  carpenter: ["furniture repair", "door fitting", "wardrobe repair", "shelf installation", "hinge replacement"],
  mechanic: ["vehicle inspection", "battery issue", "brake checks", "minor repair", "routine servicing"],
  painter: ["interior painting", "rental repaint", "wall putty", "texture paint", "touch-up work"],
  "ac-repair": ["AC service", "gas refill", "cooling issue", "AC installation", "AC uninstallation"],
  "helper-labour": ["daily labour", "loading support", "shifting help", "site helper", "general labour"],
  "mason-plaster": ["brick work", "wall plaster", "plaster repair", "cement work", "small civil jobs"]
};

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getServicePageTitle(categoryName: string, city: string) {
  return `Top ${categoryName}s in ${city} | MistriHub`;
}

export function getServicePageDescription(categoryName: string, city: string) {
  return `Find trusted ${categoryName.toLowerCase()} workers in ${city}. Compare ratings, experience, location, service details, and contact directly on WhatsApp with MistriHub.`;
}

export function cityToSlug(city: string) {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function slugToCity(slug: string) {
  const match = seoCities.find((city) => cityToSlug(city) === slug);
  return match ?? slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
