"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type ToastInput = {
  message: string;
  tone?: "error" | "info";
  action?: { label: string; onClick: () => void };
  durationMs?: number;
};
type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

// Small toast system: failed saves and undo prompts. Mounted once in the
// root layout; components call useToast()({ message, ... }).
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((t: ToastInput) => {
    const id = nextId.current++;
    // Keep at most three on screen.
    setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:w-96 z-50 flex flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} dismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastView({ toast, dismiss }: { toast: ToastItem; dismiss: (id: number) => void }) {
  const { id, durationMs } = toast;
  const onDismiss = () => dismiss(id);
  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), durationMs ?? 6000);
    return () => clearTimeout(timer);
  }, [dismiss, id, durationMs]);

  const isError = toast.tone === "error";
  return (
    <div
      className={`card px-4 py-3 flex items-center gap-3 shadow-lg text-sm animate-pop ${
        isError ? "border-[var(--danger)]/50" : ""
      }`}
    >
      {isError && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      )}
      <span className="flex-1">{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action!.onClick();
            onDismiss();
          }}
          className="btn btn-sm btn-primary"
        >
          {toast.action.label}
        </button>
      )}
      <button onClick={onDismiss} aria-label="Dismiss" className="text-[var(--foreground-faint)] hover:text-[var(--foreground)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// Message for a failed write, based on why it failed.
export function saveErrorMessage(error: { message?: string; code?: string } | null, signedIn = true): string {
  if (!signedIn) return "You've been signed out. Sign in again to save your progress.";
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You're offline — that change wasn't saved.";
  }
  if (error?.code === "PGRST301" || /jwt|expired/i.test(error?.message ?? "")) {
    return "Your session expired. Refresh the page to keep saving.";
  }
  return "Couldn't save that change. Please try again.";
}
