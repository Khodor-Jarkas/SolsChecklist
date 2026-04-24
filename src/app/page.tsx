import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

export default async function HomePage() {
  const user = await getUser();
  if (user) redirect("/profile");

  return (
    <div className="space-y-16 md:space-y-24 py-8 md:py-12">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card)]/50 text-xs text-[var(--foreground-muted)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
          </span>
          Community tracker for Sol&apos;s RNG
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          Every aura and achievement
          <br />
          <span className="bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
            in one place.
          </span>
        </h1>
        <p className="text-base md:text-lg text-[var(--foreground-muted)] max-w-xl mx-auto">
          Keep your rolls organized across sessions. Track counts, filter by
          rarity and biome, and watch your collection grow.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/sign-up" className="btn btn-primary">
            Get started — free
          </Link>
          <Link href="/sign-in" className="btn btn-ghost">
            Sign in
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          title="Aura checklist"
          description="Every rarity from Common to Transcendent. Filter by biome, search by name, track how many you've rolled."
          accent="purple"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
          }
        />
        <FeatureCard
          title="Achievements"
          description="Roll milestones, biome firsts, event badges. Grouped by category so nothing slips through."
          accent="blue"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          }
        />
        <FeatureCard
          title="Public profiles"
          description="Share your collection with a clean /u/username link. Browse friends' progress and compare rare rolls."
          accent="pink"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
      </section>

      {/* How it works */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Three taps from empty to tracked
          </h2>
          <p className="text-[var(--foreground-muted)]">
            No complicated setup. Sign in, start checking.
          </p>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          <Step num={1} title="Sign up">
            Email and password, or one-click with Discord.
          </Step>
          <Step num={2} title="Check things off">
            Tap the box when you roll, increment when you re-roll.
          </Step>
          <Step num={3} title="See your progress">
            Your profile shows owned vs. missing at a glance, by rarity.
          </Step>
        </ol>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-8 border-t border-[var(--border)]">
        <p className="text-[var(--foreground-muted)] mb-4">Ready to track your first aura?</p>
        <Link href="/sign-up" className="btn btn-primary">
          Create your account
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  accent,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: "purple" | "blue" | "pink";
}) {
  const accentClasses = {
    purple: "text-purple-400 bg-purple-500/10",
    blue: "text-sky-400 bg-sky-500/10",
    pink: "text-pink-400 bg-pink-500/10",
  }[accent];

  return (
    <div className="card p-6 space-y-4">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${accentClasses}`}>
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function Step({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="card p-5 space-y-2">
      <div className="flex items-center gap-3">
        <span className="h-7 w-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-sm font-semibold flex items-center justify-center">
          {num}
        </span>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-[var(--foreground-muted)] leading-relaxed pl-10">
        {children}
      </p>
    </li>
  );
}
