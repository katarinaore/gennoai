// TikTok Display API helpers.
// Docs: https://developers.tiktok.com/doc/display-api-get-started/
//
// Auth: the Display API needs a short-lived *user* access token. We either use
// TIKTOK_ACCESS_TOKEN directly (if set), or mint one from TIKTOK_REFRESH_TOKEN
// using the app's client key/secret.

const API_BASE = "https://open.tiktokapis.com";
const AUTH_BASE = "https://www.tiktok.com";

// Scopes gennoai needs: read the owner's profile and their video list/metrics.
export const TIKTOK_SCOPES = ["user.info.basic", "video.list"];

export type TikTokVideoItem = {
  id: string;
  title?: string;
  create_time: number; // unix seconds
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/** Exchange the stored refresh token for a fresh access token. */
export async function refreshAccessToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: requireEnv("TIKTOK_CLIENT_KEY"),
      client_secret: requireEnv("TIKTOK_CLIENT_SECRET"),
      grant_type: "refresh_token",
      refresh_token: requireEnv("TIKTOK_REFRESH_TOKEN"),
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`TikTok token refresh failed: ${JSON.stringify(json)}`);
  }
  return json.access_token as string;
}

/** Prefer an explicitly provided access token, otherwise refresh. */
export async function getAccessToken(): Promise<string> {
  return process.env.TIKTOK_ACCESS_TOKEN || (await refreshAccessToken());
}

// ── OAuth authorization-code flow (run once to obtain a refresh token) ──

/** Build the TikTok authorize URL the owner is redirected to. */
export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_key: requireEnv("TIKTOK_CLIENT_KEY"),
    scope: TIKTOK_SCOPES.join(","),
    response_type: "code",
    redirect_uri: requireEnv("TIKTOK_REDIRECT_URI"),
    state,
  });
  return `${AUTH_BASE}/v2/auth/authorize/?${params.toString()}`;
}

export type TikTokTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  open_id: string;
  scope: string;
};

/** Exchange the authorization `code` from the callback for tokens. */
export async function exchangeCodeForTokens(code: string): Promise<TikTokTokens> {
  const res = await fetch(`${API_BASE}/v2/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: requireEnv("TIKTOK_CLIENT_KEY"),
      client_secret: requireEnv("TIKTOK_CLIENT_SECRET"),
      code,
      grant_type: "authorization_code",
      redirect_uri: requireEnv("TIKTOK_REDIRECT_URI"),
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.refresh_token) {
    throw new Error(`TikTok token exchange failed: ${JSON.stringify(json)}`);
  }
  return json as TikTokTokens;
}

/** GET /v2/user/info/ — basic profile fields. */
export async function getUserInfo(accessToken: string) {
  const fields = ["open_id", "display_name"].join(",");
  const res = await fetch(`${API_BASE}/v2/user/info/?fields=${fields}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`TikTok user/info failed: ${JSON.stringify(json)}`);
  return json.data?.user;
}

/**
 * POST /v2/video/list/ — one page of the authorized user's videos.
 * Returns the page plus pagination cursor.
 */
export async function listVideos(
  accessToken: string,
  cursor?: number,
): Promise<{ videos: TikTokVideoItem[]; cursor: number; hasMore: boolean }> {
  const fields = [
    "id",
    "title",
    "create_time",
    "view_count",
    "like_count",
    "comment_count",
    "share_count",
  ].join(",");

  const res = await fetch(`${API_BASE}/v2/video/list/?fields=${fields}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`TikTok video/list failed: ${JSON.stringify(json)}`);

  return {
    videos: (json.data?.videos ?? []) as TikTokVideoItem[],
    cursor: json.data?.cursor ?? 0,
    hasMore: Boolean(json.data?.has_more),
  };
}

/** Fetch all pages (capped) of the user's videos. */
export async function listAllVideos(accessToken: string, maxPages = 10) {
  const all: TikTokVideoItem[] = [];
  let cursor: number | undefined;
  for (let page = 0; page < maxPages; page++) {
    const { videos, cursor: next, hasMore } = await listVideos(accessToken, cursor);
    all.push(...videos);
    if (!hasMore) break;
    cursor = next;
  }
  return all;
}
