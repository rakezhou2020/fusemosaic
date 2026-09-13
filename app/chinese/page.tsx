import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { PatternCard } from "@/components/pattern-card";
import { publicChineseCollection } from "@/lib/public-patterns";

export const metadata: Metadata = { title: "Chinese Collection | Premium Fuse Bead Patterns", description: "Premium original fuse bead patterns inspired by Chinese myth, decorative forms, and traditional imagery.", alternates: { canonical: "/chinese" } };
export default async function ChinesePage() { const collection = await publicChineseCollection(); return <><PageIntro eyebrow="Premium collection" title="Chinese forms, rebuilt bead by bead." copy="Original premium patterns inspired by mythic beasts, traditional motifs, and historic decorative forms." /><section className="listing-section shell">{collection.length ? <div className="pattern-grid">{collection.map((pattern) => <PatternCard pattern={pattern} key={pattern.slug} />)}</div> : <div className="empty-state"><h2>The collection is being prepared.</h2><p>New original patterns will appear here as they are released.</p></div>}</section></>; }
