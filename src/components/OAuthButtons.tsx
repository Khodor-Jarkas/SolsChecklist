"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function OAuthButtons() {
  const supabase = useMemo(() => createClient(), []);
  const [pending, setPending] = useState<string | null>(null);

  async function signInWith(provider: "discord") {
    setPending(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setPending(null);
      console.error(error);
    }
    // Success path is a browser redirect; nothing else to do here.
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => signInWith("discord")}
        disabled={pending !== null}
        className="btn btn-ghost w-full disabled:opacity-60"
      >
        <svg
          viewBox="0 0 71 55"
          className="h-4 w-4"
          aria-hidden="true"
          fill="currentColor"
        >
          <path d="M60.1 4.9A58.6 58.6 0 0 0 45.5.4c-.6 1.1-1.4 2.6-1.9 3.8a54.2 54.2 0 0 0-16.2 0c-.5-1.2-1.3-2.7-2-3.8A58.3 58.3 0 0 0 10.9 4.9C1.4 19.3-1.2 33.3.1 47.1a58.9 58.9 0 0 0 18 9.1c1.5-2 2.8-4.2 3.9-6.5-2.2-.8-4.3-1.8-6.2-3 .5-.4 1-.8 1.5-1.2a42 42 0 0 0 36.4 0l1.5 1.2c-2 1.2-4 2.2-6.2 3 1.1 2.3 2.4 4.5 3.9 6.5a58.6 58.6 0 0 0 18-9.1c1.6-16.1-2.7-30-10.8-42.2ZM23.7 38.6c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3 6.5 3.3 6.4 7.3c0 4-2.8 7.3-6.4 7.3Zm23.6 0c-3.5 0-6.4-3.3-6.4-7.3s2.8-7.3 6.4-7.3 6.5 3.3 6.4 7.3c0 4-2.8 7.3-6.4 7.3Z" />
        </svg>
        {pending === "discord" ? "Redirecting…" : "Continue with Discord"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--background)] px-2 text-[var(--foreground)]/60">
            or with email
          </span>
        </div>
      </div>
    </div>
  );
}
