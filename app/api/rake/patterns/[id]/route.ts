import { audit, db, getAdminPattern } from "@/lib/admin-data";
import { requireAdminRequest } from "@/lib/admin-auth";

const statuses = new Set(["draft", "published", "hidden", "removed"]); const rights = new Set(["review", "approved", "blocked"]);
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : null;
const integer = (value: unknown) => typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;

export async function GET(request: Request, context: RouteContext<"/api/rake/patterns/[id]">) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const record = await getAdminPattern((await context.params).id); return record ? Response.json(record) : Response.json({ error: "Not found" }, { status: 404 });
}
export async function PATCH(request: Request, context: RouteContext<"/api/rake/patterns/[id]">) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id; const body = await request.json().catch(() => null) as Record<string, unknown> | null; if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });
  const status = typeof body.status === "string" && statuses.has(body.status) ? body.status : null; const rightsStatus = typeof body.rights_status === "string" && rights.has(body.rights_status) ? body.rights_status : null;
  if (status === "published" && rightsStatus !== "approved") { const existing = await getAdminPattern(id); if ((rightsStatus ?? existing?.rights_status) !== "approved") return Response.json({ error: "Only approved rights can be published" }, { status: 400 }); }
  const fields: [string, unknown][] = [["title", text(body.title, 180)], ["slug", text(body.slug, 96)?.toLowerCase().replace(/[^a-z0-9-]/g, "")], ["description", text(body.description, 5000)], ["category_id", text(body.category_id, 100)], ["grid_width", integer(body.grid_width)], ["grid_height", integer(body.grid_height)], ["colors", typeof body.colors === "string" && body.colors.length <= 12000 ? body.colors : null], ["total_beads", integer(body.total_beads)], ["difficulty", text(body.difficulty, 48)], ["estimated_size", text(body.estimated_size, 120)], ["seo_title", text(body.seo_title, 180)], ["seo_description", text(body.seo_description, 320)]];
  if (status) fields.push(["status", status], ["published_at", status === "published" ? new Date().toISOString() : null], ["removed_at", status === "removed" ? new Date().toISOString() : null]); if (rightsStatus) fields.push(["rights_status", rightsStatus]); if (typeof body.featured === "boolean") fields.push(["featured", body.featured ? 1 : 0]);
  const updates = fields.filter(([, value]) => value !== null); if (!updates.length) return Response.json({ error: "No valid changes" }, { status: 400 });
  try { await db().prepare(`UPDATE patterns SET ${updates.map(([name]) => `${name}=?`).join(", ")}, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...updates.map(([, value]) => value), id).run(); } catch { return Response.json({ error: "Invalid or duplicate slug" }, { status: 400 }); }
  await audit("pattern", id, "updated", body); return Response.json(await getAdminPattern(id));
}
