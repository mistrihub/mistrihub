import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { WorkPostCard } from "@/components/work-post-card";
import { getAllWorkPosts } from "@/lib/workers";

export async function TopWorkUpdates() {
  const posts = await getAllWorkPosts(4);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand">
          <Images className="h-4 w-4" aria-hidden="true" />
          Worker updates
        </p>
        <h2 className="mt-2 text-2xl font-black text-ink sm:text-3xl">Latest work photos & videos</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Real work uploaded by local workers. Like, comment, share, or tap any photo/video for full view.
        </p>
      </div>

      {posts.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <WorkPostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="mt-6 flex justify-center sm:justify-end">
            <Link href="/work-updates" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-brand shadow-sm transition hover:text-teal-800 focus-visible:outline-none focus-visible:ring-0">
              See more
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="font-black text-ink">No work updates yet</p>
          <p className="mt-2 text-sm text-slate-600">Workers can upload photos and videos from their dashboard.</p>
        </div>
      )}
    </section>
  );
}

