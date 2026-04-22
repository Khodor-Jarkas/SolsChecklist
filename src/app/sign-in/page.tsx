import Link from "next/link";
import { signIn } from "@/app/auth/actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <section className="max-w-sm mx-auto py-16 space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {message && (
        <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-md p-3">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md p-3">
          {error}
        </p>
      )}
      <form action={signIn} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-[var(--foreground)]/80">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-[var(--foreground)]/80">Password</label>
          <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Sign in</button>
      </form>
      <p className="text-sm text-[var(--foreground)]/70">
        No account?{" "}
        <Link href="/sign-up" className="text-[var(--accent)] hover:underline">
          Create one
        </Link>
      </p>
    </section>
  );
}
