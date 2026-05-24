/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Heart, MessageCircle, Send, Share2, TrendingUp, UserPlus, X } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import { createWhatsAppUrl } from "@/lib/utils";
import type { WorkPost, WorkPostComment, Worker } from "@/types/worker";

type CommentRow = {
  id: string;
  post_id: string;
  visitor_name: string | null;
  comment_text: string;
  created_at: string;
};

function getVisitorId() {
  const key = "mistrihub_visitor_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const next = crypto.randomUUID();
  window.localStorage.setItem(key, next);
  return next;
}

export function WorkerWorkFeed({ worker, posts }: { worker: Worker; posts: WorkPost[] }) {
  const [visitorId, setVisitorId] = useState("");
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(Math.max(8, worker.reviewCount * 4 + posts.length));
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [activeCommentPost, setActiveCommentPost] = useState("");
  const [lightboxPost, setLightboxPost] = useState<WorkPost | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);
  const [postCounts, setPostCounts] = useState(
    () => Object.fromEntries(posts.map((post) => [post.id, { likes: post.likeCount, comments: post.commentCount, shares: post.shareCount }])) as Record<
      string,
      { likes: number; comments: number; shares: number }
    >
  );
  const [comments, setComments] = useState<Record<string, WorkPostComment[]>>(
    () => Object.fromEntries(posts.map((post) => [post.id, post.comments ?? []])) as Record<string, WorkPostComment[]>
  );
  const profileUrl = useMemo(() => (typeof window === "undefined" ? "" : window.location.href), []);
  const totalLikes = Object.values(postCounts).reduce((total, count) => total + count.likes, 0);
  const totalEngagement = Object.values(postCounts).reduce((total, count) => total + count.likes + count.comments + count.shares, 0);

  useEffect(() => {
    const nextVisitorId = getVisitorId();
    setVisitorId(nextVisitorId);

    async function loadEngagement() {
      if (!hasSupabaseConfig || !supabase || posts.length === 0) return;

      const postIds = posts.map((post) => post.id).filter((id) => !id.includes("gallery"));

      const followQuery = supabase.from("worker_follows").select("worker_id", { count: "exact" }).eq("worker_id", worker.id);
      const ownFollowQuery = supabase.from("worker_follows").select("worker_id").eq("worker_id", worker.id).eq("visitor_id", nextVisitorId).limit(1);

      if (postIds.length === 0) {
        const [{ count }, { data: follows }] = await Promise.all([followQuery, ownFollowQuery]);
        if (typeof count === "number") setFollowerCount(count);
        if (follows && follows.length > 0) setFollowing(true);
        return;
      }

      const [{ data: likes }, { data: dbComments }, { data: follows }, { count }] = await Promise.all([
        supabase.from("work_post_likes").select("post_id").eq("visitor_id", nextVisitorId).in("post_id", postIds),
        supabase
          .from("work_post_comments")
          .select("id, post_id, visitor_name, comment_text, created_at")
          .in("post_id", postIds)
          .order("created_at", { ascending: false })
          .limit(30),
        ownFollowQuery,
        followQuery
      ]);

      if (typeof count === "number") setFollowerCount(count);

      if (likes) {
        setLikedPosts(Object.fromEntries(likes.map((like) => [String(like.post_id), true])));
      }

      if (follows && follows.length > 0) {
        setFollowing(true);
      }

      if (dbComments) {
        const grouped = (dbComments as CommentRow[]).reduce<Record<string, WorkPostComment[]>>((current, row) => {
          current[row.post_id] = [
            ...(current[row.post_id] ?? []),
            {
              id: row.id,
              postId: row.post_id,
              visitorName: row.visitor_name || "Guest",
              commentText: row.comment_text,
              createdAt: row.created_at
            }
          ];
          return current;
        }, {});
        setComments((current) => ({ ...current, ...grouped }));
      }
    }

    void loadEngagement();
  }, [posts, worker.id]);


  useEffect(() => {
    if (!lightboxPost) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxPost(null);
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [lightboxPost]);

  useEffect(() => {
    if (!lightboxPost || lightboxPost.mediaType !== "video") return;

    const video = lightboxVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  }, [lightboxPost]);
  async function followWorker() {
    if (following) return;

    setFollowing(true);
    setFollowerCount((count) => count + 1);
    if (!hasSupabaseConfig || !supabase || !visitorId) return;

    await supabase.from("worker_follows").upsert(
      {
        worker_id: worker.id,
        visitor_id: visitorId
      },
      { onConflict: "worker_id,visitor_id", ignoreDuplicates: true }
    );
  }

  async function likePost(post: WorkPost) {
    if (likedPosts[post.id]) return;

    setLikedPosts((current) => ({ ...current, [post.id]: true }));
    setPostCounts((current) => ({ ...current, [post.id]: { ...current[post.id], likes: (current[post.id]?.likes ?? 0) + 1 } }));

    if (!hasSupabaseConfig || !supabase || !visitorId || post.id.includes("gallery")) return;

    await supabase.from("work_post_likes").upsert(
      {
        post_id: post.id,
        visitor_id: visitorId
      },
      { onConflict: "post_id,visitor_id", ignoreDuplicates: true }
    );
  }

  async function submitComment(post: WorkPost, commentText: string) {
    const nextComment: WorkPostComment = {
      id: crypto.randomUUID(),
      postId: post.id,
      visitorName: "Guest",
      commentText,
      createdAt: new Date().toISOString()
    };

    setComments((current) => ({ ...current, [post.id]: [nextComment, ...(current[post.id] ?? [])] }));
    setPostCounts((current) => ({ ...current, [post.id]: { ...current[post.id], comments: (current[post.id]?.comments ?? 0) + 1 } }));
    setActiveCommentPost("");

    if (!hasSupabaseConfig || !supabase || !visitorId || post.id.includes("gallery")) return;

    await supabase.from("work_post_comments").insert({
      post_id: post.id,
      visitor_id: visitorId,
      visitor_name: "Guest",
      comment_text: commentText
    });
  }

  async function shareProfile(post: WorkPost) {
    setPostCounts((current) => ({ ...current, [post.id]: { ...current[post.id], shares: (current[post.id]?.shares ?? 0) + 1 } }));

    if (hasSupabaseConfig && supabase && visitorId && !post.id.includes("gallery")) {
      await supabase.from("work_post_shares").insert({
        post_id: post.id,
        visitor_id: visitorId
      });
    }

    const shareText = post.caption ? `${worker.name} work update: ${post.caption}` : `${worker.name} on MistriHub`;

    if (navigator.share) {
      await navigator.share({ title: worker.name, text: shareText, url: profileUrl || `/workers/${worker.id}` });
      return;
    }

    await navigator.clipboard?.writeText(profileUrl || `/workers/${worker.id}`);
  }

  return (
    <section className="mt-10">
      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-4 ring-teal-50">
              <Image src={worker.profilePhoto} alt={worker.name} fill className="object-cover" sizes="64px" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-ink">{worker.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-xs font-black text-brand">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Active worker
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {worker.category} in {worker.city} - Real work updates
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-80">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-lg font-black text-ink">{followerCount}</p>
              <p className="text-xs font-bold text-slate-500">Followers</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-lg font-black text-ink">{posts.length}</p>
              <p className="text-xs font-bold text-slate-500">Posts</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-lg font-black text-ink">{totalLikes}</p>
              <p className="text-xs font-bold text-slate-500">Likes</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            {totalEngagement} profile engagements
          </div>
          <button
            type="button"
            onClick={() => void followWorker()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition hover:bg-teal-800"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {following ? "Following" : "Follow this worker"}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Work feed</p>
        <h2 className="mt-2 text-2xl font-black text-ink">Latest photos and videos</h2>
        <p className="mt-1 text-sm text-slate-600">Customers can like, comment, follow, share, and ask about real work.</p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="font-black text-ink">No work updates yet</p>
          <p className="mt-2 text-sm text-slate-600">Worker can upload photos or videos from the dashboard to build trust.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {posts.map((post) => {
            const liked = Boolean(likedPosts[post.id]);
            const postComments = comments[post.id] ?? [];
            const counts = postCounts[post.id] ?? { likes: post.likeCount, comments: post.commentCount, shares: post.shareCount };

            return (
              <article key={post.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-100">
                      <Image src={worker.profilePhoto} alt={worker.name} fill className="object-cover" sizes="44px" />
                    </div>
                    <div>
                      <h3 className="font-black text-ink">{worker.name}</h3>
                      <p className="text-xs font-semibold text-slate-500">
                        {worker.category} in {worker.city}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-black text-brand">Work proof</span>
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxPost(post)}
                  className="block w-full bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-0"
                  aria-label="Open work media full view"
                >
                  <div className="aspect-video w-full bg-slate-100">
                    {post.mediaType === "video" ? (
                      <video src={post.mediaUrl} muted playsInline preload="metadata" className="h-full w-full bg-black object-cover" />
                    ) : (
                      <img src={post.mediaUrl} alt={post.caption} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    )}
                  </div>
                </button>

                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void likePost(post)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-bold text-ink transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Heart className={`h-4 w-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`} aria-hidden="true" />
                        {counts.likes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCommentPost(activeCommentPost === post.id ? "" : post.id)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-bold text-ink transition hover:bg-teal-50 hover:text-brand"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        {counts.comments}
                      </button>
                      <button
                        type="button"
                        onClick={() => void shareProfile(post)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-bold text-ink transition hover:bg-teal-50 hover:text-brand"
                      >
                        <Share2 className="h-4 w-4" aria-hidden="true" />
                        {counts.shares}
                      </button>
                    </div>
                    <a
                      href={createWhatsAppUrl(worker)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-bold text-white transition hover:bg-teal-800"
                    >
                      Ask about this work
                    </a>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    <span className="font-black text-ink">{worker.name}</span> {post.caption}
                  </p>

                  {activeCommentPost === post.id ? <CommentBox onSubmit={(comment) => void submitComment(post, comment)} /> : null}

                  {postComments.length > 0 ? (
                    <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      {postComments.slice(0, 5).map((comment) => (
                        <p key={comment.id}>
                          <span className="font-bold text-ink">{comment.visitorName}:</span> {comment.commentText}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {lightboxPost ? (
        <div className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center overflow-y-auto bg-black/90 p-3 sm:p-6" role="dialog" aria-modal="true">
          <div className="relative flex max-h-[96dvh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-neutral-950 shadow-2xl">
            <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-neutral-950 px-4 py-3 pr-16 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-black sm:text-base">{worker.name}</p>
                <p className="truncate text-xs text-white/70">{lightboxPost.caption}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLightboxPost(null)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-lg transition hover:bg-slate-100"
              aria-label="Close full view"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-black p-2 sm:p-4">
              {lightboxPost.mediaType === "video" ? (
                <video ref={lightboxVideoRef} className="h-auto max-h-[90dvh] w-auto max-w-full object-contain" src={lightboxPost.mediaUrl} controls autoPlay playsInline preload="auto" />
              ) : (
                <img src={lightboxPost.mediaUrl} alt={`${worker.name} work update full view`} className="h-auto max-h-[90dvh] w-auto max-w-full object-contain" decoding="async" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CommentBox({ onSubmit }: { onSubmit: (comment: string) => void }) {
  const [comment, setComment] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!comment.trim()) return;
        onSubmit(comment.trim());
        setComment("");
      }}
      className="mt-3 flex gap-2"
    >
      <input
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="h-10 flex-1 rounded-lg bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-100"
        placeholder="Write a comment"
      />
      <button type="submit" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}










