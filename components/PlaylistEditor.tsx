"use client";

import { useState, useTransition } from "react";
import type { Track } from "@/lib/store/playerStore";
import SongList from "@/components/SongList";
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
        <h2 className="mb-3 px-6 text-lg font-semibold">Add songs</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your library..."
          className="mx-6 mb-3 w-full max-w-md rounded-full bg-neutral-800 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
        <ul className="divide-y divide-neutral-900">
          {filtered.slice(0, 50).map((song) => (
            <li key={song.id} className="flex items-center justify-between px-6 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm">{song.title}</p>
                <p className="truncate text-xs text-neutral-400">{song.artist}</p>
              </div>
              <button
                onClick={() =>
                  startTransition(() => addSongToPlaylist(playlistId, song.id))
                }
                className="ml-4 shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
