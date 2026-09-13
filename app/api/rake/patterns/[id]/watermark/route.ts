import { audit, getAdminPattern } from "@/lib/admin-data";
import { requireAdminRequest } from "@/lib/admin-auth";
import { getFuseMosaicEnv } from "@/lib/cloudflare";
import { createWatermarkedDownload, watermarkedDownloadKey } from "@/lib/watermark";

export async function POST(request: Request, context: RouteContext<"/api/rake/patterns/[id]/watermark">) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id;
  const pattern = await getAdminPattern(id);
  const bucket = getFuseMosaicEnv().PATTERNS_BUCKET;
  const images = getFuseMosaicEnv().IMAGES;
  if (!pattern || !bucket || !images) return Response.json({ error: "Pattern, R2, or Images binding was not found" }, { status: 404 });
  const originals = await bucket.list({ prefix: `patterns/${id}/original.` });
  const original = originals.objects[0] ? await bucket.get(originals.objects[0].key) : null;
  if (!original) return Response.json({ error: "Original image was not found" }, { status: 404 });
  try {
    const download = await createWatermarkedDownload(images, await original.arrayBuffer());
    await bucket.put(`patterns/${id}/${watermarkedDownloadKey}`, download.body, { httpMetadata: { contentType: "image/jpeg", cacheControl: "public, max-age=31536000, immutable" } });
    await audit("pattern", id, "watermark_regenerated", { key: `patterns/${id}/${watermarkedDownloadKey}` });
    return Response.json({ download_url: `/api/media/${id}/download` });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Watermark generation failed" }, { status: 500 });
  }
}
