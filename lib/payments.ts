import { getFuseMosaicEnv } from "@/lib/cloudflare";

export const PREMIUM_PRICE = "0.99";
export const PREMIUM_CURRENCY = "USDT";
export const PURCHASE_COOKIE = "fusemosaic_purchase";

type JsonRecord = Record<string, unknown>;

export type PaymentOrder = {
  id: string;
  pattern_id: string;
  pattern_slug: string;
  payment_id: string | null;
  amount: string;
  currency: string;
  payment_status: "pending" | "paid" | "expired" | "failed";
  access_token_hash: string;
  paid_at: string | null;
};

export type ProviderPayment = {
  paymentId: string | null;
  checkoutUrl: string | null;
  orderId: string | null;
  amount: string | null;
  currency: string | null;
  status: "pending" | "paid" | "expired" | "failed" | null;
};

const encoder = new TextEncoder();

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function firstText(record: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = text(record[key]);
    if (value) return value;
  }
  return null;
}

function firstAmount(record: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function paymentPayload(value: unknown): JsonRecord {
  if (!isRecord(value)) return {};
  let record = value;
  // Status responses may be shaped as { data: { payment: { ... } } }.
  // Walk only known response wrappers and keep the actual payment record.
  for (let depth = 0; depth < 3; depth += 1) {
    const nested = ["data", "payment", "result"].map((key) => record[key]).find(isRecord);
    if (!nested) break;
    record = nested;
  }
  return record;
}

function paymentStatus(value: string | null): ProviderPayment["status"] {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (["paid", "confirmed", "success", "succeeded", "completed", "complete"].includes(normalized)) return "paid";
  if (["expired", "cancelled", "canceled"].includes(normalized)) return "expired";
  if (["failed", "error", "rejected"].includes(normalized)) return "failed";
  if (["pending", "waiting", "created", "processing", "detected"].includes(normalized)) return "pending";
  return null;
}

export function parseProviderPayment(value: unknown): ProviderPayment {
  const record = paymentPayload(value);
  const checkout = isRecord(record.checkout) ? record.checkout : {};
  return {
    paymentId: firstText(record, ["id", "payment_id", "paymentId"]),
    checkoutUrl: firstText(record, ["checkout_url", "checkoutUrl", "payment_url", "paymentUrl", "hosted_url", "hostedUrl", "url"]) ?? firstText(checkout, ["url", "checkout_url"]),
    orderId: firstText(record, ["order_id", "orderId", "merchant_order_id"]),
    amount: firstAmount(record, ["amount", "total", "price", "expected_amount", "expectedAmount"]),
    currency: firstText(record, ["currency", "asset"]),
    status: paymentStatus(firstText(record, ["status", "payment_status", "paymentStatus", "state"])),
  };
}

export function readCookie(request: Request, name: string): string | null {
  const prefix = `${name}=`;
  const value = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix))?.slice(prefix.length);
  return value ? decodeURIComponent(value) : null;
}

export function purchaseCookie(value: string) {
  return `${PURCHASE_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
}

export function makePurchaseToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function sameAmount(left: string | null, right: string) {
  const normalize = (value: string | null) => {
    if (!value || !/^\d+(?:\.\d{1,6})?$/.test(value)) return null;
    const [whole, fraction = ""] = value.split(".");
    return BigInt(`${whole}${fraction.padEnd(6, "0")}`);
  };
  const parsedLeft = normalize(left);
  const parsedRight = normalize(right);
  return parsedLeft !== null && parsedRight !== null && parsedLeft === parsedRight;
}

async function providerRequest(path: string, init?: RequestInit) {
  const apiKey = getFuseMosaicEnv().PAYMENT_API_KEY;
  if (!apiKey) throw new Error("Payment service is not configured");
  const response = await fetch(`https://usdtonpay.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => null) as unknown;
  if (!response.ok) throw new Error("Payment provider request failed");
  return body;
}

export async function createProviderPayment(orderId: string) {
  return parseProviderPayment(await providerRequest("/api/v1/payments", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, amount: PREMIUM_PRICE, currency: PREMIUM_CURRENCY }),
  }));
}

export async function providerPaymentStatus(paymentId: string) {
  return parseProviderPayment(await providerRequest(`/api/v1/payments/${encodeURIComponent(paymentId)}/status`));
}

export async function syncOrderFromProvider(database: D1Database, order: PaymentOrder) {
  if (!order.payment_id || order.payment_status === "paid") return order.payment_status;
  const provider = await providerPaymentStatus(order.payment_id);
  const remoteStatus = provider.status;
  if (!remoteStatus || remoteStatus === "pending") return order.payment_status;
  if (remoteStatus === "paid") {
    const orderMatches = provider.orderId === order.id;
    const amountMatches = sameAmount(provider.amount, order.amount);
    const currencyMatches = provider.currency?.toUpperCase() === order.currency;
    // Diagnostic fields deliberately contain no payment ID, customer data, or secret.
    console.info("Premium payment reconciliation", { remoteStatus, hasProviderOrderId: Boolean(provider.orderId), orderMatches, hasProviderAmount: Boolean(provider.amount), amountMatches, providerCurrency: provider.currency?.toUpperCase() ?? null, currencyMatches });
    const valid = orderMatches && amountMatches && currencyMatches;
    if (!valid) return order.payment_status;
    await database.prepare("UPDATE payment_orders SET payment_status='paid', paid_at=COALESCE(paid_at, CURRENT_TIMESTAMP), updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status!='paid'").bind(order.id).run();
    return "paid";
  }
  await database.prepare("UPDATE payment_orders SET payment_status=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='pending'").bind(remoteStatus, order.id).run();
  return remoteStatus;
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === "https://fusemosaic.com" || origin === "https://fusemosaic.rakezhou2020.workers.dev";
}
