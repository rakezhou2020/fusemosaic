import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { MosaicDownloadButton } from "@/components/MosaicDownloadButton";
import { PatternCard } from "@/components/pattern-card";
import { PatternVisual } from "@/components/pattern-visual";
import { publicPattern, publicPatterns } from "@/lib/public-patterns";
import styles from "./page.module.css";

export async function generateStaticParams() { return (await publicPatterns()).map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const pattern = await publicPattern(slug); if (!pattern) return {};
  return { title: pattern.title, description: pattern.description, alternates: { canonical: `/patterns/${pattern.slug}` }, openGraph: { title: pattern.title, description: pattern.description, type: "article", images: pattern.previewImage ? [{ url: pattern.previewImage }] : undefined } };
}

export default async function PatternDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const pattern = await publicPattern(slug); if (!pattern) notFound();
  const related = (await publicPatterns()).filter((item) => item.slug !== pattern.slug && (item.categorySlug === pattern.categorySlug || item.featured)).slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "CreativeWork", name: pattern.title, description: pattern.description,
    url: `https://fusemosaic.com/patterns/${pattern.slug}`, isAccessibleForFree: true,
    image: pattern.previewImage ? `https://fusemosaic.com${pattern.previewImage}` : undefined,
    breadcrumb: { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://fusemosaic.com" },
      { "@type": "ListItem", position: 2, name: "Patterns", item: "https://fusemosaic.com/patterns" },
      { "@type": "ListItem", position: 3, name: pattern.title, item: `https://fusemosaic.com/patterns/${pattern.slug}` },
    ] },
  };
  const liveDownloads = pattern.downloadImage !== "#";
  return (
    <article className="pattern-detail shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Patterns", href: "/patterns" }, { label: pattern.title }]} />
      <header className="detail-header"><div><p className="eyebrow">{pattern.category} / Free pattern</p><h1 className="detail-title">{pattern.title}</h1><p className="detail-deck">{pattern.description}</p></div><span className="detail-free">Free download</span></header>
      <div className="detail-layout">
        <div className="detail-preview"><PatternVisual art={pattern.art} image={pattern.previewImage || undefined} label={pattern.title} priority /></div>
        <aside className="detail-panel">
          <section className="spec-panel"><h2>Pattern specs</h2><dl className="spec-list"><div><dt>Grid size</dt><dd>{pattern.gridWidth} × {pattern.gridHeight}</dd></div><div><dt>Colors</dt><dd>{pattern.colors.length}</dd></div><div><dt>Total beads</dt><dd>{pattern.totalBeads.toLocaleString("en-US")}</dd></div><div><dt>Difficulty</dt><dd>{pattern.difficulty}</dd></div><div><dt>Finished size</dt><dd>{pattern.estimatedSize}</dd></div></dl></section>
          <section className="download-panel"><h2>Download pattern</h2><p>{liveDownloads ? "Download the free JPG pattern to keep nearby while building." : "This free JPG pattern will be added with the final artwork."}</p><div className="download-actions">{liveDownloads ? <MosaicDownloadButton href={pattern.downloadImage} filename={`${pattern.slug}-pattern.jpg`} /> : <span className="download-button" aria-disabled="true">Download unavailable</span>}</div><p className={styles.personalUse}>Free for personal craft use.</p></section>
          <section className="color-panel"><p className="eyebrow">Build note</p><p className="detail-deck">Counts are a planning guide. Keep a small reserve of each shade for substitutions and repairs.</p></section>
        </aside>
      </div>
      <section className="color-guide-section"><p className="eyebrow">Palette</p><h2>Color guide</h2><div className="color-grid">{pattern.colors.map((color) => <div className="color-chip" key={`${color.code}-${color.hex}`}><i style={{ backgroundColor: color.hex }} /><span><strong>{color.name ? `${color.code} · ${color.name}` : color.code}</strong><small>{color.hex}</small></span><span>{color.beads} beads</span></div>)}</div></section>
      {pattern.rightsStatus === "fan-made" ? <p className={styles.rightsNote}>Unofficial fan-made pattern. Not affiliated with or endorsed by the respective rights holder.</p> : null}
      <section className="related-section"><p className="eyebrow">Keep exploring</p><h2>Related patterns</h2><div className="pattern-grid">{related.map((item) => <PatternCard pattern={item} key={item.slug} />)}</div></section>
    </article>
  );
}
