import { audit, db, getAdminPattern } from "@/lib/admin-data";
import { requireAdminRequest } from "@/lib/admin-auth";

const statuses = new Set(["draft", "published", "hidden", "removed"]); const rights = new Set(["review", "approved", "blocked"]); const contentRights = new Set(["original", "public-domain", "fan-made", "licensed", "review"]);
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : null;
const integer = (value: unknown) => typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
type PatternColor = { code: string; hex: string; beads: number; name?: string };
function colorsJson(value: unknown) { if (typeof value !== "string" || value.length > 12000) return null; try { const colors = JSON.parse(value) as PatternColor[]; return Array.isArray(colors) && colors.every((color) => typeof color.code === "string" && /^[A-Z]+[0-9]*$/.test(color.code) && typeof color.hex === "string" && /^#[0-9A-F]{6}$/i.test(color.hex) && Number.isInteger(color.beads) && color.beads > 0) ? colors : null; } catch { return null; } }

export async function GET(request: Request, context: RouteContext<"/api/rake/patterns/[id]">) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const record = await getAdminPattern((await context.params).id); return record ? Response.json(record) : Response.json({ error: "Not found" }, { status: 404 });
}
export async function PATCH(request: Request, context: RouteContext<"/api/rake/patterns/[id]">) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id; const body = await request.json().catch(() => null) as Record<string, unknown> | null; if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });
  const status = typeof body.status === "string" && statuses.has(body.status) ? body.status : null; const rightsStatus = typeof body.rights_status === "string" && rights.has(body.rights_status) ? body.rights_status : null; const contentRightsStatus = typeof body.content_rights_status === "string" && contentRights.has(body.content_rights_status) ? body.content_rights_status : null;
  const existing = await getAdminPattern(id);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
  const isOriginal = (contentRightsStatus ?? existing.content_rights_status) === "original";
  const effectiveRightsStatus = isOriginal ? "approved" : (rightsStatus ?? existing.rights_status);
  if (status === "published" && effectiveRightsStatus !== "approved") return Response.json({ error: "Only approved rights can be published" }, { status: 400 });
  const colors = body.colors === undefined ? null : colorsJson(body.colors); if (body.colors !== undefined && !colors) return Response.json({ error: "Colors JSON must contain code, hex, and positive integer beads values" }, { status: 400 }); const colorTotal = colors?.reduce((sum, color) => sum + color.beads, 0) ?? null; if (colorTotal !== null && integer(body.total_beads) !== colorTotal) return Response.json({ error: "Total beads must equal the sum of Colors JSON beads" }, { status: 400 });
  const fields: [string, unknown][] = [["title", text(body.title, 180)], ["slug", text(body.slug, 96)?.toLowerCase().replace(/[^a-z0-9-]/g, "")], ["description", text(body.description, 5000)], ["category_id", text(body.category_id, 100)], ["grid_width", integer(body.grid_width)], ["grid_height", integer(body.grid_height)], ["colors", colors ? JSON.stringify(colors) : null], ["total_beads", colorTotal], ["difficulty", text(body.difficulty, 48)], ["estimated_size", text(body.estimated_size, 120)], ["seo_title", text(body.seo_title, 180)], ["seo_description", text(body.seo_description, 320)]];
  if (status) fields.push(["status", status], ["published_at", status === "published" ? new Date().toISOString() : null], ["removed_at", status === "removed" ? new Date().toISOString() : null]);
  if (isOriginal) fields.push(["rights_status", "approved"]); else if (rightsStatus) fields.push(["rights_status", rightsStatus]);
  if (contentRightsStatus) fields.push(["content_rights_status", contentRightsStatus]); if (body.franchise !== undefined) fields.push(["franchise", text(body.franchise, 180)]); if (body.rights_note !== undefined) fields.push(["rights_note", text(body.rights_note, 1000)]); if (typeof body.featured === "boolean") fields.push(["featured", body.featured ? 1 : 0]);
  const updates = fields.filter(([, value]) => value !== null); if (!updates.length) return Response.json({ error: "No valid changes" }, { status: 400 });
  try { await db().prepare(`UPDATE patterns SET ${updates.map(([name]) => `${name}=?`).join(", ")}, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...updates.map(([, value]) => value), id).run(); } catch { return Response.json({ error: "Invalid or duplicate slug" }, { status: 400 }); }
  await audit("pattern", id, "updated", body); return Response.json(await getAdminPattern(id));
}
