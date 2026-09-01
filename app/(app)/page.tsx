import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { songToTrack } from "@/lib/song";
import SongList from "@/components/SongList";

export default async function HomePage() {
  const session = await requireSession();
  const userId = session.user.id;

  const [songs, likedSongs] = await Promise.all([
    prisma.song.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.likedSong.findMany({ where: { userId }, select: { songId: true } }),
  ]);

  const likedSongIds = new Set(likedSongs.map((l) => l.songId));

  return (
    <div className="py-6">
      <h1 className="mb-4 px-6 text-2xl font-bold">Your Library</h1>
      <SongList songs={songs.map(songToTrack)} likedSongIds={likedSongIds} />
    </div>
  );
}
