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
  "Lucknow",
  "Patna",
  "Muzaffarpur",
  "Gaya",
  "Ranchi",
  "Noida",
  "Gurugram",
  "Ghaziabad",
  "Faridabad",
  "Surat",
  "Indore",
  "Bhopal",
  "Kanpur",
  "Nagpur",
  "Varanasi"
];

export const priorityServiceSlugs: CategorySlug[] = [
  "electrician",
  "plumber",
  "driver",
  "ac-repair",
  "carpenter",
  "painter",
  "mechanic",
  "helper-labour",
  "mason-plaster",
  "graphic-web-designer"
];

export const serviceUseCases: Record<CategorySlug, string[]> = {
  electrician: ["fan installation", "switchboard repair", "MCB checks", "wiring repair", "light fitting"],
  plumber: ["leak repair", "tap fitting", "pipe blockage", "bathroom plumbing", "kitchen plumbing"],
  driver: ["hourly driver", "daily driver", "airport drop", "family travel", "outstation trip"],
  carpenter: ["interior woodwork", "door fitting", "wardrobe repair", "decor panels", "custom furniture"],
  mechanic: ["bike repair", "auto repair", "battery issue", "brake checks", "routine servicing"],
  painter: ["interior painting", "wall putty", "POP work", "texture paint", "touch-up work"],
  "ac-repair": ["AC service", "cooler repair", "fridge repair", "washing machine repair", "cooling issue"],
  "helper-labour": ["daily labour", "loading support", "shifting help", "site helper", "general labour"],
  "mason-plaster": ["brick work", "wall plaster", "plaster repair", "cement work", "small civil jobs"],
  "graphic-web-designer": ["logo design", "banner design", "poster design", "website design", "social media creative"]
};

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getServicePageTitle(categoryName: string, city: string) {
  return `${categoryName} Near Me in ${city} | Top Rated Local Workers - MistriHub`;
}

export function getServicePageDescription(categoryName: string, city: string) {
  return `Find trusted ${categoryName.toLowerCase()} near me in ${city}. Compare top-rated local workers by rating, experience, price, service area, and contact directly on WhatsApp. Fully free, no hidden cost.`;
}

export function getNearMeKeywords(categoryName: string, city: string) {
  const service = categoryName.toLowerCase();
  return [
    `${service} near me`,
    `${service} nearby`,
    `${service} in ${city}`,
    `best ${service} in ${city}`,
    `top rated ${service} near me`,
    `local ${service} in ${city}`,
    `${service} contact number in ${city}`,
    `${service} WhatsApp number in ${city}`,
    `trusted ${service} near me`,
    `free local worker platform ${city}`
  ];
}

export function cityToSlug(city: string) {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function slugToCity(slug: string) {
  const match = seoCities.find((city) => cityToSlug(city) === slug);
  return match ?? slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}



