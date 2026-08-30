import type { MetadataRoute } from "next";

const BASE = "https://urpass.space";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/feedback`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
