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

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !isAllowed(url)) return new NextResponse(null, { status: 400 });

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "SolsChecklist/1.0" },
      next: { revalidate: 86400 },
    });
    if (!upstream.ok) return new NextResponse(null, { status: 502 });

    const webp = await sharp(Buffer.from(await upstream.arrayBuffer()), { animated: false })
      .resize(150, 150, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
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
