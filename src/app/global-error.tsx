"use client";

// Last-resort error screen for failures in the root layout itself (where
// app/error.tsx can't render). Must provide its own <html> and <body>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a13", color: "#ececf4", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Sol&apos;s Checklist is having trouble</h1>
          <p style={{ color: "#a1a1b3", fontSize: 14 }}>Something went wrong loading the site. Please try again.</p>
          <button
            onClick={reset}
            style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: 0, background: "#a855f7", color: "#fff", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
