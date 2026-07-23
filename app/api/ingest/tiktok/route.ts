// POST /api/ingest/tiktok
// Polls the TikTok Display API and stores results:
//   - upserts one TikTokVideo row per video (keyed on tiktokId)
//   - appends a TikTokSnapshot row capturing current metrics
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAccessToken, listAllVideos } from "@/app/lib/tiktok";

export async function POST() {
  try {
    const accessToken = await getAccessToken();
    const videos = await listAllVideos(accessToken);

    let snapshots = 0;
    for (const v of videos) {
      const video = await prisma.tikTokVideo.upsert({
        where: { tiktokId: v.id },
        update: { title: v.title ?? null },
        create: {
          tiktokId: v.id,
          title: v.title ?? null,
          createTime: new Date(v.create_time * 1000),
        },
      });

      await prisma.tikTokSnapshot.create({
        data: {
          videoId: video.id,
          views: v.view_count ?? 0,
          likes: v.like_count ?? 0,
          comments: v.comment_count ?? 0,
          shares: v.share_count ?? 0,
        },
      });
      snapshots++;
    }

    return NextResponse.json({
      ok: true,
      videos: videos.length,
      snapshots,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
