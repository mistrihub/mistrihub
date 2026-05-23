import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, MapPin, UserPlus } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center outline-none focus-visible:outline-none focus-visible:ring-0" aria-label="MistriHub home">
          <Image
            src="/header-logo.png"
            alt="MistriHub"
            width={862}
            height={365}
            priority
            className="h-auto w-36 max-w-[42vw] sm:w-72 lg:w-80"
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 288px, 144px"
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-0 sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Join</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-ink transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-0 sm:h-10 sm:w-10"
            aria-label="Worker dashboard"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}




