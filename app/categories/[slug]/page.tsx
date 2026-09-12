import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageIntro } from "@/components/page-intro";
import { PatternCard } from "@/components/pattern-card";
import { categories, getCategory, patternsByCategory } from "@/data/patterns";

export const dynamicParams = false;
export function generateStaticParams() { return categories.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const category = getCategory(slug); return category ? { title: `${category.name} Fuse Bead Patterns`, description: category.description, alternates: { canonical: `/categories/${slug}` } } : {}; }
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const category = getCategory(slug); if (!category) notFound(); const items = patternsByCategory(slug); return <><div className="shell"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: category.name }]} /></div><PageIntro eyebrow={`${category.count} pieces planned`} title={`${category.name} fuse bead patterns.`} copy={category.description} /><section className="listing-section shell">{items.length ? <div className="pattern-grid">{items.map((pattern) => <PatternCard pattern={pattern} key={pattern.slug} />)}</div> : <div className="empty-state"><h2>This collection is being assembled.</h2><p>Its route and layout are ready for the first published patterns.</p></div>}</section></>; }
