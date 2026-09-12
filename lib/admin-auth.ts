import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getFuseMosaicEnv } from "@/lib/cloudflare";

const COOKIE = "fusemosaic_rake";
const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
function base64ToBytes(value: string) { return Uint8Array.from(atob(value), (char) => char.charCodeAt(0)); }

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

async function same(a: string, b: string) {
  const aBytes = encoder.encode(a); const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let result = 0; for (let index = 0; index < aBytes.length; index += 1) result |= aBytes[index] ^ bBytes[index];
  return result === 0;
}

export async function verifyAdminPassword(password: string) {
  const expected = getFuseMosaicEnv().ADMIN_PASSWORD;
  return Boolean(expected && await same(password, expected));
}

export async function createAdminSession() {
  const secret = getFuseMosaicEnv().ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  const payload = JSON.stringify({ role: "admin", exp: Date.now() + 1000 * 60 * 60 * 12 });
  return `${bytesToBase64(encoder.encode(payload))}.${await hmac(payload, secret)}`;
}

export async function isAdminSession(token?: string) {
  const secret = getFuseMosaicEnv().ADMIN_SESSION_SECRET;
  if (!token || !secret) return false;
  const [encoded, signature] = token.split("."); if (!encoded || !signature) return false;
  try {
    const payload = new TextDecoder().decode(base64ToBytes(encoded));
    const parsed = JSON.parse(payload) as { role?: string; exp?: number };
    return parsed.role === "admin" && typeof parsed.exp === "number" && parsed.exp > Date.now() && await same(signature, await hmac(payload, secret));
  } catch { return false; }
}

export async function requireAdminPage() {
  if (!await isAdminSession((await cookies()).get(COOKIE)?.value)) redirect("/rake/login");
}

export async function requireAdminRequest(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  return isAdminSession(token);
}

export const adminCookie = (value: string) => `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`;
export const expiredAdminCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
