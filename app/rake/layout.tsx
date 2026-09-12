import Link from "next/link";
import "./rake.css";
export const dynamic = "force-dynamic";
export default function RakeLayout({ children }: { children: React.ReactNode }) { return <div className="rake"><aside className="rake-nav"><h1>FuseMosaic / Rake</h1><nav><Link href="/rake">Dashboard</Link><Link href="/rake/patterns">Patterns</Link><Link href="/rake/patterns/new">Upload</Link><Link href="/rake/categories">Categories</Link></nav></aside><main className="rake-main">{children}</main></div>; }
