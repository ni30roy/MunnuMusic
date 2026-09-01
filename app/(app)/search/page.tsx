import { Search } from "lucide-react";
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
    <div className="pt-6 md:pt-10">
      <form action="/search" className="px-4 md:px-6">
        <div className="relative max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
          />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="What do you want to listen to?"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60"
          />
        </div>
      </form>

      {!q && (
        <p className="mt-6 px-4 text-sm text-[var(--text-faint)] md:px-6">
          Search your library or YouTube.
        </p>
      )}

      {q && (
        <div className="mt-6 space-y-8">
          <div>
            <h2 className="mb-3 px-4 text-lg font-bold tracking-tight md:px-6">Your Library</h2>
            <SongList songs={librarySongs.map(songToTrack)} deletable />
          </div>
          <div>
            <h2 className="mb-3 px-4 text-lg font-bold tracking-tight md:px-6">From YouTube</h2>
            <SongList songs={youtubeTracks} />
          </div>
        </div>
      )}
    </div>
  );
}
