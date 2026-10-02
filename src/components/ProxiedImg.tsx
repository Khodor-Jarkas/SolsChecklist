"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Catalog image served through the /api/image resizer. If the resized version
// fails (resizer error, timeout, upstream hiccup), fall back to the original
// image URL; if that fails too, render `fallback` (e.g. the letter tile)
// instead of a broken-image icon.
export function ProxiedImg({
  url,
  size,
  alt,
  className,
  loading = "lazy",
  priority = false,
  fallback = null,
}: {
  url: string;
  size?: "large";
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  fallback?: ReactNode;
}) {
  const [stage, setStage] = useState<"proxy" | "direct" | "failed">("proxy");
  const ref = useRef<HTMLImageElement>(null);

  const next = () => setStage((s) => (s === "proxy" ? "direct" : "failed"));

  // An image that failed before hydration never fires React's onError, so
  // check once on mount for an image that finished loading with no pixels.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) next();
  }, []);

  if (stage === "failed") return <>{fallback}</>;

  const src =
    stage === "proxy"
      ? `/api/image?url=${encodeURIComponent(url)}${size ? `&size=${size}` : ""}`
      : url;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={priority ? "eager" : loading}
      decoding="async"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchPriority={priority ? "high" : ("auto" as any)}
      referrerPolicy={stage === "direct" ? "no-referrer" : undefined}
      onError={next}
      className={className}
    />
  );
}
