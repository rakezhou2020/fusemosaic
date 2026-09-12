import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { PatternCard } from "@/components/pattern-card";
import { PatternVisual } from "@/components/pattern-visual";
import { publicCategories, publicPatterns } from "@/lib/public-patterns";

const homeJsonLd = {
  "@context": "https://schema.org", "@type": "WebSite", name: "FuseMosaic", url: "https://fusemosaic.com",
  description: "Free printable fuse bead patterns and mosaic art.",
  potentialAction: { "@type": "SearchAction", target: "https://fusemosaic.com/patterns?q={search_term_string}", "query-input": "required name=search_term_string" },
};

export default async function Home() {
  const [categories, patterns] = await Promise.all([publicCategories(), publicPatterns()]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <section className="hero shell">
        <div className="hero-copy paper-panel">
          <div className="hero-corner"><BrandMark /></div>
          <p className="eyebrow">Free printable pattern library</p>
          <h1>Small beads.<br /><em>Endless pictures.</em></h1>
          <p className="hero-lede">Find clear, printable fuse bead patterns for slow afternoons, ambitious builds, and every mosaic in between.</p>
          <form action="/patterns" className="hero-search">
            <label className="sr-only" htmlFor="hero-q">Search the pattern library</label>
            <input id="hero-q" type="search" name="q" placeholder="Try cupcake, dragon, flower…" />
            <button type="submit">Search library <span aria-hidden="true">→</span></button>
          </form>
          <div className="hero-notes" aria-label="Library features">
            <span><b>500+</b> patterns planned</span><span><b>JPG</b> quick reference</span><span><b>Free</b> to download</span>
          </div>
        </div>
        <div className="hero-board" aria-label="Featured dinosaur fuse bead artwork">
          <div className="board-top"><span>Featured make / 001</span><span>Explore collection</span></div>
          <Link href="#chinese" className="board-canvas board-canvas--featured" aria-label="Jump to the Chinese Collection">
            <img src="/images/featured-dinosaur-fuse-beads.webp" alt="Colorful dinosaur fuse bead artwork on a work table" />
          </Link>
          <div className="board-caption"><div><span>Featured make</span><strong>Discover the collection</strong></div><Link href="#chinese">Chinese Collection <span aria-hidden="true">↓</span></Link></div>
        </div>
      </section>

      <section className="feature-strip" aria-label="FuseMosaic features"><div className="shell feature-strip__inner"><strong>Free pattern archive</strong><span>Printable JPG files</span><span>No sign-up</span><span>Free downloads</span><span>Built for makers</span></div></section>

      <section className="category-section shell" id="categories">
        <div className="section-heading"><div><p className="eyebrow">Browse by subject</p><h2>A wall of possibilities.</h2></div><p>Every collection has its own rhythm—compact weekend pieces, sweeping creatures, and graphic motifs made one bead at a time.</p></div>
        <div className="mosaic-wall">
          {categories.map((category, index) => (
            <Link className={`category-tile category-tile--${category.size}`} href={`/categories/${category.slug}`} key={category.slug}>
              <PatternVisual art={category.art} label={`${category.name} pattern collection`} />
              <div className="category-label"><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{category.name}</strong><small>{category.count} patterns</small></div></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pattern-gallery-section" id="free-patterns"><div className="shell">
        <div className="section-heading section-heading--gallery"><div><p className="eyebrow">Free downloads</p><h2>Choose your next build.</h2></div><Link className="text-link" href="/patterns">View all patterns <span aria-hidden="true">→</span></Link></div>
        <div className="pattern-grid">{patterns.slice(0, 8).map((pattern) => <PatternCard pattern={pattern} key={pattern.slug} />)}</div>
      </div></section>

      <section className="chinese-feature shell" id="chinese">
        <div className="chinese-copy"><p className="eyebrow eyebrow--gold">Archive focus / East Asian forms</p><h2>Tradition,<br />translated into tiles.</h2><p>Dragons, phoenixes, mythical beasts, ancient characters and enduring motifs—redrawn for the measured language of fuse beads.</p><Link className="light-button" href="/chinese">Enter the collection <span aria-hidden="true">→</span></Link></div>
        <div className="chinese-mosaic">
          {patterns.filter((pattern) => ["dragon", "phoenix", "lantern"].includes(pattern.art)).slice(0, 3).map((pattern, index) => (
            <Link href={`/patterns/${pattern.slug}`} className={`chinese-art chinese-art--${index + 1}`} key={pattern.slug}><PatternVisual art={pattern.art} label={pattern.title} /><span>{pattern.title.replace(" Pattern", "")}</span></Link>
          ))}
        </div>
      </section>

      <section className="premium-section shell" id="premium">
        <div className="premium-pixels" aria-hidden="true">{Array.from({ length: 35 }, (_, index) => <i key={index} />)}</div>
        <div><p className="eyebrow">Coming later</p><h2>Large art for bigger walls.</h2><p>Collector patterns, ambitious grids, and finished mosaic wall art are taking shape in the studio.</p></div><span className="coming-badge">Coming soon</span>
      </section>
    </>
  );
}
