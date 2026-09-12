import { expiredAdminCookie } from "@/lib/admin-auth";
export async function POST() { const response = Response.json({ ok: true }); response.headers.set("Set-Cookie", expiredAdminCookie); return response; }
