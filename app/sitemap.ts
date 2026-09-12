import type { MetadataRoute } from "next";
import { categories, patterns } from "@/data/patterns";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fusemosaic.com"; const now = new Date("2026-09-12");
  const staticRoutes = ["", "/patterns", "/categories", "/chinese", "/about", "/contact", "/copyright", "/privacy"];
  return [
    ...staticRoutes.map((route, index) => ({ url: `${base}${route}`, lastModified: now, changeFrequency: (index < 4 ? "weekly" : "monthly") as "weekly" | "monthly", priority: index === 0 ? 1 : index < 4 ? .8 : .4 })),
    ...patterns.map((pattern) => ({ url: `${base}/patterns/${pattern.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: .7 })),
    ...categories.map((category) => ({ url: `${base}/categories/${category.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: .6 })),
  ];
}
