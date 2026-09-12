import { audit, db, listCategories } from "@/lib/admin-data";
import { requireAdminRequest } from "@/lib/admin-auth";
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);
export async function GET(request: Request) { if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 }); return Response.json(await listCategories()); }
export async function POST(request: Request) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 }); const body = await request.json().catch(() => null) as { name?: unknown; slug?: unknown; description?: unknown; sort_order?: unknown } | null;
  if (!body || typeof body.name !== "string" || !body.name.trim()) return Response.json({ error: "A name is required" }, { status: 400 }); const id = crypto.randomUUID(); const slug = slugify(typeof body.slug === "string" ? body.slug : body.name); if (!slug) return Response.json({ error: "Invalid slug" }, { status: 400 });
  try { await db().prepare("INSERT INTO categories (id, name, slug, description, sort_order) VALUES (?, ?, ?, ?, ?)").bind(id, body.name.trim().slice(0, 100), slug, typeof body.description === "string" ? body.description.slice(0, 1000) : "", typeof body.sort_order === "number" ? Math.trunc(body.sort_order) : 0).run(); } catch { return Response.json({ error: "Slug already exists" }, { status: 409 }); }
  await audit("category", id, "created"); return Response.json({ id, slug }, { status: 201 });
}
