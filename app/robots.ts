import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://fusemosaic.com/sitemap.xml", host: "https://fusemosaic.com" }; }
