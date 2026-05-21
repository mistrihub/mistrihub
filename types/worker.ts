export type CategorySlug =
  | "electrician"
  | "plumber"
  | "driver"
  | "carpenter"
  | "mechanic"
  | "painter"
  | "ac-repair"
  | "graphic-designer";

export type Category = {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
};

export type Worker = {
  id: string;
  userId?: string | null;
  name: string;
  category: string;
  categorySlug: CategorySlug;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  location: string;
  city: string;
  phone: string;
  whatsapp: string;
  profilePhoto: string;
  shortDescription: string;
  bio: string;
  serviceDetails: string[];
  gallery: string[];
  availableToday: boolean;
  startingPrice: number;
};

export type WorkerFilters = {
  category?: string;
  location?: string;
  rating?: number;
  sort?: "rating" | "experience" | "newest";
};

export type Review = {
  id: string;
  workerId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
};
