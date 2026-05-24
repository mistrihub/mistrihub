/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import type { WorkPostWithWorker } from "@/types/worker";

type WorkPostCardProps = {
  post: WorkPostWithWorker;
  showEngagement?: boolean;
};

export function WorkPostCard({ post, showEngagement = true }: WorkPostCardProps) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <Link href={`/workers/${post.worker.id}`} className="block focus-visible:outline-none focus-visible:ring-0">
        <div className="aspect-[4/3] bg-slate-100">
          {post.mediaType === "video" ? (
            <video className="h-full w-full object-cover" src={post.mediaUrl} controls muted playsInline preload="metadata" />
          ) : (
            <img src={post.mediaUrl} alt={`${post.worker.name} work update`} className="h-full w-full object-cover" loading="lazy" />
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <Link href={`/workers/${post.worker.id}`} className="shrink-0 focus-visible:outline-none focus-visible:ring-0">
            <img src={post.worker.profilePhoto} alt={post.worker.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
          </Link>
          <div className="min-w-0">
            <Link href={`/workers/${post.worker.id}`} className="block truncate font-black text-ink hover:text-brand">
              {post.worker.name}
            </Link>
            <p className="truncate text-xs font-semibold text-slate-500">
              {post.worker.category} in {post.worker.city}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">{post.caption}</p>

        {showEngagement ? (
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-black text-slate-600">
            <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-50 px-2 py-2 text-rose-700">
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              {post.likeCount}
            </span>
            <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-sky-50 px-2 py-2 text-sky-700">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {post.commentCount}
            </span>
            <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-50 px-2 py-2 text-brand">
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              {post.shareCount}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
