"use client";

import { useEffect } from "react";
import Link from "next/link";

// Shown when a page throws while rendering. The header stays in place, so
// visitors can retry or navigate away instead of hitting a blank screen.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="card p-10 text-center space-y-4 max-w-lg mx-auto">
      <div className="mx-auto h-12 w-12 rounded-full bg-[var(--danger)]/10 flex items-center justify-center text-[var(--danger)]" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-[var(--foreground-muted)]">
        This page hit an error while loading. It&apos;s usually temporary, so try again.
      </p>
      {error.digest && (
        <p className="text-xs font-mono text-[var(--foreground-faint)]">Error ID: {error.digest}</p>
      )}
      <div className="flex items-center justify-center gap-2 pt-2">
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          Go home
        </Link>
      </div>
    </section>
  );
}
