"use client";

import { useTransition } from "react";
import { usePlayerStore, type Track } from "@/lib/store/playerStore";
import { toggleLike } from "@/app/actions/songs";

export default function SongList({
  songs,
  likedSongIds,
  onRemove,
}: {
  songs: Track[];
  likedSongIds?: Set<string>;
  onRemove?: (songId: string) => void;
}) {
  const playQueue = usePlayerStore((s) => s.playQueue);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [, startTransition] = useTransition();

  if (songs.length === 0) {
    return <p className="px-6 text-sm text-neutral-500">No songs yet.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-900">
      {songs.map((song, index) => {
        const isActive = currentTrack?.id === song.id;
        const isLiked = likedSongIds?.has(song.id) ?? false;
        return (
          <li key={song.id} className="flex items-center">
            <button
              onClick={() => playQueue(songs, index)}
              className={`flex min-w-0 flex-1 items-center gap-3 px-6 py-2 text-left hover:bg-neutral-900 ${
                isActive ? "text-green-500" : "text-white"
              }`}
            >
              {song.coverArtUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={song.coverArtUrl}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-neutral-800" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {isActive && isPlaying ? "▶ " : ""}
                  {song.title}
                </p>
                <p className="truncate text-xs text-neutral-400">{song.artist}</p>
              </div>
            </button>

            {likedSongIds !== undefined && (
              <button
                aria-label={isLiked ? "Unlike" : "Like"}
                onClick={() => startTransition(() => toggleLike(song.id))}
                className={`px-4 text-lg ${isLiked ? "text-green-500" : "text-neutral-500 hover:text-white"}`}
              >
                {isLiked ? "♥" : "♡"}
              </button>
            )}

            {onRemove && (
              <button
                aria-label="Remove from playlist"
                onClick={() => onRemove(song.id)}
                className="px-4 text-sm text-neutral-500 hover:text-red-500"
              >
                ✕
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
