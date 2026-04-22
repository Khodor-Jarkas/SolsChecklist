import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import { OAuthButtons } from "@/components/OAuthButtons";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="max-w-sm mx-auto py-12">
      <div className="card p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Start tracking in under 30 seconds.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md p-3">
            {error}
          </p>
        )}

        <OAuthButtons />

        <form action={signUp} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Username</label>
            <input id="username" name="username" type="text" minLength={3} maxLength={24} required className="input" placeholder="coolroller99" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Email</label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Password</label>
            <input id="password" name="password" type="password" minLength={6} required className="input" autoComplete="new-password" placeholder="at least 6 characters" />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2">Create account</button>
        </form>

        <p className="text-sm text-[var(--foreground-muted)] text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[var(--accent)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
