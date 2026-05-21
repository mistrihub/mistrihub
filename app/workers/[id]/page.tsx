import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarCheck, MessageCircle, Phone, Star } from "lucide-react";
import { ReviewSection } from "@/components/review-section";
import { getReviews, getWorkerById } from "@/lib/workers";
import { createWhatsAppUrl, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProfileProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProfileProps): Promise<Metadata> {
  const { id } = await params;
  const worker = await getWorkerById(id);

  if (!worker) {
    return {
      title: "Worker not found"
    };
  }

  return {
    title: `${worker.name} - ${worker.category} in ${worker.city}`,
    description: worker.shortDescription
  };
}

export default async function WorkerProfilePage({ params }: ProfileProps) {
  const { id } = await params;
  const worker = await getWorkerById(id);
  const reviews = await getReviews(id);

  if (!worker) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
            <Image src={worker.profilePhoto} alt={worker.name} fill className="object-cover" priority sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {worker.gallery.map((image, index) => (
              <div key={image} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image src={image} alt={`${worker.name} work sample ${index + 1}`} fill className="object-cover" sizes="180px" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand">{worker.category}</p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-ink">{worker.name}</h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">{worker.bio}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Experience</p>
              <p className="mt-1 text-xl font-black text-ink">{worker.experienceYears}+ yrs</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Rating</p>
              <p className="mt-1 flex items-center gap-1 text-xl font-black text-ink">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" aria-hidden="true" />
                {worker.rating}
              </p>
              <p className="mt-1 text-xs text-slate-500">{worker.reviewCount} reviews</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">From</p>
              <p className="mt-1 text-xl font-black text-ink">{formatPrice(worker.startingPrice)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <CalendarCheck className="mt-1 h-5 w-5 text-brand" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-black text-ink">Service details</h2>
                <p className="mt-1 text-sm text-slate-600">{worker.location}</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {worker.serviceDetails.map((service) => (
                <li key={service} className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={createWhatsAppUrl(worker)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition hover:bg-teal-800"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Contact on WhatsApp
            </a>
            <a
              href={`tel:${worker.phone}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-ink transition hover:border-brand"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call now
            </a>
          </div>
        </div>
      </div>
      <ReviewSection workerId={worker.id} reviews={reviews} />
    </section>
  );
}
