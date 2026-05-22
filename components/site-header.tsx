import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, MapPin, UserPlus } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1 sm:px-6 lg:px-8">
        <Link href="/" className="relative block h-16 w-72 shrink-0 sm:h-20 sm:w-[420px] lg:h-24 lg:w-[520px]" aria-label="MistriHub home">
          <Image
            src="/header-logo.png"
            alt="MistriHub"
            fill
            priority
            className="object-contain object-left"
            sizes="(min-width: 1024px) 520px, (min-width: 640px) 420px, 288px"
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#categories">Categories</Link>
          <Link href="/#workers">Workers</Link>
          <Link href="/nearby">Nearby</Link>
          <Link href="/categories">Browse</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 text-sm font-semibold text-brand sm:flex">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>India</span>
          </div>
          <Link
            href="/auth"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-3 text-sm font-bold text-white transition hover:bg-teal-800"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Join</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-ink transition hover:border-brand"
            aria-label="Worker dashboard"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}


