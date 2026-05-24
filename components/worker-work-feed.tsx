"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Send, Share2, UserPlus } from "lucide-react";
import type { WorkPost, Worker } from "@/types/worker";

export function WorkerWorkFeed({ worker, posts }: { worker: Worker; posts: WorkPost[] }) {
  const [following, setFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [activeCommentPost, setActiveCommentPost] = useState("");
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const profileUrl = useMemo(() => (typeof window === "undefined" ? "" : window.location.href), []);

  async function shareProfile(post?: WorkPost) {
    const shareText = post?.caption ? `${worker.name} work update: ${post.caption}` : `${worker.name} on MistriHub`;

    if (navigator.share) {
      await navigator.share({ title: worker.name, text: shareText, url: profileUrl || `/workers/${worker.id}` });
      return;
    }

    await navigator.clipboard?.writeText(profileUrl || `/workers/${worker.id}`);
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand">Work updates</p>
          <h2 className="mt-2 text-2xl font-black text-ink">Real work photos and videos</h2>
        </div>
        <button
          type="button"
          onClick={() => setFollowing((value) => !value)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition hover:bg-teal-800"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {following ? "Following" : "Follow"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {posts.map((post) => {
          const liked = Boolean(likedPosts[post.id]);
          const postComments = comments[post.id] ?? [];

          return (
            <article key={post.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="flex items-center gap-3 p-4">
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

              <div className="relative bg-slate-100">
                {post.mediaType === "video" ? (
                  <video src={post.mediaUrl} controls playsInline className="aspect-video w-full bg-black object-cover" />
                ) : (
                  <div className="relative aspect-video w-full">
                    <Image src={post.mediaUrl} alt={post.caption} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLikedPosts((current) => ({ ...current, [post.id]: !liked }))}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-bold text-ink transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Heart className={`h-4 w-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`} aria-hidden="true" />
                      {post.likeCount + (liked ? 1 : 0)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCommentPost(activeCommentPost === post.id ? "" : post.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-bold text-ink transition hover:bg-teal-50 hover:text-brand"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      {post.commentCount + postComments.length}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => void shareProfile(post)}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm font-bold text-ink transition hover:bg-teal-50 hover:text-brand"
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    Share
                  </button>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  <span className="font-black text-ink">{worker.name}</span> {post.caption}
                </p>

                {activeCommentPost === post.id ? (
                  <CommentBox
                    onSubmit={(comment) => {
                      setComments((current) => ({ ...current, [post.id]: [...(current[post.id] ?? []), comment] }));
                      setActiveCommentPost("");
                    }}
                  />
                ) : null}

                {postComments.length > 0 ? (
                  <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    {postComments.map((comment, index) => (
                      <p key={`${post.id}-${index}`}>{comment}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
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
