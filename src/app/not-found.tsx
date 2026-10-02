import Link from "next/link";

export default function NotFound() {
  return (
    <section className="card p-10 text-center space-y-4 max-w-lg mx-auto">
      <p className="text-5xl font-semibold text-[var(--accent)]">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-[var(--foreground-muted)]">
        That page or user doesn&apos;t exist. Check the link, or try one of these.
      </p>
      <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
        <Link href="/auras" className="btn btn-primary">
          Browse auras
        </Link>
        <Link href="/achievements" className="btn btn-ghost">
          Achievements
        </Link>
        <Link href="/" className="btn btn-ghost">
          Home
        </Link>
      </div>
    </section>
  );
}
