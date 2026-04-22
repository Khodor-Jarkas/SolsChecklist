import Link from "next/link";
import { signUp } from "@/app/auth/actions";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="max-w-sm mx-auto py-16 space-y-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md p-3">
          {error}
        </p>
      )}
      <form action={signUp} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="username" className="text-sm text-[var(--foreground)]/80">Username</label>
          <input id="username" name="username" type="text" minLength={3} maxLength={24} required className="input" />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-[var(--foreground)]/80">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-[var(--foreground)]/80">Password</label>
          <input id="password" name="password" type="password" minLength={6} required className="input" autoComplete="new-password" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Sign up</button>
      </form>
      <p className="text-sm text-[var(--foreground)]/70">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
