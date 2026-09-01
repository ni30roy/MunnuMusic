import type { Song } from "@/app/generated/prisma/client";
import { getAudioUrl } from "@/lib/cloudinary";
import type { Track } from "@/lib/store/playerStore";

export function songToTrack(song: Song): Track {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    coverArtUrl: song.coverArtUrl,
    source: song.source,
    streamUrl: song.cloudinaryPublicId ? getAudioUrl(song.cloudinaryPublicId) : null,
    youtubeVideoId: song.youtubeVideoId,
  };
}
