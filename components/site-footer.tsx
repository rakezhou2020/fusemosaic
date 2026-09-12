import Link from "next/link";
import { BrandMark } from "./brand-mark";

const groups = [
  { title: "Patterns", links: [["All patterns", "/patterns"], ["Easy patterns", "/patterns?q=easy"], ["Chinese collection", "/chinese"]] },
  { title: "Categories", links: [["Animals", "/categories/animals"], ["Fantasy", "/categories/fantasy"], ["Flowers", "/categories/flowers"]] },
  { title: "FuseMosaic", links: [["About", "/about"], ["Contact", "/contact"], ["Copyright & Takedown", "/copyright"], ["Privacy", "/privacy"]] },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-intro">
          <Link className="brand brand--footer" href="/"><BrandMark inverse /><span>FuseMosaic</span></Link>
          <p>Free fuse bead patterns and mosaic art for patient hands and curious makers.</p>
        </div>
        {groups.map((group) => (
          <div className="footer-column" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
          </div>
        ))}
      </div>
      <div className="shell footer-bottom"><span>© 2026 FuseMosaic</span><span>Free patterns. Clear grids. Made to print.</span></div>
    </footer>
  );
}
