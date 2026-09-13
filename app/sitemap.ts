import type { MetadataRoute } from "next";
import { publicCategories, publicChineseCollection, publicPatterns } from "@/lib/public-patterns";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://fusemosaic.com";
  const staticRoutes = ["", "/patterns", "/categories", "/chinese", "/about", "/contact", "/copyright", "/privacy", "/disclaimer", "/terms"];
  const [patterns, chineseCollection, categories] = await Promise.all([publicPatterns(), publicChineseCollection(), publicCategories()]);
  const publishedPatterns = [...new Map([...patterns, ...chineseCollection].map((pattern) => [pattern.slug, pattern])).values()];
  return [
    ...staticRoutes.map((route, index) => ({ url: `${base}${route}`, changeFrequency: (index < 4 ? "weekly" : "monthly") as "weekly" | "monthly", priority: index === 0 ? 1 : index < 4 ? .8 : .4 })),
    ...publishedPatterns.map((pattern) => ({ url: `${base}/patterns/${pattern.slug}`, lastModified: pattern.lastModified, changeFrequency: "monthly" as const, priority: .7, images: pattern.previewImage ? [`${base}${pattern.previewImage}`] : undefined })),
    ...categories.map((category) => ({ url: `${base}/categories/${category.slug}`, lastModified: category.lastModified, changeFrequency: "weekly" as const, priority: .6 })),
  ];
}
