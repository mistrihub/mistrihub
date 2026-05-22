import { Suspense } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { CategoryGrid } from "@/components/category-grid";
import { SearchForm } from "@/components/search-form";
import { WorkerList } from "@/components/worker-list";
import { getFeaturedWorkers, getWorkers } from "@/lib/workers";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{
    category?: string;
    location?: string;
    rating?: string;
    sort?: "rating" | "experience" | "newest";
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const rating = params.rating ? Number(params.rating) : undefined;
  const workers = await getWorkers({
    category: params.category,
    location: params.location,
    rating: Number.isFinite(rating) ? rating : undefined,
    sort: params.sort
  });
  const featuredWorkers = await getFeaturedWorkers();

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:px-8 lg:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm font-semibold text-brand">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              शहर के सबसे भरोसेमंद लोकल वर्कर प्लेटफॉर्म से जुड़ें।
              आज ही फ्री में अकाउंट बनाएं और अपने आस-पास काम पाएं।
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Find reliable local workers near you in India.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Search electricians, plumbers, drivers, carpenters, mechanics, painters, and AC repair technicians. Compare profiles and contact directly.
            </p>
            <div className="mt-8">
              <Suspense>
                <SearchForm />
              </Suspense>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand" aria-hidden="true" />
                Public browsing
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand" aria-hidden="true" />
                WhatsApp contact
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand" aria-hidden="true" />
                Mobile first
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-soft">

            <div className="rounded-lg bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand">Live availability</p>
                  <h2 className="text-2xl font-black text-ink">Top workers</h2>
                </div>
                <ShieldCheck className="h-8 w-8 text-brand" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                {featuredWorkers.slice(0, 3).map((worker) => (
                  <Link
                    key={worker.id}
                    href={`/workers/${worker.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-brand"
                  >
                    <div>
                      <p className="font-bold text-ink">{worker.name}</p>
                      <p className="text-sm text-slate-600">
                        {worker.category} in {worker.city}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700">
                      {worker.rating}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand">Categories</p>
            <h2 className="mt-2 text-3xl font-black text-ink">Book the help you need</h2>
          </div>
          <Link href="/categories" className="hidden items-center gap-2 text-sm font-bold text-brand sm:inline-flex">
            See all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <CategoryGrid />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand">Nearby discovery</p>
              <h2 className="mt-2 text-2xl font-black text-ink">Find top-rated workers by city</h2>
              <p className="mt-2 text-slate-600">Browse sections like top electricians and top plumbers, ranked by customer ratings.</p>
            </div>
            <Link
              href="/nearby"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition hover:bg-teal-800"
            >
              Explore nearby
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="workers" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-brand">Workers</p>
            <h2 className="mt-2 text-3xl font-black text-ink">
              {params.category || params.location || params.rating || params.sort ? "Search results" : "Featured workers"}
            </h2>
            <p className="mt-2 text-slate-600">
              {workers.length} profile{workers.length === 1 ? "" : "s"} ready to contact.
            </p>
          </div>
          <WorkerList workers={workers} />
        </div>
      </section>
    </>
  );
}



