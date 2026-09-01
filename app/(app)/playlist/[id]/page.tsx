import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { songToTrack } from "@/lib/song";
import PlaylistEditor from "@/components/PlaylistEditor";

export default async function PlaylistPage(props: PageProps<"/playlist/[id]">) {
  const { id } = await props.params;
  const session = await requireSession();
  const userId = session.user.id;

  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      songs: {
        orderBy: { position: "asc" },
        include: { song: true },
      },
    },
  });

  if (!playlist || playlist.userId !== userId) {
    notFound();
  }

  const playlistSongIds = new Set(playlist.songs.map((ps) => ps.songId));

  const allSongs = await prisma.song.findMany({ orderBy: { createdAt: "desc" } });
  const availableSongs = allSongs.filter((s) => !playlistSongIds.has(s.id));

  return (
    <div className="pt-6 md:pt-10">
      <div className="mb-6 px-4 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Playlist
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{playlist.name}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {playlist.songs.length} song{playlist.songs.length === 1 ? "" : "s"}
        </p>
      </div>
      <PlaylistEditor
        playlistId={playlist.id}
        playlistSongs={playlist.songs.map((ps) => songToTrack(ps.song))}
        availableSongs={availableSongs.map(songToTrack)}
      />
    </div>
  );
}
