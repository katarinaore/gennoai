@AGENTS.md

# gennoai

Personal analytics dashboard that tracks **TikTok content performance** and **App Store download data** in one place, so Kate can spot which content is actually working.

## Stack

- **Next.js 16.2.11** — App Router, TypeScript, Tailwind v4. (Note: v16, not v14 — read `node_modules/next/dist/docs/` before writing route/page code; APIs differ from older Next.)
- **Prisma v7.9.0** with the `prisma-client` generator → output to `app/generated/prisma`. Postgres via the **`@prisma/adapter-pg`** driver adapter (required in v7).
- **PostgreSQL** running locally via Homebrew, database name `gennoai`, connection `postgresql://kate@localhost:5432/gennoai` (set in `.env`).
- Deployment target: VPS via Coolify (later). Local dev for now.

## Data model (`prisma/schema.prisma`)

- `TikTokVideo` — one row per video (`tiktokId` unique). Has many `TikTokSnapshot`.
- `TikTokSnapshot` — a point-in-time metrics reading (views/likes/comments/shares, `pulledAt`). Indexed on `(videoId, pulledAt)`.
- `AppStoreDaily` — daily download count, unique per `date`.

## Current status

- ✅ DB schema migrated (`20260723144415_init`), tables verified via psql.
- ✅ Prisma client generated to `app/generated/prisma`.
- ✅ Ingestion API routes scaffolded: `POST /api/ingest/tiktok`, `POST /api/ingest/appstore`.
- ✅ `/dashboard` page (server component, reads via Prisma).
- ⚠️ App Store Connect: JWT auth works, but `fetchDailyDownloads()` in `app/lib/appstore.ts` is a marked TODO (Analytics Reports download/parse needs real creds + a provisioned report to build against).
- ⚠️ No credentials filled in yet — both routes return clear "Missing env var" errors until `.env.local` is populated.
- No auth yet (intentional).

## Project structure

```
app/
  lib/prisma.ts               Prisma v7 client singleton (+ @prisma/adapter-pg)
  lib/tiktok.ts               TikTok Display API helpers (OAuth refresh, user/info, video/list)
  lib/appstore.ts             App Store Connect JWT auth + (TODO) analytics download
  api/auth/tiktok/route.ts    GET: start TikTok OAuth (redirect to authorize)
  api/auth/tiktok/callback/route.ts  GET: exchange code, show refresh token to paste into env
  api/ingest/tiktok/route.ts  POST: poll TikTok, upsert TikTokVideo + append TikTokSnapshot
  api/ingest/appstore/route.ts POST: poll ASC, upsert AppStoreDaily
  dashboard/page.tsx          Minimal read-only dashboard
  privacy/page.tsx, terms/page.tsx  Public legal pages (TikTok review)
```

TikTok setup: visit `/api/auth/tiktok` once → authorize → paste the shown refresh
token into `TIKTOK_REFRESH_TOKEN`. Requires `TIKTOK_REDIRECT_URI` to match the
URI registered in the TikTok app.

Trigger ingestion locally:
`curl -X POST http://localhost:3000/api/ingest/tiktok` (and `/appstore`)

## Verify commands

```bash
psql -d gennoai -c "\dt"                 # list tables
npx prisma migrate status                # migration state
npm run dev                              # start Next dev server
```

## Changelog

- **2026-07-23** — Ran initial migration `20260723144415_init`: created `TikTokVideo`, `TikTokSnapshot`, `AppStoreDaily` tables + indexes/FK. Verified via psql.
- **2026-07-23** — Fixed `generator` block to Prisma v7 `prisma-client` provider with `output = "../app/generated/prisma"` (was legacy `prisma-client-js`). Generated client.
- **2026-07-23** — Added deps: `@prisma/adapter-pg`, `pg`, `jsonwebtoken` (+ `@types/pg`, `@types/jsonwebtoken`).
- **2026-07-23** — Added `app/lib/prisma.ts` (v7 client singleton via adapter-pg).
- **2026-07-23** — Added ingestion routes `POST /api/ingest/tiktok` and `POST /api/ingest/appstore` + helpers `app/lib/tiktok.ts`, `app/lib/appstore.ts`.
- **2026-07-23** — Added `/dashboard` page (TikTok videos by views + App Store downloads over time).
- **2026-07-23** — Added `.env.local` with TikTok + App Store Connect placeholders (gitignored).
- **2026-07-23** — Added public `/privacy` and `/terms` pages (required for TikTok Display API app review; contact email is a TODO placeholder).
- **2026-07-23** — Committed project to `main` (tooling dirs included; `.claude/settings.local.json` gitignored).
- **2026-07-23** — Deploy prep: `next.config.ts` `output: "standalone"`, `postinstall: prisma generate` (client is gitignored), `migrate:deploy` script. Production build verified.
- **2026-07-23** — Added TikTok OAuth flow: `GET /api/auth/tiktok` + `/callback` (CSRF state cookie, code→token exchange, displays refresh token). Added `TIKTOK_REDIRECT_URI` env + "Connect TikTok" link on dashboard.

## Guardrails (follow in EVERY session on this project)

1. **Never delete or overwrite existing data-bearing files** (schema, migrations, `.env` files) without explicitly telling Kate first and **waiting for confirmation**.
2. **Never run destructive database commands** (drop table, reset db, force migrations that lose data) without explicit confirmation.
3. **Never touch git remotes, force-push, or rewrite git history** without explicit confirmation.
4. **Always tell Kate what changed and how to verify it** before moving to the next step.
5. **If something breaks, stop and explain the error** rather than trying multiple fixes silently.
