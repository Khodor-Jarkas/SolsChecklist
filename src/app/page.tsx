import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

export default async function HomePage() {
  const user = await getUser();
  if (user) redirect("/profile");

  return (
    <section className="py-16 md:py-24 text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Track your{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sol&apos;s RNG
          </span>{" "}
          progress
        </h1>
        <p className="text-lg text-[var(--foreground)]/70 max-w-2xl mx-auto">
          A community checklist for auras, achievements, and crafted items.
          Keep your rolls organized across sessions — and see where you stand.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Link href="/sign-up" className="btn btn-primary">
          Get started
        </Link>
        <Link href="/sign-in" className="btn btn-ghost">
          Sign in
        </Link>
      </div>
    </section>
  );
}
