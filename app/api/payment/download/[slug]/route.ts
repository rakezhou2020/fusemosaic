import { db } from "@/lib/admin-data";
import { getFuseMosaicEnv } from "@/lib/cloudflare";
import { PURCHASE_COOKIE, type PaymentOrder, readCookie, sha256 } from "@/lib/payments";

export async function GET(request: Request, context: RouteContext<"/api/payment/download/[slug]">) {
  const { slug } = await context.params;
  const token = readCookie(request, PURCHASE_COOKIE);
  if (!token) return new Response("Purchase access is required", { status: 401 });
  const accessTokenHash = await sha256(token);
  const order = await db().prepare(
    "SELECT id, pattern_id, pattern_slug, payment_id, amount, currency, payment_status, access_token_hash, paid_at FROM payment_orders WHERE pattern_slug=? AND access_token_hash=? AND payment_status='paid' ORDER BY paid_at DESC LIMIT 1",
  ).bind(slug, accessTokenHash).first<PaymentOrder>();
  if (!order) return new Response("Purchase access is required", { status: 403 });
  const pattern = await db().prepare("SELECT id, slug FROM patterns WHERE id=? AND slug=? AND access_type='paid' AND status='published' AND rights_status='approved' LIMIT 1").bind(order.pattern_id, slug).first<{ id: string; slug: string }>();
  if (!pattern) return new Response("Not found", { status: 404 });
  const object = await getFuseMosaicEnv().PATTERNS_BUCKET?.get(`premium/${pattern.id}/build-guide.pdf`);
  if (!object) return new Response("Premium file is not available", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `attachment; filename="${pattern.slug}-fuse-bead-pattern.pdf"`);
  headers.set("Cache-Control", "private, no-store");
  return new Response(object.body, { headers });
}
