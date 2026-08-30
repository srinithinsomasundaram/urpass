import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/billing/", "/event/", "/scan/", "/api/"],
      },
    ],
    sitemap: "https://urpass.space/sitemap.xml",
  };
}
