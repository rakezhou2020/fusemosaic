import { audit, db } from "@/lib/admin-data";
import { requireAdminRequest } from "@/lib/admin-auth";
export async function PATCH(request: Request, context: RouteContext<"/api/rake/categories/[id]">) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 }); const body = await request.json().catch(() => null) as Record<string, unknown> | null; if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 }); const id = (await context.params).id;
  const fields: [string, unknown][] = []; if (typeof body.name === "string") fields.push(["name", body.name.trim().slice(0, 100)]); if (typeof body.description === "string") fields.push(["description", body.description.slice(0, 1000)]); if (body.status === "active" || body.status === "hidden") fields.push(["status", body.status]); if (typeof body.sort_order === "number") fields.push(["sort_order", Math.trunc(body.sort_order)]);
  if (!fields.length) return Response.json({ error: "No valid changes" }, { status: 400 }); await db().prepare(`UPDATE categories SET ${fields.map(([name]) => `${name}=?`).join(", ")}, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(...fields.map(([, value]) => value), id).run(); await audit("category", id, "updated", body); return Response.json({ ok: true });
}
