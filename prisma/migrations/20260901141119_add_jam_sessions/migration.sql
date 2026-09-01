-- CreateTable
CREATE TABLE "JamSession" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "songId" TEXT,
    "youtubeVideoId" TEXT,
    "youtubeTitle" TEXT,
    "youtubeArtist" TEXT,
    "youtubeThumbnailUrl" TEXT,
    "isPlaying" BOOLEAN NOT NULL DEFAULT false,
    "positionSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamParticipant" (
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JamParticipant_pkey" PRIMARY KEY ("sessionId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "JamSession_code_key" ON "JamSession"("code");

-- AddForeignKey
ALTER TABLE "JamSession" ADD CONSTRAINT "JamSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamSession" ADD CONSTRAINT "JamSession_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamParticipant" ADD CONSTRAINT "JamParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "JamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamParticipant" ADD CONSTRAINT "JamParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
