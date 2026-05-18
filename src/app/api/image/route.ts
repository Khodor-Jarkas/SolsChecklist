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

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !isAllowed(url)) return new NextResponse(null, { status: 400 });

  const sizeParam = req.nextUrl.searchParams.get("size");
  const px = sizeParam === "large" ? SIZES.large : SIZES.thumb;

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "SolsChecklist/1.0" },
      next: { revalidate: 86400 },
    });
    if (!upstream.ok) return new NextResponse(null, { status: 502 });

    const webp = await sharp(Buffer.from(await upstream.arrayBuffer()), { animated: true })
      .resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 85 })
      .toBuffer();

    return new NextResponse(new Uint8Array(webp), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
