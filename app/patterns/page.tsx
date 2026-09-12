import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { PatternCard } from "@/components/pattern-card";
import { publicPatterns } from "@/lib/public-patterns";

export const metadata: Metadata = { title: "Free Fuse Bead Patterns", description: "Browse free printable fuse bead and Perler bead patterns with JPG and PDF downloads.", alternates: { canonical: "/patterns" } };

export default async function PatternsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase() ?? "";
  const filtered = await publicPatterns(query);
  return (
    <>
      <PageIntro eyebrow="The free archive" title={query ? `Results for “${query}”` : "Printable patterns, ready when you are."} copy="Browse approachable miniatures and detailed statement pieces. Every published design includes a clear reference image and a printable pattern document." />
      <section className="listing-section shell">
        <div className="filter-bar"><form action="/patterns"><label className="sr-only" htmlFor="pattern-q">Search all patterns</label><input id="pattern-q" name="q" type="search" defaultValue={query} placeholder="Search title, category or difficulty" /><button type="submit">Search</button></form><span>{filtered.length} {filtered.length === 1 ? "pattern" : "patterns"}</span></div>
        {filtered.length ? <div className="pattern-grid">{filtered.map((pattern) => <PatternCard pattern={pattern} key={pattern.slug} />)}</div> : <div className="empty-state"><h2>No tiles match that search.</h2><p>Try a broader word such as dragon, animal, flower or easy.</p><Link className="text-link" href="/patterns">Clear search</Link></div>}
      </section>
    </>
  );
}
