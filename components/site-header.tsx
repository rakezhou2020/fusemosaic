import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { HeaderCart } from "./header-cart";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-shell">
        <Link className="brand" href="/" aria-label="FuseMosaic home"><BrandMark /><span>FuseMosaic</span></Link>
        <nav aria-label="Primary navigation">
          <Link href="/patterns">Free Patterns</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/chinese">Chinese Collection</Link>
          <Link href="/#premium">Premium</Link>
        </nav>
        <div className="header-tools">
          <form action="/patterns" className="header-search">
            <label className="sr-only" htmlFor="header-q">Search patterns</label>
            <input id="header-q" name="q" type="search" placeholder="Search patterns" />
            <button aria-label="Submit search" type="submit"><span aria-hidden="true">↗</span></button>
          </form>
          <HeaderCart />
        </div>
      </div>
    </header>
  );
}
