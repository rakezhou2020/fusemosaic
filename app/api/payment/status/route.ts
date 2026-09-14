import { db } from "@/lib/admin-data";
import { PURCHASE_COOKIE, type PaymentOrder, readCookie, sha256, syncOrderFromProvider } from "@/lib/payments";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const paymentId = query.get("payment_id")?.trim();
  const slug = query.get("slug")?.trim().toLowerCase();
  const latest = query.get("latest") === "1";
  if ((!paymentId && !slug && !latest) || Number(Boolean(paymentId)) + Number(Boolean(slug)) + Number(latest) !== 1 || (paymentId && paymentId.length > 200) || (slug && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160))) {
    return Response.json({ error: "A valid payment ID, pattern slug, or latest purchase is required" }, { status: 400 });
  }
  const token = readCookie(request, PURCHASE_COOKIE);
  if (!token) return Response.json({ error: "Purchase session not found" }, { status: 401 });
  const accessTokenHash = await sha256(token);
  const order = paymentId
    ? await db().prepare("SELECT id, pattern_id, pattern_slug, payment_id, amount, currency, payment_status, access_token_hash, paid_at FROM payment_orders WHERE payment_id=? AND access_token_hash=? LIMIT 1").bind(paymentId, accessTokenHash).first<PaymentOrder>()
    : slug
      ? await db().prepare("SELECT id, pattern_id, pattern_slug, payment_id, amount, currency, payment_status, access_token_hash, paid_at FROM payment_orders WHERE pattern_slug=? AND access_token_hash=? ORDER BY updated_at DESC LIMIT 1").bind(slug, accessTokenHash).first<PaymentOrder>()
      : await db().prepare("SELECT id, pattern_id, pattern_slug, payment_id, amount, currency, payment_status, access_token_hash, paid_at FROM payment_orders WHERE access_token_hash=? ORDER BY updated_at DESC LIMIT 1").bind(accessTokenHash).first<PaymentOrder>();
  if (!order) return Response.json({ error: "Payment not found" }, { status: 404 });
  let status = order.payment_status;
  try { status = await syncOrderFromProvider(db(), order); } catch { /* Keep the last known local status while the provider is unavailable. */ }
  return Response.json({ status, slug: order.pattern_slug }, { headers: { "Cache-Control": "no-store" } });
}
