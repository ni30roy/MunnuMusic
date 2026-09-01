import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { songToTrack } from "@/lib/song";
import SongList from "@/components/SongList";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default async function HomePage() {
  const session = await requireSession();
  const userId = session.user.id;

  const [songs, likedSongs] = await Promise.all([
    prisma.song.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.likedSong.findMany({ where: { userId }, select: { songId: true } }),
  ]);

  const likedSongIds = new Set(likedSongs.map((l) => l.songId));

  return (
    <div className="pt-6 pb-4 md:pt-10">
      <div className="mb-6 px-4 md:px-6">
        <p className="text-sm font-medium text-[var(--text-muted)]">{greeting()},</p>
        <h1 className="gradient-text text-3xl font-extrabold tracking-tight md:text-4xl">
          {session.user.name?.split(" ")[0] ?? "there"}
        </h1>
        {songs.length > 0 && (
          <p className="mt-1 text-sm text-[var(--text-faint)]">
            {songs.length} song{songs.length === 1 ? "" : "s"} in your library
          </p>
        )}
      </div>
      <SongList songs={songs.map(songToTrack)} likedSongIds={likedSongIds} deletable />
    </div>
  );
}
