import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { songToTrack } from "@/lib/song";
import type { Track } from "@/lib/store/playerStore";

async function loadJamForParticipant(code: string, userId: string) {
  const jam = await prisma.jamSession.findUnique({
    where: { code: code.toUpperCase() },
    include: { song: true, _count: { select: { participants: true } } },
  });
  if (!jam) return { jam: null, isParticipant: false };

  const participant = await prisma.jamParticipant.findUnique({
    where: { sessionId_userId: { sessionId: jam.id, userId } },
  });

  return { jam, isParticipant: !!participant };
}

function jamTrack(jam: { song: Parameters<typeof songToTrack>[0] | null } & {
  youtubeVideoId: string | null;
  youtubeTitle: string | null;
  youtubeArtist: string | null;
  youtubeThumbnailUrl: string | null;
}): Track | null {
  if (jam.song) return songToTrack(jam.song);
  if (jam.youtubeVideoId) {
    return {
      id: `yt-${jam.youtubeVideoId}`,
      title: jam.youtubeTitle ?? "Unknown",
      artist: jam.youtubeArtist,
      coverArtUrl: jam.youtubeThumbnailUrl,
      source: "youtube",
      streamUrl: null,
      youtubeVideoId: jam.youtubeVideoId,
    };
  }
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const { jam, isParticipant } = await loadJamForParticipant(code, session.user.id);
  if (!jam || !isParticipant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    track: jamTrack(jam),
    isPlaying: jam.isPlaying,
    positionSeconds: jam.positionSeconds,
    updatedAt: jam.updatedAt,
    participantCount: jam._count.participants,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const { jam, isParticipant } = await loadJamForParticipant(code, session.user.id);
  if (!jam || !isParticipant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const track = body.track as Track | undefined;
  const isPlaying = Boolean(body.isPlaying);
  const positionSeconds = typeof body.positionSeconds === "number" ? body.positionSeconds : 0;

  const isYoutube = track?.source === "youtube";

  const updated = await prisma.jamSession.update({
    where: { id: jam.id },
    data: {
      isPlaying,
      positionSeconds,
      ...(track
        ? isYoutube
          ? {
              songId: null,
              youtubeVideoId: track.youtubeVideoId,
              youtubeTitle: track.title,
              youtubeArtist: track.artist,
              youtubeThumbnailUrl: track.coverArtUrl,
            }
          : {
              songId: track.id,
              youtubeVideoId: null,
              youtubeTitle: null,
              youtubeArtist: null,
              youtubeThumbnailUrl: null,
            }
        : {}),
    },
    include: { song: true, _count: { select: { participants: true } } },
  });

  return NextResponse.json({
    track: jamTrack(updated),
    isPlaying: updated.isPlaying,
    positionSeconds: updated.positionSeconds,
    updatedAt: updated.updatedAt,
    participantCount: updated._count.participants,
  });
}
