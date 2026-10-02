import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const ALLOWED_HOSTS = new Set(["static.wikia.nocookie.net"]);

function isAllowed(raw: string): boolean {
  try {
    const { hostname } = new URL(raw);
    return ALLOWED_HOSTS.has(hostname) || hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

// Thumbnail (default): fits in the aura checklist grid and biome list cards.
// Large: used by the detail modal on retina displays (176px CSS = 352px @2x).
const SIZES = {
  thumb: 150,
  large: 320,
} as const;

// Re-encoding animated GIFs holds every frame in memory. A page requests
// dozens of thumbnails at once, and processing them all in parallel on one
// instance could exhaust memory and fail the whole batch, so cap how many
// run at a time. Others wait their turn.
sharp.cache(false);
const MAX_CONCURRENT = 2;
let active = 0;
const waiting: (() => void)[] = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) await new Promise<void>((r) => waiting.push(r));
  else active++;
  try {
    return await fn();
  } finally {
    // Hand the slot straight to the next waiter, or free it.
    const next = waiting.shift();
    if (next) next();
    else active--;
  }
}

// Serve the original image instead of an error so the page still shows it.
// Not cached, so the next request retries the resize.
function redirectToOriginal(url: string) {
  return new NextResponse(null, {
    status: 307,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !isAllowed(url)) return new NextResponse(null, { status: 400 });

  const sizeParam = req.nextUrl.searchParams.get("size");
  const px = sizeParam === "large" ? SIZES.large : SIZES.thumb;

  let input: Buffer;
  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "SolsChecklist/1.0" },
      next: { revalidate: 86400 },
    });
    // The file is gone from the wiki: say so, rather than redirecting to
    // Fandom's grey placeholder. The page shows the letter tile instead.
    if (upstream.status === 404 || upstream.status === 410) {
      return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    if (!upstream.ok) return redirectToOriginal(url);
    input = Buffer.from(await upstream.arrayBuffer());
  } catch {
    return redirectToOriginal(url);
  }

  try {
    const webp = await withSlot(() =>
      sharp(input, { animated: true })
        .resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 85 })
        .toBuffer(),
    );

    return new NextResponse(new Uint8Array(webp), {
      headers: {
        "Content-Type": "image/webp",
        // s-maxage lets the CDN (Vercel edge, Cloudflare, …) keep the resized
        // image. max-age alone only caches in each visitor's browser, so every
        // new visitor re-ran the upstream fetch + sharp re-encode per image.
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("image resize failed", url, e);
    return redirectToOriginal(url);
  }
}
