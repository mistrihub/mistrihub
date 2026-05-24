/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, Send, Share2, X } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { WorkPostComment, WorkPostWithWorker } from "@/types/worker";

type WorkPostCardProps = {
  post: WorkPostWithWorker;
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
  const [commentOpen, setCommentOpen] = useState(false);
  const [fullViewOpen, setFullViewOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<WorkPostComment[]>(post.comments ?? []);
  const [counts, setCounts] = useState({ likes: post.likeCount, comments: post.commentCount, shares: post.shareCount });
  const profileUrl = useMemo(() => (typeof window === "undefined" ? `/workers/${post.worker.id}` : `${window.location.origin}/workers/${post.worker.id}`), [post.worker.id]);
  const isDemoPost = post.id.includes("gallery");

  useEffect(() => {
    const nextVisitorId = getVisitorId();
    setVisitorId(nextVisitorId);

    async function loadEngagement() {
      if (!hasSupabaseConfig || !supabase || isDemoPost) return;

      const [{ data: ownLikes }, { data: dbComments }] = await Promise.all([
        supabase.from("work_post_likes").select("post_id").eq("post_id", post.id).eq("visitor_id", nextVisitorId).limit(1),
        supabase
          .from("work_post_comments")
          .select("id, post_id, visitor_name, comment_text, created_at")
          .eq("post_id", post.id)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      if (ownLikes && ownLikes.length > 0) {
        setLiked(true);
      }

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
      {
        post_id: post.id,
        visitor_id: visitorId
      },
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
    setCounts((current) => ({ ...current, shares: current.shares + 1 }));

    if (hasSupabaseConfig && supabase && visitorId && !isDemoPost) {
      const { error } = await supabase.from("work_post_shares").insert({
        post_id: post.id,
        visitor_id: visitorId
      });

      if (error) {
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

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <button type="button" onClick={() => setFullViewOpen(true)} className="block w-full text-left focus-visible:outline-none focus-visible:ring-0" aria-label="Open media full view">
        <div className="aspect-[4/3] bg-slate-100">
          {post.mediaType === "video" ? (
            <video className="h-full w-full object-cover" src={post.mediaUrl} muted playsInline preload="metadata" />
          ) : (
            <img src={post.mediaUrl} alt={`${post.worker.name} work update`} className="h-full w-full object-cover" loading="lazy" />
          )}
        </div>
      </button>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <img src={post.worker.profilePhoto} alt={post.worker.name} className="h-10 w-10 shrink-0 rounded-full object-cover" loading="lazy" />
          <div className="min-w-0">
            <p className="truncate font-black text-ink">{post.worker.name}</p>
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
          <button type="button" onClick={() => void sharePost()} className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-50 px-2 py-2 text-brand transition hover:bg-teal-100">
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

      {fullViewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6" role="dialog" aria-modal="true">
          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setFullViewOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white"
              aria-label="Close full view"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {post.mediaType === "video" ? (
              <video className="max-h-[92vh] w-full bg-black object-contain" src={post.mediaUrl} controls autoPlay playsInline />
            ) : (
              <img src={post.mediaUrl} alt={`${post.worker.name} work update full view`} className="max-h-[92vh] w-full object-contain" />
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}
