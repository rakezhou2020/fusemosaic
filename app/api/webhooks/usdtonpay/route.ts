import { db } from "@/lib/admin-data";
import { getFuseMosaicEnv } from "@/lib/cloudflare";
import { sameAmount } from "@/lib/payments";

const SIGNATURE_HEADER = "x-usdtonpay-signature";
const encoder = new TextEncoder();

type WebhookPayload = {
  event?: unknown;
  data?: {
    payment_id?: unknown;
    order_id?: unknown;
    amount?: unknown;
    currency?: unknown;
    status?: unknown;
  };
};

type PaymentOrder = {
  id: string;
  pattern_id: string;
  pattern_slug: string;
  payment_id: string;
  amount: string;
  currency: string;
  payment_status: "pending" | "paid" | "expired" | "failed";
};

function stringField(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function amountField(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  return typeof value === "number" && Number.isFinite(value) ? String(value) : null;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.byteLength !== right.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < left.byteLength; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

function base64UrlToBytes(value: string) {
  const normalized = value.startsWith("sha256=") ? value.slice("sha256=".length) : value;
  // USDTonPay sends the 32-byte HMAC digest as unpadded Base64URL after sha256=.
  if (!/^[A-Za-z0-9_-]{43}$/.test(normalized)) return null;
  const base64 = normalized.replace(/-/g, "+").replace(/_/g, "/") + "=";
  const decoded = atob(base64);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

async function validSignature(rawBody: ArrayBuffer, signature: string, secret: string) {
  const supplied = base64UrlToBytes(signature);
  if (!supplied) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, rawBody));
  return timingSafeEqual(expected, supplied);
}

export async function POST(request: Request) {
  const secret = getFuseMosaicEnv().PAYMENT_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook service is not configured" }, { status: 503 });

  const signature = request.headers.get(SIGNATURE_HEADER);
  const rawBody = await request.arrayBuffer();
  if (!signature || !(await validSignature(rawBody, signature, secret))) {
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(rawBody)) as WebhookPayload;
  } catch {
    return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  // USDTonPay only authorizes a completed payment through this event/status pair.
  const data = payload.data;
  // The configured USDTonPay webhook sends the documented confirmed value.
  if (payload.event !== "order.paid" || !data || stringField(data.status) !== "PAID") {
    return Response.json({ received: true, ignored: true });
  }

  const paymentId = stringField(data.payment_id);
  const orderId = stringField(data.order_id);
  const amount = amountField(data.amount);
  const currency = stringField(data.currency)?.toUpperCase();
  if (!paymentId || !orderId || !amount || !currency) return Response.json({ error: "Invalid webhook payload" }, { status: 400 });

  const order = await db().prepare(
    `SELECT o.id, o.pattern_id, o.pattern_slug, o.payment_id, o.amount, o.currency, o.payment_status
       FROM payment_orders o
       INNER JOIN patterns p ON p.id = o.pattern_id AND p.slug = o.pattern_slug
      WHERE o.id = ? AND o.payment_id = ? AND p.access_type = 'paid'
      LIMIT 1`,
  ).bind(orderId, paymentId).first<PaymentOrder>();

  // A signed event for another merchant/order is acknowledged but can never create access here.
  if (!order) return Response.json({ received: true, ignored: true });
  if (order.payment_status === "paid") return Response.json({ received: true, duplicate: true });
  if (order.payment_status !== "pending" || !sameAmount(amount, order.amount) || currency !== order.currency) {
    return Response.json({ received: true, ignored: true });
  }

  // Conditional update makes duplicate deliveries and concurrent retries idempotent.
  const result = await db().prepare(
    "UPDATE payment_orders SET payment_status='paid', paid_at=COALESCE(paid_at, CURRENT_TIMESTAMP), updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_id=? AND payment_status='pending'",
  ).bind(order.id, order.payment_id).run();

  return Response.json({ received: true, duplicate: (result.meta.changes ?? 0) === 0 });
}
