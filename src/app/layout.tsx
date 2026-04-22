import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getUser } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata: Metadata = {
  title: "Sol's Checklist",
  description: "Track your Sol's RNG progress — auras, achievements, and crafting.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              <span className="text-[var(--accent)]">Sol&apos;s</span> Checklist
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {user ? (
                <>
                  <NavLink href="/auras">Auras</NavLink>
                  <NavLink href="/achievements">Achievements</NavLink>
                  <NavLink href="/crafting">Crafting</NavLink>
                  <NavLink href="/profile">Profile</NavLink>
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
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] transition"
    >
      {children}
    </Link>
  );
}
