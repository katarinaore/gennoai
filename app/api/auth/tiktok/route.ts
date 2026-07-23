// GET /api/auth/tiktok
// Starts the TikTok OAuth flow: generates a CSRF state, stores it in an
// httpOnly cookie, and redirects the owner to TikTok's authorize page.
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/app/lib/tiktok";

export async function GET() {
  try {
    const state = randomUUID();
    const res = NextResponse.redirect(buildAuthorizeUrl(state));
    res.cookies.set("tiktok_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
