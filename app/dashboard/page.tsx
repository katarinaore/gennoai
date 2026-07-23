// /dashboard — minimal read-only view of ingested data.
// Server Component: queries Postgres via Prisma directly (see docs 06-fetching-data).
import { prisma } from "@/app/lib/prisma";

// DB reads are runtime data — never serve a stale cached render.
export const dynamic = "force-dynamic";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function DashboardPage() {
  // Each video with its most recent metrics snapshot.
  const videos = await prisma.tikTokVideo.findMany({
    include: { snapshots: { orderBy: { pulledAt: "desc" }, take: 1 } },
  });
  const rows = videos
    .map((v) => ({
      id: v.id,
      title: v.title ?? "(untitled)",
      latest: v.snapshots[0] ?? null,
    }))
    .sort((a, b) => (b.latest?.views ?? 0) - (a.latest?.views ?? 0));

  const daily = await prisma.appStoreDaily.findMany({
    orderBy: { date: "asc" },
  });
  const maxDownloads = Math.max(1, ...daily.map((d) => d.downloads));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-12">
      <header>
        <h1 className="text-2xl font-semibold">gennoai dashboard</h1>
        <p className="text-sm text-gray-500">
          TikTok performance and App Store downloads.
        </p>
      </header>

      {/* ── TikTok videos ── */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">TikTok videos by views</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">
            No videos yet.{" "}
            <a href="/api/auth/tiktok" className="text-blue-500 underline">
              Connect your TikTok account
            </a>
            , then trigger ingestion:{" "}
            <code>curl -X POST http://localhost:3000/api/ingest/tiktok</code>
          </p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 px-4 text-right">Views</th>
                <th className="py-2 px-4 text-right">Likes</th>
                <th className="py-2 px-4 text-right">Comments</th>
                <th className="py-2 pl-4 text-right">Shares</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 pr-4">{r.title}</td>
                  <td className="py-2 px-4 text-right">{fmt(r.latest?.views ?? 0)}</td>
                  <td className="py-2 px-4 text-right">{fmt(r.latest?.likes ?? 0)}</td>
                  <td className="py-2 px-4 text-right">{fmt(r.latest?.comments ?? 0)}</td>
                  <td className="py-2 pl-4 text-right">{fmt(r.latest?.shares ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ── App Store downloads ── */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">App Store downloads over time</h2>
        {daily.length === 0 ? (
          <p className="text-sm text-gray-500">
            No download data yet. Trigger ingestion:{" "}
            <code>curl -X POST http://localhost:3000/api/ingest/appstore</code>
          </p>
        ) : (
          <div className="space-y-1">
            {daily.map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-gray-500">
                  {d.date.toISOString().slice(0, 10)}
                </span>
                <span
                  className="h-4 rounded bg-blue-500"
                  style={{ width: `${(d.downloads / maxDownloads) * 100}%` }}
                />
                <span className="tabular-nums">{fmt(d.downloads)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
