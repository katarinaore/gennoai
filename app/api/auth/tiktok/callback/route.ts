// GET /api/auth/tiktok/callback
// TikTok redirects here with ?code&state. We verify the state cookie, exchange
// the code for tokens, and display the refresh token so the owner can paste it
// into TIKTOK_REFRESH_TOKEN (single-user tool — no token store needed).
import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/app/lib/tiktok";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.json(
      { ok: false, error: oauthError, description: searchParams.get("error_description") },
      { status: 400 },
    );
  }

  const savedState = request.cookies.get("tiktok_oauth_state")?.value;
  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.json(
      { ok: false, error: "Invalid or missing OAuth state/code — restart at /api/auth/tiktok" },
      { status: 400 },
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const refreshDays = Math.round(tokens.refresh_expires_in / 86400);
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>TikTok connected</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:3rem auto;padding:0 1rem;line-height:1.5}
code,textarea{font-family:ui-monospace,monospace}textarea{width:100%;height:5rem;padding:.5rem}</style>
</head><body>
<h1>✅ TikTok connected</h1>
<p>Authorized for <code>${escapeHtml(tokens.scope)}</code> (open_id <code>${escapeHtml(tokens.open_id)}</code>).</p>
<p>Copy this refresh token into <code>TIKTOK_REFRESH_TOKEN</code> in <code>.env.local</code>
(and your Coolify env), then restart the app:</p>
<textarea readonly onclick="this.select()">${escapeHtml(tokens.refresh_token)}</textarea>
<p style="color:#666">This refresh token expires in ~${refreshDays} days. Re-run
<code>/api/auth/tiktok</code> to get a new one. Do not share it.</p>
</body></html>`;

    const res = new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    res.cookies.delete("tiktok_oauth_state");
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
