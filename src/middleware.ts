import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Skip static assets and the image proxy — they never need a session,
    // and running auth for each of the hundreds of aura thumbnails on a page
    // added an Auth round trip in front of every image.
    "/((?!_next/static|_next/image|api/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
