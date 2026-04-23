import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { createClient, getUser } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sol's Checklist",
  description: "Track your Sol's RNG progress — auras, achievements, and crafting.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  let username: string | null = null;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = data?.username ?? null;
  }

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/75 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold tracking-tight text-[15px]">
              <span className="text-[var(--accent)]">Sol&apos;s</span>{" "}
              <span className="text-[var(--foreground)]">Checklist</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {user ? (
                <>
                  <NavLink href="/auras">Auras</NavLink>
                  <NavLink href="/achievements">Achievements</NavLink>
                  <NavLink href="/crafting">Crafting</NavLink>
                  <NavLink href="/profile">Profile</NavLink>
                  {username && (
                    <Link
                      href={`/u/${encodeURIComponent(username)}`}
                      className="hidden sm:inline-flex items-center ml-2 px-2 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-colors"
                      title="View your public profile"
                    >
                      @{username}
                    </Link>
                  )}
                  <SignOutButton />
                </>
              ) : (
                <>
                  <NavLink href="/sign-in">Sign in</NavLink>
                  <Link href="/sign-up" className="btn btn-primary ml-2">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors"
    >
      {children}
    </Link>
  );
}
