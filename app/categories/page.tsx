import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { PatternVisual } from "@/components/pattern-visual";
import { publicCategories } from "@/lib/public-patterns";

export const metadata: Metadata = { title: "Fuse Bead Pattern Categories", description: "Explore FuseMosaic patterns by animals, flowers, fantasy, food, dinosaurs, seasonal themes and Chinese style.", alternates: { canonical: "/categories" } };
export default async function CategoriesPage() { const categories=await publicCategories(); return <><PageIntro eyebrow="Browse the archive" title="Find your corner of the mosaic wall." copy="Move through the library by subject, season, or visual tradition." /><section className="category-index shell">{categories.map((category) => <Link className="category-index__item" href={`/categories/${category.slug}`} key={category.slug}><PatternVisual art={category.art} label={category.name} /><div className="category-index__copy"><span>{category.count} patterns</span><h2>{category.name}</h2><p>{category.description}</p><b>View collection →</b></div></Link>)}</section></>; }
