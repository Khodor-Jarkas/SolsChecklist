import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import { OAuthButtons } from "@/components/OAuthButtons";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <section className="max-w-sm mx-auto py-12">
      <div className="card p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Sign in to continue tracking your progress.
          </p>
        </div>

        {message && (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md p-3">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md p-3">
            {error}
          </p>
        )}

        <OAuthButtons />

        <form action={signIn} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Email</label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Password</label>
            <input id="password" name="password" type="password" required className="input" autoComplete="current-password" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2">Sign in</button>
        </form>

        <p className="text-sm text-[var(--foreground-muted)] text-center">
          New here?{" "}
          <Link href="/sign-up" className="text-[var(--accent)] hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
