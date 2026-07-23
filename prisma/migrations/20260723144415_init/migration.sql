-- CreateTable
CREATE TABLE "TikTokVideo" (
    "id" TEXT NOT NULL,
    "tiktokId" TEXT NOT NULL,
    "title" TEXT,
    "createTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TikTokVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TikTokSnapshot" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "shares" INTEGER NOT NULL,
    "pulledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TikTokSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppStoreDaily" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "downloads" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppStoreDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TikTokVideo_tiktokId_key" ON "TikTokVideo"("tiktokId");

-- CreateIndex
CREATE INDEX "TikTokSnapshot_videoId_pulledAt_idx" ON "TikTokSnapshot"("videoId", "pulledAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppStoreDaily_date_key" ON "AppStoreDaily"("date");

-- AddForeignKey
ALTER TABLE "TikTokSnapshot" ADD CONSTRAINT "TikTokSnapshot_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "TikTokVideo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
