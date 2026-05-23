import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Star } from "lucide-react";
import type { Worker } from "@/types/worker";
import { createWhatsAppUrl, formatPrice } from "@/lib/utils";

export function WorkerCard({ worker }: { worker: Worker }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <Link
        href={`/workers/${worker.id}`}
        className="relative block h-48 bg-white outline-none focus-visible:outline-none focus-visible:ring-0 sm:h-52"
        aria-label={`View ${worker.name} profile`}
      >
        <Image src={worker.profilePhoto} alt={worker.name} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
        {worker.availableToday ? (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand shadow-sm">
            Available today
          </span>
        ) : null}
      </Link>
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand">{worker.category}</p>
            <h3 className="mt-1 text-lg font-bold text-ink">{worker.name}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700">
            <Star className="h-4 w-4 fill-current" aria-hidden="true" />
            {worker.rating}
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{worker.shortDescription}</p>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>{worker.experienceYears}+ years experience</p>
          <p className="font-medium text-slate-700">{worker.city}</p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
            {worker.location}
          </p>
          <p className="font-semibold text-ink">Starts at {formatPrice(worker.startingPrice)}</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/workers/${worker.id}`}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-ink transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-0"
          >
            View profile
          </Link>
          <a
            href={createWhatsAppUrl(worker)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-0"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
