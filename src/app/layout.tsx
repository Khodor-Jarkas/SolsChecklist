import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getUser, getUserProfile } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import { UserSearch } from "@/components/UserSearch";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a13",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Sol's Checklist",
    template: "%s — Sol's Checklist",
  },
  description:
    "Track your Sol's RNG progress — auras, achievements, biomes, and collection stats. Free community tracker.",
  keywords: [
    "Sol's RNG",
    "aura tracker",
    "Roblox",
    "checklist",
    "auras",
    "achievements",
    "biomes",
    "collection",
  ],
  authors: [{ name: "Sol's Checklist" }],
  creator: "Sol's Checklist",
  openGraph: {
    title: "Sol's Checklist",
    description:
      "Track your Sol's RNG progress — auras, achievements, biomes, and collection stats.",
    type: "website",
    locale: "en_US",
    siteName: "Sol's Checklist",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sol's Checklist",
    description:
      "Track your Sol's RNG progress — auras, achievements, biomes, and collection stats.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();
  const profile = user ? await getUserProfile(user.id) : null;
  const username = profile?.username ?? null;

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/75 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold tracking-tight text-[15px]">
              <span className="text-[var(--accent)]">Sol&apos;s</span>{" "}
              <span className="text-[var(--foreground)]">Checklist</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm" aria-label="Main navigation">
              <NavLink href="/auras">Auras</NavLink>
              <span className="hidden sm:contents">
                <NavLink href="/biomes">Biomes</NavLink>
              </span>
              <NavLink href="/achievements">Achievements</NavLink>
              {user && <NavLink href="/profile">Profile</NavLink>}
              <div className="hidden md:block ml-2">
                <UserSearch />
              </div>
              {user ? (
                <>
                  {username && (
                    <Link
                      href={`/u/${encodeURIComponent(username)}`}
                      className="hidden sm:inline-flex items-center ml-2 px-2 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-colors"
                      title="Your public profile"
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
        <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">{children}</main>
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
