import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { PatternCard } from "@/components/pattern-card";
import { publicPatterns } from "@/lib/public-patterns";

export const metadata: Metadata = { title: "Chinese Inspired Fuse Bead Patterns", description: "Explore Chinese dragons, phoenixes, mythical beasts, traditional motifs and character-inspired fuse bead art.", alternates: { canonical: "/chinese" } };
export default async function ChinesePage() { const collection = (await publicPatterns()).filter((pattern) => pattern.categorySlug === "chinese-style"); return <><PageIntro eyebrow="Special collection" title="Chinese forms, rebuilt bead by bead." copy="A growing editorial collection inspired by dragons, phoenixes, mythical beasts, traditional motifs and historic decorative forms." /><section className="listing-section shell"><div className="pattern-grid">{collection.map((pattern) => <PatternCard pattern={pattern} key={pattern.slug} />)}</div></section></>; }
