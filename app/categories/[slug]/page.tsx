import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageIntro } from "@/components/page-intro";
import { PatternCard } from "@/components/pattern-card";
import { publicCategory, publicCategories, publicPatternsByCategory } from "@/lib/public-patterns";

export async function generateStaticParams() { return (await publicCategories()).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const category = await publicCategory(slug); return category ? { title: `${category.name} Fuse Bead Patterns`, description: category.description, alternates: { canonical: `/categories/${slug}` } } : {}; }
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const category = await publicCategory(slug); if (!category) notFound(); const items = await publicPatternsByCategory(slug); return <><div className="shell"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: category.name }]} /></div><PageIntro eyebrow={`${category.count} patterns`} title={`${category.name} fuse bead patterns.`} copy={category.description} /><section className="listing-section shell">{items.length ? <div className="pattern-grid">{items.map((pattern) => <PatternCard pattern={pattern} key={pattern.slug} />)}</div> : <div className="empty-state"><h2>This collection is being assembled.</h2><p>Its route and layout are ready for the first published patterns.</p></div>}</section></>; }
