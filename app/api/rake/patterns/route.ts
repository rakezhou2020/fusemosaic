import { audit, db, listAdminPatterns } from "@/lib/admin-data";
import { requireAdminRequest } from "@/lib/admin-auth";

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);

export async function GET(request: Request) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url); return Response.json(await listAdminPatterns({ q: url.searchParams.get("q") ?? undefined, category: url.searchParams.get("category") ?? undefined, status: url.searchParams.get("status") ?? undefined, rights: url.searchParams.get("rights") ?? undefined }));
}

export async function POST(request: Request) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { title?: unknown; slug?: unknown; categoryId?: unknown } | null;
  if (!body || typeof body.title !== "string" || body.title.trim().length < 1 || body.title.length > 180) return Response.json({ error: "A title is required" }, { status: 400 });
  const slug = slugify(typeof body.slug === "string" && body.slug ? body.slug : body.title); if (!slug) return Response.json({ error: "Invalid slug" }, { status: 400 });
  const id = crypto.randomUUID();
  try { await db().prepare("INSERT INTO patterns (id, slug, title, category_id) VALUES (?, ?, ?, ?)").bind(id, slug, body.title.trim(), typeof body.categoryId === "string" ? body.categoryId : null).run(); }
  catch { return Response.json({ error: "Slug already exists" }, { status: 409 }); }
  await audit("pattern", id, "created"); return Response.json({ id, slug }, { status: 201 });
}
