import { demoWorkers } from "@/lib/demo-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { Review, WorkPost, Worker, WorkerFilters } from "@/types/worker";

type WorkerRow = {
  id: string;
  user_id?: string | null;
  name: string;
  category: string;
  category_slug: Worker["categorySlug"];
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
  service_details: string[];
  gallery: string[];
  available_today: boolean;
  starting_price: number;
  created_at?: string;
};


type WorkPostRow = {
  id: string;
  worker_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
};type ReviewRow = {
  id: string;
  worker_id: string;
  customer_name: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
};

function mapWorker(row: WorkerRow): Worker {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    categorySlug: row.category_slug,
    experienceYears: row.experience_years,
    rating: row.rating,
    reviewCount: row.review_count,
    location: row.location,
    city: row.city,
    phone: row.phone,
    whatsapp: row.whatsapp,
    profilePhoto: row.profile_photo,
    shortDescription: row.short_description,
    bio: row.bio,
    serviceDetails: row.service_details,
    gallery: row.gallery,
    availableToday: row.available_today,
    startingPrice: row.starting_price
  };
}


function mapWorkPost(row: WorkPostRow): WorkPost {
  return {
    id: row.id,
    workerId: row.worker_id,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    caption: row.caption || "Recent work update",
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at
  };
}function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    workerId: row.worker_id,
    customerName: row.customer_name || "LocalPro customer",
    rating: row.rating,
    reviewText: row.review_text || "",
    createdAt: row.created_at
  };
}

function filterDemoWorkers(filters: WorkerFilters = {}) {
  const filtered = demoWorkers.filter((worker) => {
    const matchesCategory = filters.category
      ? worker.categorySlug === filters.category || worker.category.toLowerCase() === filters.category.toLowerCase()
      : true;
    const matchesLocation = filters.location
      ? `${worker.location} ${worker.city}`.toLowerCase().includes(filters.location.toLowerCase())
      : true;
    const matchesRating = filters.rating ? worker.rating >= filters.rating : true;

    return matchesCategory && matchesLocation && matchesRating;
  });

  return sortWorkers(filtered, filters.sort);
}

function sortWorkers(workers: Worker[], sort: WorkerFilters["sort"] = "rating") {
  return [...workers].sort((a, b) => {
    if (sort === "experience") {
      return b.experienceYears - a.experienceYears || b.rating - a.rating;
    }

    if (sort === "newest") {
      return a.name.localeCompare(b.name);
    }

    return b.rating - a.rating || b.reviewCount - a.reviewCount;
  });
}

export async function getWorkers(filters: WorkerFilters = {}): Promise<Worker[]> {
  if (!hasSupabaseConfig || !supabase) {
    return filterDemoWorkers(filters);
  }

  let query = supabase.from("workers").select("*");

  if (filters.category) {
    query = query.eq("category_slug", filters.category);
  }

  if (filters.location) {
    query = query.or(`city.ilike.%${filters.location}%,location.ilike.%${filters.location}%`);
  }

  if (filters.rating) {
    query = query.gte("rating", filters.rating);
  }

  if (filters.sort === "experience") {
    query = query.order("experience_years", { ascending: false }).order("rating", { ascending: false });
  } else if (filters.sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("rating", { ascending: false }).order("review_count", { ascending: false });
  }

  const { data, error } = await query;

  if (error || !data) {
    return filterDemoWorkers(filters);
  }

  return (data as WorkerRow[]).map(mapWorker);
}

export async function getWorkerById(id: string): Promise<Worker | null> {
  if (!hasSupabaseConfig || !supabase) {
    return demoWorkers.find((worker) => worker.id === id) ?? null;
  }

  const { data, error } = await supabase.from("workers").select("*").eq("id", id).single();

  if (error || !data) {
    return demoWorkers.find((worker) => worker.id === id) ?? null;
  }

  return mapWorker(data as WorkerRow);
}

export async function getFeaturedWorkers() {
  const workers = await getWorkers({ sort: "rating" });
  return workers.filter((worker) => worker.rating >= 4.7).slice(0, 4);
}

export async function getReviews(workerId: string): Promise<Review[]> {
  if (!hasSupabaseConfig || !supabase) {
    return [
      {
        id: "demo-review-1",
        workerId,
        customerName: "Amit",
        rating: 5,
        reviewText: "Quick response and clean work. Easy to contact on WhatsApp.",
        createdAt: new Date().toISOString()
      },
      {
        id: "demo-review-2",
        workerId,
        customerName: "Priya",
        rating: 4,
        reviewText: "Good service and fair pricing.",
        createdAt: new Date().toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ReviewRow[]).map(mapReview);
}

export async function getWorkPosts(worker: Worker): Promise<WorkPost[]> {
  const galleryPosts = worker.gallery.map((image, index) => ({
    id: `${worker.id}-gallery-${index}`,
    workerId: worker.id,
    mediaUrl: image,
    mediaType: "image" as const,
    caption: `${worker.category} work sample ${index + 1}`,
    likeCount: Math.max(3, Math.round(worker.rating * 3) + index),
    commentCount: index,
    createdAt: new Date().toISOString()
  }));

  if (!hasSupabaseConfig || !supabase) {
    return galleryPosts;
  }

  const { data, error } = await supabase
    .from("work_posts")
    .select("*")
    .eq("worker_id", worker.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return galleryPosts;
  }

  const posts = (data as WorkPostRow[]).map(mapWorkPost);
  return posts.length > 0 ? posts : galleryPosts;
}
