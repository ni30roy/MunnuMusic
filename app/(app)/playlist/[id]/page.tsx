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
    <div className="py-6">
      <h1 className="mb-6 px-6 text-2xl font-bold">{playlist.name}</h1>
      <PlaylistEditor
        playlistId={playlist.id}
        playlistSongs={playlist.songs.map((ps) => songToTrack(ps.song))}
        availableSongs={availableSongs.map(songToTrack)}
      />
    </div>
  );
}
