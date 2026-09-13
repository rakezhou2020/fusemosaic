import Link from "next/link";
import type { Pattern } from "@/data/patterns";
import { PatternVisual } from "./pattern-visual";

export function PatternCard({ pattern }: { pattern: Pattern }) {
  return (
    <Link className="pattern-card" href={`/patterns/${pattern.slug}`}>
      <div className="pattern-card__image">
        <PatternVisual art={pattern.art} image={pattern.previewImage || undefined} label={pattern.title} />
        <span className="free-badge">{pattern.access === "paid" ? "Premium" : "Free"}</span>
      </div>
      <div className="pattern-card__body">
        <p className="pattern-card__category">{pattern.category}</p>
        <h3>{pattern.title}</h3>
        <dl className="pattern-card__meta">
          <div><dt>Grid</dt><dd>{pattern.gridWidth} × {pattern.gridHeight}</dd></div>
          <div><dt>Colors</dt><dd>{pattern.colors.length}</dd></div>
          <div><dt>Level</dt><dd>{pattern.difficulty}</dd></div>
        </dl>
      </div>
    </Link>
  );
}
