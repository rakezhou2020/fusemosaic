import { db } from "@/lib/admin-data";
import { requireAdminRequest } from "@/lib/admin-auth";
import { getFuseMosaicEnv } from "@/lib/cloudflare";
const names: Record<string, string> = { preview: "preview.webp", download: "pattern.jpg", original: "original" };
export async function GET(request: Request, context: RouteContext<"/api/media/[id]/[kind]">) {
  const { id, kind } = await context.params; const record = await db().prepare("SELECT id, slug, status, rights_status, original_url FROM patterns WHERE id=?").bind(id).first<{ id: string; slug: string; status: string; rights_status: string; original_url: string | null }>();
  const isAdmin = await requireAdminRequest(request); const isPublic = record?.status === "published" && record.rights_status === "approved";
  if (kind === "original" && !isAdmin) return new Response("Unauthorized", { status: 401 });
  if (!record || !names[kind] || (!isPublic && !isAdmin)) return new Response("Not found", { status: 404 }); const bucket = getFuseMosaicEnv().PATTERNS_BUCKET; if (!bucket) return new Response("Not found", { status: 404 });
  let key = `patterns/${id}/${names[kind]}`; if (kind === "original") { const list = await bucket.list({ prefix: `patterns/${id}/original.` }); key = list.objects[0]?.key ?? ""; } const object = key ? await bucket.get(key) : null; if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("ETag", object.httpEtag); headers.set("Cache-Control", kind === "preview" && isPublic ? "public, max-age=86400" : "private, no-store"); if (kind === "download") headers.set("Content-Disposition", `attachment; filename=\"${record.slug}-fuse-bead-pattern.jpg\"`); return new Response(object.body, { headers });
}
