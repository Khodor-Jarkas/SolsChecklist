"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserSearch } from "@/components/UserSearch";
import { SignOutButton } from "@/components/SignOutButton";

// Small-screen navigation: the desktop nav hides Biomes and user search on
// phones, so everything lives behind this menu button below the md breakpoint.
export function MobileMenu({
  signedIn,
  username,
}: {
  signedIn: boolean;
  username: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after navigating.
  useEffect(() => setOpen(false), [pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const profileHref = username ? `/u/${encodeURIComponent(username)}` : "/profile";
  const links = [
    { href: "/auras", label: "Auras" },
    { href: "/biomes", label: "Biomes" },
    { href: "/achievements", label: "Achievements" },
    ...(signedIn ? [{ href: profileHref, label: username ? `Profile (@${username})` : "Profile" }] : []),
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--border)] hover:bg-[var(--card-hover)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-14 border-b border-[var(--border)] bg-[var(--background)] shadow-lg"
        >
          <nav className="mx-auto max-w-6xl px-4 py-4 space-y-4" aria-label="Mobile navigation">
            <UserSearch fullWidth />
            <ul className="space-y-1">
              {links.map((l) => {
                const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`block px-3 py-2.5 rounded-md text-sm ${
                        active
                          ? "bg-[var(--card-hover)] text-[var(--foreground)]"
                          : "text-[var(--foreground)]/80 hover:bg-[var(--card-hover)]"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2">
              {signedIn ? (
                <SignOutButton />
              ) : (
                <>
                  <Link href="/sign-in" className="btn btn-ghost flex-1">
                    Sign in
                  </Link>
                  <Link href="/sign-up" className="btn btn-primary flex-1">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
