import { categories } from "./categories";
import { getStoredSession, supabaseFetch, supabaseUrl } from "./supabase";
import type { CategorySlug, Review, WorkPost, Worker } from "../types";

const workerSelect = "id,user_id,name,category,category_slug,experience_years,rating,review_count,location,city,phone,whatsapp,profile_photo,short_description,bio,service_details,available_today,starting_price,created_at";
const fallbackImage = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop";

export const demoWorkers: Worker[] = [
  {
    id: "demo-electrician",
    name: "Rakesh Kumar",
    category: "Electrician",
    categorySlug: "electrician",
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 42,
    location: "Patna City",
    city: "Patna",
    phone: "919999999999",
    whatsapp: "919999999999",
    profilePhoto: fallbackImage,
    shortDescription: "Fan, wiring, switchboard, MCB and home electrical repair.",
    bio: "Reliable electrician for home, shop, and office work.",
    serviceDetails: ["Fan installation", "Wiring repair", "MCB checks", "Switchboard repair"],
    availableToday: true,
    startingPrice: 199
  },
  {
    id: "demo-plumber",
    name: "Amit Sharma",
    category: "Plumber",
    categorySlug: "plumber",
    experienceYears: 6,
    rating: 4.8,
    reviewCount: 31,
    location: "Lalganj",
    city: "Muzaffarpur",
    phone: "918888888888",
    whatsapp: "918888888888",
    profilePhoto: fallbackImage,
    shortDescription: "Tap, pipe, leakage and bathroom plumbing work.",
    bio: "Fast plumbing support for home and commercial repair.",
    serviceDetails: ["Leak repair", "Tap fitting", "Pipe blockage", "Bathroom plumbing"],
    availableToday: true,
    startingPrice: 149
  }
];

type WorkerRow = {
  id: string;
  user_id?: string | null;
  name: string;
  category: string;
  category_slug: CategorySlug;
  experience_years: number;
  rating: number;
  review_count: number;
  location: string;
  city: string;
  phone: string;
  whatsapp: string;
  profile_photo: string;
  short_description: string;
  bio: string;
  service_details: string[] | null;
  available_today: boolean;
  starting_price: number;
};

type WorkPostRow = {
  id: string;
  worker_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  like_count: number;
  comment_count: number;
  share_count: number | null;
  created_at: string;
};

function mapWorker(row: WorkerRow): Worker {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    categorySlug: row.category_slug,
    experienceYears: row.experience_years ?? 0,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    location: row.location ?? "",
    city: row.city ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? row.phone ?? "",
    profilePhoto: row.profile_photo || fallbackImage,
    shortDescription: row.short_description ?? "",
    bio: row.bio ?? "",
    serviceDetails: row.service_details ?? [],
    availableToday: row.available_today ?? true,
    startingPrice: row.starting_price ?? 0
  };
}

function mapPost(row: WorkPostRow): WorkPost {
  return {
    id: row.id,
    workerId: row.worker_id,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    caption: row.caption || "Recent work update",
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    shareCount: row.share_count ?? 0,
    createdAt: row.created_at
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : ([] as T);
  } catch {
    return [] as T;
  }
}

function errorResult(message: string) {
  return { data: null, error: { message } };
}

function makeQuery(params: Record<string, string>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

function safeWorkers(workers: Worker[]) {
  return workers.map((worker) => ({
    ...worker,
    rating: Number(worker.rating) || 0,
    reviewCount: Number(worker.reviewCount) || 0,
    experienceYears: Number(worker.experienceYears) || 0,
    startingPrice: Number(worker.startingPrice) || 0,
    serviceDetails: Array.isArray(worker.serviceDetails) ? worker.serviceDetails : []
  }));
}
export async function getWorkers(filters: { category?: string; city?: string; rating?: number; sort?: "rating" | "experience" } = {}) {
  try {
    const params: Record<string, string> = { select: workerSelect };
    if (filters.category) params.category_slug = `eq.${filters.category}`;
    if (filters.city) params.or = `(city.ilike.*${filters.city}*,location.ilike.*${filters.city}*)`;
    if (filters.rating) params.rating = `gte.${filters.rating}`;
    params.order = filters.sort === "experience" ? "experience_years.desc,rating.desc" : "rating.desc,review_count.desc";

    const response = await supabaseFetch(`/rest/v1/workers?${makeQuery(params)}`);
    if (!response.ok) return demoWorkers;
    const data = await readJson<WorkerRow[]>(response);
    return data.length ? safeWorkers(data.map(mapWorker)) : demoWorkers;
  } catch {
    return demoWorkers;
  }
}

export async function getWorkerById(id: string) {
  try {
    const response = await supabaseFetch(`/rest/v1/workers?${makeQuery({ select: workerSelect, id: `eq.${id}`, limit: "1" })}`);
    if (!response.ok) return demoWorkers.find((worker) => worker.id === id) ?? null;
    const data = await readJson<WorkerRow[]>(response);
    return data[0] ? mapWorker(data[0]) : demoWorkers.find((worker) => worker.id === id) ?? null;
  } catch {
    return demoWorkers.find((worker) => worker.id === id) ?? null;
  }
}

export async function getReviews(workerId: string): Promise<Review[]> {
  try {
    const response = await supabaseFetch(`/rest/v1/reviews?${makeQuery({ select: "*", worker_id: `eq.${workerId}`, order: "created_at.desc" })}`);
    if (!response.ok) return [];
    const data = await readJson<any[]>(response);
    return data.map((item) => ({
      id: item.id,
      workerId: item.worker_id,
      customerName: item.customer_name || "MistriHub customer",
      rating: Number(item.rating) || 0,
      reviewText: item.review_text || "",
      createdAt: item.created_at
    }));
  } catch {
    return [];
  }
}

export async function addReview(workerId: string, rating: number, reviewText: string) {
  const response = await supabaseFetch("/rest/v1/reviews", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ worker_id: workerId, customer_name: "App user", rating, review_text: reviewText })
  });
  return response.ok ? { data: null, error: null } : errorResult(await response.text());
}

export async function getWorkPosts(limit = 30): Promise<WorkPost[]> {
  try {
    const response = await supabaseFetch(`/rest/v1/work_posts?${makeQuery({ select: "*", order: "created_at.desc", limit: String(limit) })}`);
    if (!response.ok) return [];
    const data = await readJson<WorkPostRow[]>(response);
    return data.map(mapPost);
  } catch {
    return [];
  }
}

export async function getMyWorkerProfile(userId: string) {
  try {
    const response = await supabaseFetch(`/rest/v1/workers?${makeQuery({ select: workerSelect, user_id: `eq.${userId}`, limit: "1" })}`, {}, true);
    if (!response.ok) return null;
    const data = await readJson<WorkerRow[]>(response);
    return data[0] ? mapWorker(data[0]) : null;
  } catch {
    return null;
  }
}

export async function saveWorkerProfile(userId: string, input: Partial<Worker>) {
  const category = categories.find((item) => item.slug === input.categorySlug) ?? categories[0];
  const row = {
    user_id: userId,
    name: input.name || "MistriHub Worker",
    category: category.name,
    category_slug: category.slug,
    experience_years: input.experienceYears ?? 0,
    location: input.location || "",
    city: input.city || "",
    phone: input.phone || "",
    whatsapp: input.whatsapp || input.phone || "",
    profile_photo: input.profilePhoto || fallbackImage,
    short_description: input.shortDescription || "Available for local work.",
    bio: input.bio || "Trusted local worker on MistriHub.",
    service_details: input.serviceDetails?.length ? input.serviceDetails : [category.description],
    available_today: true,
    starting_price: input.startingPrice ?? 0
  };
  const response = await supabaseFetch("/rest/v1/workers?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row)
  }, true);
  if (!response.ok) return errorResult(await response.text());
  const data = await readJson<WorkerRow[]>(response);
  return { data: data[0], error: null };
}

export async function uploadMedia(userId: string, uri: string, folder: "profile" | "work", mediaType: "image" | "video") {
  const session = await getStoredSession();
  if (!session) throw new Error("Please login first.");
  const response = await fetch(uri);
  const blob = await response.blob();
  const ext = mediaType === "video" ? "mp4" : "jpg";
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const contentType = mediaType === "video" ? "video/mp4" : "image/jpeg";
  const upload = await fetch(`${supabaseUrl}/storage/v1/object/worker-images/${path}`, {
    method: "POST",
    headers: { apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "", Authorization: `Bearer ${session.access_token}`, "Content-Type": contentType, "x-upsert": "true" },
    body: blob as any
  });
  if (!upload.ok) throw new Error(await upload.text());
  return `${supabaseUrl}/storage/v1/object/public/worker-images/${path}`;
}

export async function createWorkPost(workerId: string, mediaUrl: string, mediaType: "image" | "video", caption: string) {
  const response = await supabaseFetch("/rest/v1/work_posts", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ worker_id: workerId, media_url: mediaUrl, media_type: mediaType, caption, like_count: 0, comment_count: 0, share_count: 0 })
  }, true);
  return response.ok ? { data: null, error: null } : errorResult(await response.text());
}


