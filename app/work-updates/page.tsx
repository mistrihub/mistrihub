import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Images } from "lucide-react";
import { WorkPostCard } from "@/components/work-post-card";
import { getAllWorkPosts } from "@/lib/workers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Worker Work Photos & Videos | MistriHub",
  description: "See real work photos and videos uploaded by MistriHub workers. Find trusted local electricians, plumbers, carpenters, mechanics, painters, helpers, and repair workers."
};

export default async function WorkUpdatesPage() {
  const posts = await getAllWorkPosts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-teal-800">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>

      <div className="mb-8">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand">
          <Images className="h-4 w-4" aria-hidden="true" />
          Work updates
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-5xl">All worker photos & videos</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Browse uploaded work from local workers. Open any worker profile to follow, like, comment, share, or contact directly.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <WorkPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-black text-ink">No uploads yet</p>
          <p className="mt-2 text-sm text-slate-600">Once workers upload photos or videos, they will appear here.</p>
        </div>
      )}
    </main>
  );
}
