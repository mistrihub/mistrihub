import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-brand">404</p>
      <h1 className="mt-2 text-4xl font-black text-ink">Page not found</h1>
      <p className="mt-4 text-slate-600">The profile or page you are looking for is not available.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-brand px-5 text-sm font-bold text-white"
      >
        Go home
      </Link>
    </section>
  );
}
