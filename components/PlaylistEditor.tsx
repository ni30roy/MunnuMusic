"use client";

import { useState, useTransition } from "react";
import { Search, Plus } from "lucide-react";
import type { Track } from "@/lib/store/playerStore";
import SongList from "@/components/SongList";
import CoverArt from "@/components/CoverArt";
import { addSongToPlaylist, removeSongFromPlaylist } from "@/app/actions/songs";

export default function PlaylistEditor({
  playlistId,
  playlistSongs,
  availableSongs,
}: {
  playlistId: string;
  playlistSongs: Track[];
  availableSongs: Track[];
}) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const filtered = availableSongs.filter((s) =>
    `${s.title} ${s.artist ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <SongList
        songs={playlistSongs}
        onRemove={(songId) =>
          startTransition(() => removeSongFromPlaylist(playlistId, songId))
        }
      />

      <div>
        <h2 className="mb-3 px-4 text-lg font-bold tracking-tight md:px-6">Add songs</h2>
        <div className="relative mx-4 mb-3 max-w-md md:mx-6">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library..."
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-4 text-sm outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/60"
          />
        </div>
        <ul className="flex flex-col gap-0.5 px-2 md:px-4">
          {filtered.slice(0, 50).map((song) => (
            <li
              key={song.id}
              className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-[var(--surface)]/60"
            >
              <div className="flex min-w-0 items-center gap-3">
                <CoverArt src={song.coverArtUrl} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm">{song.title}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">{song.artist}</p>
                </div>
              </div>
              <button
                onClick={() =>
                  startTransition(() => addSongToPlaylist(playlistId, song.id))
                }
                aria-label={`Add ${song.title}`}
                className="flex shrink-0 items-center justify-center rounded-full border border-[var(--border)] p-1.5 text-[var(--text-muted)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
              >
                <Plus size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
