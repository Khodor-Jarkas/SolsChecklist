import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Clears the cached catalog (auras + achievements) so edits made in Supabase
// show up immediately instead of after the cache TTL.
//
// Call it with the secret from the REVALIDATE_SECRET env var, either by hand:
//   curl -X POST https://<site>/api/revalidate -H "x-revalidate-secret: <secret>"
// or automatically from a Supabase Database Webhook on the auras and
// achievements tables (add the same header in the webhook settings).
export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "REVALIDATE_SECRET is not configured" }, { status: 503 });
  }

  const given = req.headers.get("x-revalidate-secret") ?? req.nextUrl.searchParams.get("secret") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("catalog");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
