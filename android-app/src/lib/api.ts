import { categories } from "./categories";
import { supabase } from "./supabase";
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

export async function getWorkers(filters: { category?: string; city?: string; rating?: number; sort?: "rating" | "experience" } = {}) {
  let query = supabase.from("workers").select(workerSelect);

  if (filters.category) query = query.eq("category_slug", filters.category);
  if (filters.city) query = query.or(`city.ilike.%${filters.city}%,location.ilike.%${filters.city}%`);
  if (filters.rating) query = query.gte("rating", filters.rating);
  query = filters.sort === "experience" ? query.order("experience_years", { ascending: false }) : query.order("rating", { ascending: false }).order("review_count", { ascending: false });

  const { data, error } = await query;
  if (error || !data) return demoWorkers;
  return (data as WorkerRow[]).map(mapWorker);
}

export async function getWorkerById(id: string) {
  const { data, error } = await supabase.from("workers").select(workerSelect).eq("id", id).maybeSingle();
  if (error || !data) return demoWorkers.find((worker) => worker.id === id) ?? null;
  return mapWorker(data as WorkerRow);
}

export async function getReviews(workerId: string): Promise<Review[]> {
  const { data, error } = await supabase.from("reviews").select("*").eq("worker_id", workerId).order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((item: any) => ({
    id: item.id,
    workerId: item.worker_id,
    customerName: item.customer_name || "MistriHub customer",
    rating: item.rating,
    reviewText: item.review_text || "",
    createdAt: item.created_at
  }));
}

export async function addReview(workerId: string, rating: number, reviewText: string) {
  return supabase.from("reviews").insert({ worker_id: workerId, customer_name: "App user", rating, review_text: reviewText });
}

export async function getWorkPosts(limit = 30): Promise<WorkPost[]> {
  const { data, error } = await supabase.from("work_posts").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error || !data) return [];
  return (data as WorkPostRow[]).map(mapPost);
}

export async function getMyWorkerProfile(userId: string) {
  const { data, error } = await supabase.from("workers").select(workerSelect).eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return mapWorker(data as WorkerRow);
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

  return supabase.from("workers").upsert(row, { onConflict: "user_id" }).select(workerSelect).single();
}

export async function uploadMedia(userId: string, uri: string, folder: "profile" | "work", mediaType: "image" | "video") {
  const response = await fetch(uri);
  const blob = await response.blob();
  const ext = mediaType === "video" ? "mp4" : "jpg";
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const contentType = mediaType === "video" ? "video/mp4" : "image/jpeg";
  const { error } = await supabase.storage.from("worker-images").upload(path, blob, { contentType, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("worker-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createWorkPost(workerId: string, mediaUrl: string, mediaType: "image" | "video", caption: string) {
  return supabase.from("work_posts").insert({ worker_id: workerId, media_url: mediaUrl, media_type: mediaType, caption, like_count: 0, comment_count: 0, share_count: 0 });
}
