import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sols-checklist.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/auras`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/achievements`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/biomes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
}
