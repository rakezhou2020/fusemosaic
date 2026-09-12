import { audit, db } from "@/lib/admin-data";
import { requireAdminRequest } from "@/lib/admin-auth";
export async function POST(request: Request) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { ids?: unknown; action?: unknown; category_id?: unknown } | null; const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is string => typeof id === "string").slice(0, 100) : [];
  if (!ids.length || typeof body?.action !== "string") return Response.json({ error: "Invalid batch request" }, { status: 400 });
  const actions: Record<string, string> = { publish: "status='published', published_at=CURRENT_TIMESTAMP", hide: "status='hidden'", remove: "status='removed', removed_at=CURRENT_TIMESTAMP", approve_rights: "rights_status='approved'" };
  const update = body.action === "change_category" && typeof body.category_id === "string" ? "category_id=?" : actions[body.action]; if (!update) return Response.json({ error: "Unsupported action" }, { status: 400 });
  const marks = ids.map(() => "?").join(","); const args = body.action === "change_category" && typeof body.category_id === "string" ? [body.category_id, ...ids] : ids;
  if (body.action === "publish") await db().prepare(`UPDATE patterns SET ${update}, updated_at=CURRENT_TIMESTAMP WHERE id IN (${marks}) AND rights_status='approved'`).bind(...args).run(); else await db().prepare(`UPDATE patterns SET ${update}, updated_at=CURRENT_TIMESTAMP WHERE id IN (${marks})`).bind(...args).run();
  await Promise.all(ids.map((id) => audit("pattern", id, `batch:${body.action}`))); return Response.json({ ok: true });
}
