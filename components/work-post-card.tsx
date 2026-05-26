/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Send, Share2, X } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { WorkPostComment, WorkPostWithWorker } from "@/types/worker";

type WorkPostCardProps = {
  post: WorkPostWithWorker;
};

type FeedVideoVisibilityDetail = {
  id: string;
  ratio: number;
  video: HTMLVideoElement;
};
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

export function WorkPostCard({ post }: WorkPostCardProps) {
  const [visitorId, setVisitorId] = useState("");
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showSoundPrompt, setShowSoundPrompt] = useState(false);
  const [commentText, setCommentText] = useState("");
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);
  const [comments, setComments] = useState<WorkPostComment[]>(post.comments ?? []);
  const [counts, setCounts] = useState({ likes: post.likeCount, comments: post.commentCount, shares: post.shareCount });
  const profileUrl = useMemo(() => (typeof window === "undefined" ? `/workers/${post.worker.id}` : `${window.location.origin}/workers/${post.worker.id}`), [post.worker.id]);
  const isDemoPost = post.id.includes("gallery");
  const postVideoId = `work-video-${post.id}`;
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSoundEnabled(window.localStorage.getItem("mistrihub_sound_enabled") === "true");
  }, []);

  useEffect(() => {
    if (post.mediaType !== "video") return;

    const video = previewVideoRef.current;
    if (!video) return;
    const activeVideo = video;

    function playActiveVideo(event: Event) {
      const detail = (event as CustomEvent<FeedVideoVisibilityDetail>).detail;
      if (detail.id !== postVideoId) {
        activeVideo.pause();
        return;
      }

      activeVideo.muted = true;
      activeVideo.volume = 0;
      void activeVideo.play().then(() => {
        if (soundEnabled) {
          activeVideo.muted = false;
          activeVideo.volume = 1;
          void activeVideo.play().catch(() => {
            activeVideo.muted = true;
            activeVideo.volume = 0;
            setShowSoundPrompt(true);
          });
        }
        setShowSoundPrompt(!soundEnabled);
      }).catch(() => {
        activeVideo.muted = true;
        activeVideo.volume = 0;
        setShowSoundPrompt(true);
        void activeVideo.play().catch(() => undefined);
      });
    }

    function requestVisiblePlay() {
      const rect = activeVideo.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = rect.height > 0 ? Math.max(0, visibleHeight / rect.height) : 0;
      if (ratio >= 0.45) {
        window.dispatchEvent(new CustomEvent<FeedVideoVisibilityDetail>("mistrihub:feed-video-visible", { detail: { id: postVideoId, ratio, video: activeVideo } }));
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry?.intersectionRatio ?? 0;

        if (ratio < 0.45) {
          activeVideo.pause();
          return;
        }

        window.dispatchEvent(
          new CustomEvent<FeedVideoVisibilityDetail>("mistrihub:feed-video-visible", {
            detail: { id: postVideoId, ratio, video: activeVideo }
          })
        );
      },
      { threshold: [0, 0.45, 0.65, 0.85] }
    );

    window.addEventListener("mistrihub:feed-video-visible", playActiveVideo);
    window.addEventListener("focus", requestVisiblePlay);
    document.addEventListener("visibilitychange", requestVisiblePlay);
    activeVideo.addEventListener("loadeddata", requestVisiblePlay);
    activeVideo.addEventListener("canplay", requestVisiblePlay);
    observer.observe(activeVideo);
    window.setTimeout(requestVisiblePlay, 150);
    window.setTimeout(requestVisiblePlay, 600);

    return () => {
      observer.disconnect();
      window.removeEventListener("mistrihub:feed-video-visible", playActiveVideo);
      window.removeEventListener("focus", requestVisiblePlay);
      document.removeEventListener("visibilitychange", requestVisiblePlay);
      activeVideo.removeEventListener("loadeddata", requestVisiblePlay);
      activeVideo.removeEventListener("canplay", requestVisiblePlay);
    };
  }, [post.mediaType, postVideoId, soundEnabled]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [lightboxOpen]);

  useEffect(() => {
    const nextVisitorId = getVisitorId();
    setVisitorId(nextVisitorId);

    async function loadEngagement() {
      if (!hasSupabaseConfig || !supabase || isDemoPost) return;

      const [{ data: ownLikes }, { data: ownShares }, { data: dbComments }] = await Promise.all([
        supabase.from("work_post_likes").select("post_id").eq("post_id", post.id).eq("visitor_id", nextVisitorId).limit(1),
        supabase.from("work_post_shares").select("post_id").eq("post_id", post.id).eq("visitor_id", nextVisitorId).limit(1),
        supabase
          .from("work_post_comments")
          .select("id, post_id, visitor_name, comment_text, created_at")
          .eq("post_id", post.id)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      if (ownLikes && ownLikes.length > 0) setLiked(true);
      if (ownShares && ownShares.length > 0) setShared(true);

      if (dbComments) {
        setComments(
          (dbComments as CommentRow[]).map((comment) => ({
            id: comment.id,
            postId: comment.post_id,
            visitorName: comment.visitor_name || "Guest",
            commentText: comment.comment_text,
            createdAt: comment.created_at
          }))
        );
      }
    }

    void loadEngagement();
  }, [isDemoPost, post.id]);

  async function likePost() {
    if (liked) return;

    setLiked(true);
    setCounts((current) => ({ ...current, likes: current.likes + 1 }));

    if (!hasSupabaseConfig || !supabase || !visitorId || isDemoPost) return;

    const { error } = await supabase.from("work_post_likes").upsert(
      { post_id: post.id, visitor_id: visitorId },
      { onConflict: "post_id,visitor_id", ignoreDuplicates: true }
    );

    if (error) {
      setLiked(false);
      setCounts((current) => ({ ...current, likes: Math.max(current.likes - 1, 0) }));
    }
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    const nextComment: WorkPostComment = {
      id: crypto.randomUUID(),
      postId: post.id,
      visitorName: "Guest",
      commentText: text,
      createdAt: new Date().toISOString()
    };

    setCommentText("");
    setComments((current) => [nextComment, ...current].slice(0, 5));
    setCounts((current) => ({ ...current, comments: current.comments + 1 }));

    if (!hasSupabaseConfig || !supabase || !visitorId || isDemoPost) return;

    const { error } = await supabase.from("work_post_comments").insert({
      post_id: post.id,
      visitor_id: visitorId,
      visitor_name: "Guest",
      comment_text: text
    });

    if (error) {
      setComments((current) => current.filter((comment) => comment.id !== nextComment.id));
      setCounts((current) => ({ ...current, comments: Math.max(current.comments - 1, 0) }));
    }
  }

  async function sharePost() {
    const shouldCountShare = !shared;

    if (shouldCountShare) {
      setShared(true);
      setCounts((current) => ({ ...current, shares: current.shares + 1 }));
    }

    if (shouldCountShare && hasSupabaseConfig && supabase && visitorId && !isDemoPost) {
      const { error } = await supabase.from("work_post_shares").upsert(
        { post_id: post.id, visitor_id: visitorId },
        { onConflict: "post_id,visitor_id", ignoreDuplicates: true }
      );
      if (error) {
        setShared(false);
        setCounts((current) => ({ ...current, shares: Math.max(current.shares - 1, 0) }));
      }
    }

    const shareText = `${post.worker.name} work update on MistriHub: ${post.caption}`;

    if (navigator.share) {
      await navigator.share({ title: post.worker.name, text: shareText, url: profileUrl });
      return;
    }

    await navigator.clipboard?.writeText(profileUrl);
  }

  function enableSound(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const video = previewVideoRef.current;
    setSoundEnabled(true);
    setShowSoundPrompt(false);
    window.localStorage.setItem("mistrihub_sound_enabled", "true");
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    void video.play().catch(() => undefined);
  }
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-soft">
      <div role="button" tabIndex={0} onClick={() => setLightboxOpen(true)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setLightboxOpen(true); }} className="block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-0" aria-label="Open media full view">
        <div className="relative flex max-h-[520px] min-h-48 w-full items-center justify-center bg-black/95">
          {post.mediaType === "video" ? (
            <video ref={previewVideoRef} className="h-auto max-h-[520px] w-auto max-w-full object-contain" src={post.mediaUrl} autoPlay muted loop playsInline preload="auto" onLoadedData={(event) => { const video = event.currentTarget; video.muted = true; void video.play().catch(() => undefined); }} />
          ) : (
            <img src={post.mediaUrl} alt={`${post.worker.name} work update`} className="h-auto max-h-[520px] w-auto max-w-full object-contain" loading="lazy" decoding="async" />
          )}
          {post.mediaType === "video" && showSoundPrompt ? (
            <button type="button" onClick={enableSound} className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-ink shadow-lg">Sound on</button>
          ) : null}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Link href={`/workers/${post.worker.id}`} className="shrink-0 focus-visible:outline-none focus-visible:ring-0" aria-label={`${post.worker.name} profile`}>
            <img src={post.worker.profilePhoto} alt={post.worker.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" decoding="async" />
          </Link>
          <div className="min-w-0">
            <Link href={`/workers/${post.worker.id}`} className="block truncate font-black text-ink hover:text-brand focus-visible:outline-none focus-visible:ring-0">
              {post.worker.name}
            </Link>
            <p className="truncate text-xs font-semibold text-slate-500">
              {post.worker.category} in {post.worker.city}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">{post.caption}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-black text-slate-600">
          <button type="button" onClick={() => void likePost()} className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-50 px-2 py-2 text-rose-700 transition hover:bg-rose-100">
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} aria-hidden="true" />
            {counts.likes}
          </button>
          <button type="button" onClick={() => setCommentOpen((current) => !current)} className="inline-flex items-center justify-center gap-1 rounded-lg bg-sky-50 px-2 py-2 text-sky-700 transition hover:bg-sky-100">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {counts.comments}
          </button>
          <button type="button" onClick={() => void sharePost()} className={`inline-flex items-center justify-center gap-1 rounded-lg bg-teal-50 px-2 py-2 text-brand transition hover:bg-teal-100 ${shared ? "opacity-70" : ""}`}>
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            {counts.shares}
          </button>
        </div>

        {commentOpen ? (
          <div className="mt-3 space-y-3">
            <form onSubmit={(event) => void submitComment(event)} className="flex gap-2">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-lg bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-100"
                placeholder="Write a comment"
              />
              <button type="submit" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            {comments.length > 0 ? (
              <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                {comments.map((comment) => (
                  <p key={comment.id}>
                    <span className="font-bold text-ink">{comment.visitorName}:</span> {comment.commentText}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center overflow-y-auto bg-black/90 p-3 sm:p-6" role="dialog" aria-modal="true">
          <div className="relative flex max-h-[96dvh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-neutral-950 shadow-2xl">
            <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-neutral-950 px-4 py-3 pr-16 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-black sm:text-base">{post.worker.name}</p>
                <p className="truncate text-xs text-white/70">{post.caption}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-lg transition hover:bg-slate-100"
              aria-label="Close full view"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-black p-2 sm:p-4">
              {post.mediaType === "video" ? (
                <video ref={lightboxVideoRef} className="h-auto max-h-[90dvh] w-auto max-w-full object-contain" src={post.mediaUrl} controls autoPlay playsInline preload="auto" />
              ) : (
                <img src={post.mediaUrl} alt={`${post.worker.name} work update full view`} className="h-auto max-h-[90dvh] w-auto max-w-full object-contain" decoding="async" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
































