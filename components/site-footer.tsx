import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-ink">MistriHub</p>
          <p>Simple worker discovery for Indian local services.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/categories">Categories</Link>
          <Link href="/#workers">Featured</Link>
        </div>
      </div>
    </footer>
  );
}
