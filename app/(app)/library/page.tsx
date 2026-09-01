import Link from "next/link";
import { ListMusic, Plus } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { songToTrack } from "@/lib/song";
import SongList from "@/components/SongList";
import { createPlaylist } from "@/app/actions/songs";

export default async function LibraryPage() {
  const session = await requireSession();
  const userId = session.user.id;

  const [uploadedSongs, likedSongs, playlists] = await Promise.all([
    prisma.song.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.song.findMany({
      where: { likedBy: { some: { userId } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const likedSongIds = new Set(likedSongs.map((s) => s.id));

  return (
    <div className="space-y-9 pt-6 md:pt-10">
      <div className="px-4 md:px-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Your Library</h1>

        <div className="mb-3 flex flex-wrap gap-2">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)]/50"
            >
              <ListMusic size={15} className="text-[var(--accent)]" />
              {playlist.name}
            </Link>
          ))}
        </div>

        {playlists.length === 0 && (
          <p className="mb-3 text-sm text-[var(--text-faint)]">No playlists yet — make one below.</p>
        )}

        <form action={createPlaylist} className="flex max-w-sm gap-2">
          <input
            name="name"
            placeholder="New playlist name"
            required
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60"
          />
          <button
            type="submit"
            aria-label="Create playlist"
            className="flex items-center justify-center rounded-full bg-[var(--text)] px-4 text-sm font-semibold text-[var(--bg)] transition-transform active:scale-95"
          >
            <Plus size={17} />
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-3 px-4 text-lg font-bold tracking-tight md:px-6">Liked Songs</h2>
        <SongList songs={likedSongs.map(songToTrack)} likedSongIds={likedSongIds} />
      </div>

      <div>
        <h2 className="mb-3 px-4 text-lg font-bold tracking-tight md:px-6">Your Uploads</h2>
        <SongList songs={uploadedSongs.map(songToTrack)} likedSongIds={likedSongIds} />
      </div>
    </div>
  );
}
