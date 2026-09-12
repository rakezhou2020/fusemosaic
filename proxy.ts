import { NextResponse, type NextRequest } from "next/server";
import { getFuseMosaicEnv } from "@/lib/cloudflare";

/**
 * A removed record must preserve its historical URL while returning HTTP 410.
 * This runs only for the public pattern detail route; all authorization remains
 * in the route handlers and server components.
 */
export async function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  const database = getFuseMosaicEnv().PATTERNS_DB;
  if (!slug || !database) return NextResponse.next();

  const record = await database.prepare("SELECT status FROM patterns WHERE slug=?").bind(slug).first<{ status: string }>();
  if (record?.status !== "removed") return NextResponse.next();
  return new NextResponse("Gone", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, follow" },
  });
}

export const config = { matcher: "/patterns/:slug" };
