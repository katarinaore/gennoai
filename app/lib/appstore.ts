// App Store Connect API helpers.
// Docs: https://developer.apple.com/documentation/appstoreconnectapi
//
// Auth is a short-lived ES256 JWT signed with the .p8 private key.
// The Analytics Reports API is asynchronous: you create a report *request*,
// poll for a ready *instance*, list its *segments*, then download+parse the
// gzipped CSV. The download/parse step needs a provisioned report + real
// credentials to test, so it is left as a clearly marked TODO below.

import jwt from "jsonwebtoken";

const API_BASE = "https://api.appstoreconnect.apple.com";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/** Build a signed JWT valid for ~20 minutes (Apple's max). */
export function generateToken(): string {
  const privateKey = requireEnv("ASC_PRIVATE_KEY").replace(/\\n/g, "\n");
  const nowSeconds = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: requireEnv("ASC_ISSUER_ID"),
      iat: nowSeconds,
      exp: nowSeconds + 20 * 60,
      aud: "appstoreconnect-v1",
    },
    privateKey,
    {
      algorithm: "ES256",
      header: { alg: "ES256", kid: requireEnv("ASC_KEY_ID"), typ: "JWT" },
    },
  );
}

/** Authenticated fetch against the App Store Connect API. */
export async function ascFetch(path: string, init?: RequestInit) {
  const token = generateToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`ASC ${path} failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

export type DailyDownloads = { date: Date; downloads: number };

/**
 * Fetch daily download counts.
 *
 * TODO: wire up the full Analytics Reports pipeline once credentials + a
 * provisioned "App Store Discovery and Engagement / Downloads" report exist:
 *   1. POST /v1/analyticsReportRequests   (one-time, per app)
 *   2. GET  .../analyticsReports?filter[category]=APP_USAGE
 *   3. GET  .../instances                  (pick the daily granularity instance)
 *   4. GET  .../segments                   (returns signed download URLs)
 *   5. download + gunzip + parse the CSV, mapping each row to { date, downloads }
 *
 * Until then this throws a clear error rather than returning fake data.
 */
export async function fetchDailyDownloads(): Promise<DailyDownloads[]> {
  requireEnv("ASC_APP_ID"); // validates config is present
  throw new Error(
    "fetchDailyDownloads: Analytics Reports download/parse not implemented yet — " +
      "needs real credentials and a provisioned report to build against.",
  );
}
