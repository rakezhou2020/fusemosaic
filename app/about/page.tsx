import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "About FuseMosaic | Free Fuse Bead & Perler Bead Patterns",
  description: "Learn about FuseMosaic, a growing library of free fuse bead patterns, printable Perler bead designs, pixel art templates, JPG downloads, and color guides for mosaic makers.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <EditorialPage
      eyebrow="About FuseMosaic"
      title="A clearer home for mosaic makers."
      copy="FuseMosaic is a growing library of free fuse bead patterns, printable bead designs, pixel-art templates, and color guides made for people who enjoy building with small tiles, beads, and grid-based designs."
    >
      <p>Our goal is simple: make patterns easier to find, easier to understand, and easier to use.</p>
      <p>Whether you are working with Perler beads, Hama beads, or other compatible fuse beads, FuseMosaic gives you a clean place to browse designs, preview colors, and download patterns you can keep beside you while building.</p>

      <h2>What you can find here</h2>
      <p>Every pattern on FuseMosaic is designed to be practical. Depending on the design, you may find:</p>
      <ul>
        <li>printable JPG patterns</li>
        <li>downloadable pattern files</li>
        <li>clear grid previews</li>
        <li>color guides and bead references</li>
        <li>pixel-art layouts</li>
        <li>patterns for different sizes and difficulty levels</li>
      </ul>
      <p>The library includes a mix of animals, fantasy creatures, flowers, food, decorative designs, cultural themes, and other mosaic-friendly subjects. We are also continuing to expand themed collections so it is easier to discover related designs without searching through one large archive.</p>

      <h2>Why FuseMosaic exists</h2>
      <p>A lot of fuse bead inspiration is scattered across social platforms, screenshots, videos, old image boards, and unorganized pattern collections. That can make a simple project harder than it needs to be.</p>
      <p>Sometimes the image is too small. Sometimes there is no color guide. Sometimes the grid is unclear. Sometimes a design looks good on screen but is difficult to recreate in real life.</p>
      <p>FuseMosaic was created to make that process simpler. We want each pattern page to give makers the information they actually need: a clear preview, an understandable layout, useful color references, and an easy way to save or print the design.</p>

      <h2>Original patterns and free resources</h2>
      <p>FuseMosaic includes original designs created specifically for the site, alongside carefully prepared <Link href="/patterns">pattern resources</Link>.</p>
      <p>Our original patterns are built with clarity in mind. We try to keep shapes readable, color areas distinct, and the final grid practical for real bead projects rather than simply producing decorative pixel art.</p>
      <p>Free patterns are an important part of FuseMosaic. You should be able to discover a design, understand how it is built, and download a useful reference without unnecessary friction.</p>
      <p>As the collection grows, we will continue adding more <Link href="/patterns">free fuse bead patterns</Link>, printable pattern grids, JPG downloads, and color references.</p>

      <h2>Made for beginners and experienced makers</h2>
      <p>Some people are building their first small fuse bead project. Others are creating large wall pieces, framed pixel art, gifts, or detailed mosaic designs.</p>
      <p>FuseMosaic is intended for both. Simpler designs can help beginners understand grids, color placement, and basic construction. Larger patterns give more experienced makers something more detailed to work on.</p>
      <p>Over time, we plan to make it easier to browse patterns by size, subject, complexity, and <Link href="/categories">category</Link>.</p>

      <h2>More than a pattern archive</h2>
      <p>FuseMosaic is not meant to become a giant folder of disconnected images. The long-term goal is to build a well-organized pattern library where every design is easier to browse, understand, download, and build.</p>
      <p>That includes improving pattern previews, creating stronger <Link href="/categories">themed collections</Link>, adding more original artwork, and developing better tools for makers.</p>
      <p>We may also introduce larger premium pattern packs and more detailed decorative projects in the future, while continuing to keep a useful free library available.</p>

      <h2>Keep building</h2>
      <p>If you enjoy fuse beads, Perler-style bead art, pixel mosaics, or grid-based crafts, we hope FuseMosaic becomes a useful place to return to whenever you are looking for your next project.</p>
      <p><Link href="/patterns">Browse the pattern library</Link>, explore a <Link href="/categories">collection</Link>, download a design, and start building.</p>
    </EditorialPage>
  );
}
