import { adminCookie, createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const data = await request.json().catch(() => null) as { password?: unknown } | null;
  if (!data || typeof data.password !== "string" || data.password.length > 512 || !await verifyAdminPassword(data.password)) return Response.json({ error: "Invalid password" }, { status: 401 });
  const response = Response.json({ ok: true }); response.headers.set("Set-Cookie", adminCookie(await createAdminSession())); return response;
}
