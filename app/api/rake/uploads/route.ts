import { audit, db } from "@/lib/admin-data";
import { requireAdminRequest } from "@/lib/admin-auth";
import { getFuseMosaicEnv } from "@/lib/cloudflare";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const maxBytes = 20 * 1024 * 1024;
const slugify = (value: string) => value.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "untitled-pattern";
type ColourAnalysis = { gridWidth: number; gridHeight: number; colors: { code: string; hex: string; beads: number }[]; totalBeads: number };
function colourAnalysis(value: FormDataEntryValue | undefined): ColourAnalysis | null {
  if (typeof value !== "string") return null; try { const parsed = JSON.parse(value) as ColourAnalysis; const valid = Number.isInteger(parsed.gridWidth) && parsed.gridWidth > 0 && Number.isInteger(parsed.gridHeight) && parsed.gridHeight > 0 && Array.isArray(parsed.colors) && parsed.colors.length > 0 && parsed.colors.every((color) => typeof color.code === "string" && /^[A-Z][0-9]+$/.test(color.code) && typeof color.hex === "string" && /^#[0-9A-F]{6}$/i.test(color.hex) && Number.isInteger(color.beads) && color.beads > 0); const total = valid ? parsed.colors.reduce((sum, color) => sum + color.beads, 0) : 0; return valid && total === parsed.totalBeads && total === parsed.gridWidth * parsed.gridHeight ? { ...parsed, totalBeads: total } : null; } catch { return null; }
}

async function transformed(source: ArrayBuffer, width: number, height: number, format: "image/webp" | "image/jpeg", quality: number) {
  const images = getFuseMosaicEnv().IMAGES; if (!images) throw new Error("IMAGES binding is not configured");
  const result = await images.input(new Blob([source]).stream()).transform({ width, height, fit: "contain", background: "#ffffff" }).output({ format, quality, anim: false });
  const response = result.response(); if (!response.ok || !response.body) throw new Error("Image transformation failed"); return response;
}

export async function POST(request: Request) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData(); const files = form.getAll("files").filter((value): value is File => value instanceof File); const analyses = form.getAll("color_analysis").map((value) => colourAnalysis(value));
  if (!files.length || files.length > 20) return Response.json({ error: "Upload 1–20 image files" }, { status: 400 });
  const { PATTERNS_BUCKET: bucket, IMAGES: images } = getFuseMosaicEnv(); if (!bucket || !images) return Response.json({ error: "R2 and Images bindings must be configured" }, { status: 503 });
  const results: { id: string; slug: string; title: string }[] = [];
  for (const [index, file] of files.entries()) {
    const extension = allowed.get(file.type); if (!extension || file.size === 0 || file.size > maxBytes) return Response.json({ error: `${file.name}: only JPG, PNG or WebP files up to 20 MB are allowed` }, { status: 400 });
    const id = crypto.randomUUID(); const slug = slugify(file.name); const suffix = crypto.randomUUID().slice(0, 6); const uniqueSlug = `${slug}-${suffix}`; const base = `patterns/${id}`; const original = await file.arrayBuffer();
    try {
      const preview = await transformed(original, 1200, 1500, "image/webp", 80); const download = await transformed(original, 1600, 2000, "image/jpeg", 90);
      await Promise.all([
        bucket.put(`${base}/original.${extension}`, original, { httpMetadata: { contentType: file.type } }),
        bucket.put(`${base}/preview.webp`, preview.body, { httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" } }),
        bucket.put(`${base}/pattern.jpg`, download.body, { httpMetadata: { contentType: "image/jpeg", cacheControl: "public, max-age=31536000, immutable" } }),
      ]);
      const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const analysis = analyses[index]; await db().prepare("INSERT INTO patterns (id, slug, title, preview_url, download_url, original_url, grid_width, grid_height, colors, total_beads, status, rights_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'review')").bind(id, uniqueSlug, title, `/api/media/${id}/preview`, `/api/media/${id}/download`, `/api/media/${id}/original`, analysis?.gridWidth ?? null, analysis?.gridHeight ?? null, analysis ? JSON.stringify(analysis.colors) : "[]", analysis?.totalBeads ?? null).run();
      await audit("pattern", id, "uploaded", { filename: file.name, colorsAnalysed: Boolean(analysis) }); results.push({ id, slug: uniqueSlug, title });
    } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Upload processing failed" }, { status: 500 }); }
  }
  return Response.json({ patterns: results }, { status: 201 });
}
