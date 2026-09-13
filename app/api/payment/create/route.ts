import { db } from "@/lib/admin-data";
import { PREMIUM_CURRENCY, PREMIUM_PRICE, createProviderPayment, makePurchaseToken, purchaseCookie, readCookie, sameOrigin, sha256, PURCHASE_COOKIE } from "@/lib/payments";

type PaidPattern = { id: string; slug: string; title: string };

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const body = await request.json().catch(() => null) as { patternId?: unknown; slug?: unknown } | null;
  const patternId = typeof body?.patternId === "string" ? body.patternId.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!patternId && !slug) return Response.json({ error: "A premium pattern is required" }, { status: 400 });

  const pattern = await db().prepare(
    "SELECT id, slug, title FROM patterns WHERE (id=? OR slug=?) AND access_type='paid' AND status='published' AND rights_status='approved' LIMIT 1",
  ).bind(patternId, slug).first<PaidPattern>();
  if (!pattern || (patternId && pattern.id !== patternId) || (slug && pattern.slug !== slug)) return Response.json({ error: "Premium pattern not found" }, { status: 404 });

  const token = readCookie(request, PURCHASE_COOKIE) ?? makePurchaseToken();
  const accessTokenHash = await sha256(token);
  const orderId = crypto.randomUUID();
  await db().prepare(
    "INSERT INTO payment_orders (id, pattern_id, pattern_slug, amount, currency, payment_status, access_token_hash) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
  ).bind(orderId, pattern.id, pattern.slug, PREMIUM_PRICE, PREMIUM_CURRENCY, accessTokenHash).run();

  try {
    const payment = await createProviderPayment(orderId);
    if (!payment.paymentId || !payment.checkoutUrl) throw new Error("Payment provider returned an incomplete checkout");
    await db().prepare("UPDATE payment_orders SET payment_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(payment.paymentId, orderId).run();
    return Response.json(
      { payment_id: payment.paymentId, checkout_url: payment.checkoutUrl, amount: PREMIUM_PRICE, currency: PREMIUM_CURRENCY },
      { headers: { "Set-Cookie": purchaseCookie(token), "Cache-Control": "no-store" } },
    );
  } catch {
    await db().prepare("UPDATE payment_orders SET payment_status='failed', updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(orderId).run();
    return Response.json({ error: "Unable to start checkout" }, { status: 502 });
  }
}
