// POST /api/ingest/appstore
// Polls App Store Connect for daily downloads and upserts AppStoreDaily
// (one row per date, unique on `date`).
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { fetchDailyDownloads } from "@/app/lib/appstore";

export async function POST() {
  try {
    const rows = await fetchDailyDownloads();

    for (const row of rows) {
      await prisma.appStoreDaily.upsert({
        where: { date: row.date },
        update: { downloads: row.downloads },
        create: { date: row.date, downloads: row.downloads },
      });
    }

    return NextResponse.json({ ok: true, days: rows.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
