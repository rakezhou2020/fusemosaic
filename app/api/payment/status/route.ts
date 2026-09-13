import { db } from "@/lib/admin-data";
import { PURCHASE_COOKIE, type PaymentOrder, readCookie, sha256, syncOrderFromProvider } from "@/lib/payments";

export async function GET(request: Request) {
  const paymentId = new URL(request.url).searchParams.get("payment_id")?.trim();
  if (!paymentId || paymentId.length > 200) return Response.json({ error: "Payment ID is required" }, { status: 400 });
  const token = readCookie(request, PURCHASE_COOKIE);
  if (!token) return Response.json({ error: "Purchase session not found" }, { status: 401 });
  const accessTokenHash = await sha256(token);
  const order = await db().prepare("SELECT id, pattern_id, pattern_slug, payment_id, amount, currency, payment_status, access_token_hash, paid_at FROM payment_orders WHERE payment_id=? AND access_token_hash=? LIMIT 1").bind(paymentId, accessTokenHash).first<PaymentOrder>();
  if (!order) return Response.json({ error: "Payment not found" }, { status: 404 });
  let status = order.payment_status;
  try { status = await syncOrderFromProvider(db(), order); } catch { /* Keep the last known local status while the provider is unavailable. */ }
  return Response.json({ status }, { headers: { "Cache-Control": "no-store" } });
}
