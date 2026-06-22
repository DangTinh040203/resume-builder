import { type MetadataRoute } from "next";

import { routing } from "@/i18n/routing";

const baseUrl = "http://cv-builder.site";

const routePaths = ["", "/templates", "/auth/sign-in", "/auth/sign-up"];

function localizedUrl(locale: string, path: string): string {
  const suffix = path === "" ? "" : path;
  if (locale === routing.defaultLocale) {
    return suffix === "" ? baseUrl : `${baseUrl}${suffix}`;
  }
  return `${baseUrl}/${locale}${suffix}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of routePaths) {
      entries.push({
        url: localizedUrl(locale, path),
        lastModified: new Date(),
        changeFrequency:
          path === "" ? "monthly" : path.includes("auth") ? "yearly" : "weekly",
        priority: path === "" ? 1 : path === "/templates" ? 0.8 : 0.5,
      });
    }
  }

  return entries;
}
