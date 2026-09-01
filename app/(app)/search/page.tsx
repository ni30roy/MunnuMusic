import { prisma } from "@/lib/prisma";
import { songToTrack } from "@/lib/song";
import { searchYoutube } from "@/lib/youtube";
import SongList from "@/components/SongList";
import type { Track } from "@/lib/store/playerStore";

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";

  const [librarySongs, youtubeResults] = q
    ? await Promise.all([
        prisma.song.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { artist: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 50,
        }),
        searchYoutube(q),
      ])
    : [[], []];

  const youtubeTracks: Track[] = youtubeResults.map((r) => ({
    id: `yt-${r.videoId}`,
    title: r.title,
    artist: r.channelTitle,
    coverArtUrl: r.thumbnailUrl,
    source: "youtube",
    streamUrl: null,
    youtubeVideoId: r.videoId,
  }));

  return (
    <div className="py-6">
      <form action="/search" className="px-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="What do you want to listen to?"
          className="w-full max-w-md rounded-full bg-neutral-800 px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
        />
      </form>

      {!q && <p className="mt-6 px-6 text-sm text-neutral-500">Search your library or YouTube.</p>}

      {q && (
        <div className="mt-6 space-y-8">
          <div>
            <h2 className="mb-3 px-6 text-lg font-semibold">Your Library</h2>
            <SongList songs={librarySongs.map(songToTrack)} />
          </div>
          <div>
            <h2 className="mb-3 px-6 text-lg font-semibold">From YouTube</h2>
            <SongList songs={youtubeTracks} />
          </div>
        </div>
      )}
    </div>
  );
}
