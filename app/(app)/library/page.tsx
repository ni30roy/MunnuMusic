import Link from "next/link";
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
    <div className="space-y-8 py-6">
      <div>
        <h1 className="mb-4 px-6 text-2xl font-bold">Playlists</h1>
        <ul className="px-6">
          {playlists.map((playlist) => (
            <li key={playlist.id} className="py-1">
              <Link href={`/playlist/${playlist.id}`} className="text-neutral-300 hover:text-white">
                {playlist.name}
              </Link>
            </li>
          ))}
          {playlists.length === 0 && (
            <p className="text-sm text-neutral-500">No playlists yet.</p>
          )}
        </ul>
        <form action={createPlaylist} className="mt-3 flex gap-2 px-6">
          <input
            name="name"
            placeholder="New playlist name"
            required
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black"
          >
            Create
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 px-6 text-xl font-bold">Liked Songs</h2>
        <SongList songs={likedSongs.map(songToTrack)} likedSongIds={likedSongIds} />
      </div>

      <div>
        <h2 className="mb-4 px-6 text-xl font-bold">Your Uploads</h2>
        <SongList songs={uploadedSongs.map(songToTrack)} likedSongIds={likedSongIds} />
      </div>
    </div>
  );
}
