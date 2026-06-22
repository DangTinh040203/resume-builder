import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/builder/", "/api/", "/_next/"],
    },
    sitemap: "http://cv-builder.site/sitemap.xml",
  };
}
