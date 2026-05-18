import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/sign-in", "/sign-up", "/auth/", "/api/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sols-checklist.vercel.app"}/sitemap.xml`,
  };
}
