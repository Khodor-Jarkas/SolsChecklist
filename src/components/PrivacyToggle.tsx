"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function PrivacyToggle({
  userId,
  initialPrivate,
}: {
  userId: string;
  initialPrivate: boolean;
}) {
  const [isPrivate, setIsPrivate] = useState(initialPrivate);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !isPrivate;
    setIsPrivate(next); // optimistic
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_private: next })
        .eq("id", userId);
      if (error) {
        setIsPrivate(!next); // revert
        console.error(error);
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="flex items-center gap-3 px-3 py-2 rounded-md border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--card-hover)] text-sm transition-colors"
      aria-pressed={isPrivate}
      title={isPrivate ? "Your profile is private — only you can see it" : "Your profile is public — anyone can view it"}
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          isPrivate ? "bg-[var(--accent)]" : "bg-[var(--surface)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            isPrivate ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
      <span className="flex items-center gap-1.5">
        {isPrivate ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
        <span className="font-medium">{isPrivate ? "Private" : "Public"}</span>
      </span>
    </button>
  );
}
