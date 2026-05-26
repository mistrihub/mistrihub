export type CategorySlug =
  | "electrician"
  | "plumber"
  | "driver"
  | "carpenter"
  | "mechanic"
  | "painter"
  | "ac-repair"
  | "helper-labour"
  | "mason-plaster"
  | "graphic-web-designer";

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
  availableToday: boolean;
  startingPrice: number;
};

export type Review = {
  id: string;
  workerId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
};

export type WorkPost = {
  id: string;
  workerId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  worker?: Worker;
};

export type AppScreen = "home" | "feed" | "profile" | "dashboard" | "upload";

export type WorkPostComment = {
  id: string;
  postId: string;
  visitorName: string;
  commentText: string;
  createdAt: string;
};


