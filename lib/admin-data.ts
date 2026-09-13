import { getFuseMosaicEnv } from "@/lib/cloudflare";

export type PatternStatus = "draft" | "published" | "hidden" | "removed";
export type RightsStatus = "review" | "approved" | "blocked";
export type ContentRightsStatus = "original" | "public-domain" | "fan-made" | "licensed" | "review";
export type CategoryStatus = "active" | "hidden";

export type PatternRecord = {
  id: string; slug: string; title: string; description: string; category_id: string | null;
  preview_url: string | null; download_url: string | null; original_url: string | null;
  grid_width: number | null; grid_height: number | null; colors: string; total_beads: number | null;
  difficulty: string | null; estimated_size: string | null; status: PatternStatus; rights_status: RightsStatus;
  content_rights_status: ContentRightsStatus | null; franchise: string | null; rights_note: string | null;
  featured: number; published_at: string | null; created_at: string; updated_at: string; removed_at: string | null;
  seo_title: string | null; seo_description: string | null; category_name?: string | null; category_slug?: string | null;
};
export type CategoryRecord = { id: string; name: string; slug: string; description: string; status: CategoryStatus; sort_order: number; created_at: string; updated_at: string; pattern_count?: number };

export function db() {
  const database = getFuseMosaicEnv().PATTERNS_DB;
  if (!database) throw new Error("PATTERNS_DB binding is not configured");
  return database;
}

export async function listAdminPatterns(filters: { q?: string; category?: string; status?: string; rights?: string } = {}) {
  const where: string[] = []; const values: string[] = [];
  if (filters.q) { where.push("(p.title LIKE ? OR p.slug LIKE ?)"); values.push(`%${filters.q}%`, `%${filters.q}%`); }
  if (filters.category) { where.push("c.slug = ?"); values.push(filters.category); }
  if (filters.status) { where.push("p.status = ?"); values.push(filters.status); }
  if (filters.rights) { where.push("p.rights_status = ?"); values.push(filters.rights); }
  const query = `SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM patterns p LEFT JOIN categories c ON c.id=p.category_id ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY p.updated_at DESC`;
  return (await db().prepare(query).bind(...values).all<PatternRecord>()).results;
}

export async function getAdminPattern(id: string) { return db().prepare("SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM patterns p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=?").bind(id).first<PatternRecord>(); }
export async function listCategories(includeHidden = true) {
  const query = `SELECT c.*, COUNT(p.id) AS pattern_count FROM categories c LEFT JOIN patterns p ON p.category_id=c.id ${includeHidden ? "" : "WHERE c.status='active'"} GROUP BY c.id ORDER BY c.sort_order, c.name`;
  return (await db().prepare(query).all<CategoryRecord>()).results;
}
export async function audit(entityType: string, entityId: string, action: string, detail: Record<string, unknown> = {}) {
  await db().prepare("INSERT INTO audit_log (id, entity_type, entity_id, action, detail) VALUES (?, ?, ?, ?, ?)").bind(crypto.randomUUID(), entityType, entityId, action, JSON.stringify(detail)).run();
}
export async function dashboardCounts() {
  const result = await db().prepare("SELECT status, COUNT(*) AS count FROM patterns GROUP BY status").all<{ status: PatternStatus; count: number }>();
  const counts = Object.fromEntries(result.results.map((item) => [item.status, item.count])) as Partial<Record<PatternStatus, number>>;
  const review = await db().prepare("SELECT COUNT(*) AS count FROM patterns WHERE rights_status='review'").first<{ count: number }>();
  return { total: Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0), draft: counts.draft ?? 0, published: counts.published ?? 0, hidden: counts.hidden ?? 0, removed: counts.removed ?? 0, review: review?.count ?? 0 };
}
