"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Catalog image served through the /api/image resizer. Transient resize
// failures are handled server-side (it redirects to the original image); if
// the image still fails — e.g. the file no longer exists on the wiki — render
// `fallback` (the letter tile) instead of a broken-image icon. We don't load
// the original URL directly here: for a deleted wiki file that shows Fandom's
// grey "image not found" placeholder, which looks like a real picture.
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
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // An image that failed before hydration never fires React's onError, so
  // check once on mount for an image that finished loading with no pixels.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return <>{fallback}</>;

  const src = `/api/image?url=${encodeURIComponent(url)}${size ? `&size=${size}` : ""}`;

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
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
