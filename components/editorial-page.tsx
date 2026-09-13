import { PageIntro } from "./page-intro";
import styles from "./editorial-page.module.css";

export function EditorialPage({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: React.ReactNode }) {
  return <article className="editorial-page"><PageIntro eyebrow={eyebrow} title={title} copy={copy} /><div className={`editorial-body shell ${styles.body}`}>{children}</div></article>;
}
