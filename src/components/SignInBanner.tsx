import Link from "next/link";

export function SignInBanner({ what }: { what: string }) {
  return (
    <div className="card p-4 flex items-center gap-3 flex-wrap border-[var(--accent)]/40 bg-[var(--accent)]/5">
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-medium">Sign in to {what}</p>
          <p className="text-xs text-[var(--foreground-muted)]">
            Browse the catalog as a guest, or sign in to check things off.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/sign-in" className="btn btn-sm btn-ghost">
          Sign in
        </Link>
        <Link href="/sign-up" className="btn btn-sm btn-primary">
          Sign up
        </Link>
      </div>
    </div>
  );// damn
}
