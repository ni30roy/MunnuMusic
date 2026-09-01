"use client";

import { useTransition } from "react";
import { Heart, X } from "lucide-react";
import { usePlayerStore, type Track } from "@/lib/store/playerStore";
import { toggleLike } from "@/app/actions/songs";
import CoverArt from "@/components/CoverArt";

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
    return (
      <p className="px-4 py-6 text-sm text-[var(--text-faint)] md:px-6">
        Nothing here yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5 px-2 md:px-4">
      {songs.map((song, index) => {
        const isActive = currentTrack?.id === song.id;
        const isLiked = likedSongIds?.has(song.id) ?? false;
        return (
          <li
            key={song.id}
            className={`group flex items-center rounded-xl transition-colors ${
              isActive ? "bg-[var(--surface)]" : "hover:bg-[var(--surface)]/60"
            }`}
          >
            <button
              onClick={() => playQueue(songs, index)}
              className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-left"
            >
              <CoverArt src={song.coverArtUrl} size={46} playing={isActive && isPlaying} />
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    isActive ? "text-[var(--accent)]" : "text-[var(--text)]"
                  }`}
                >
                  {song.title}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {song.artist || " "}
                </p>
              </div>
            </button>

            {likedSongIds !== undefined && (
              <button
                aria-label={isLiked ? "Unlike" : "Like"}
                onClick={() => startTransition(() => toggleLike(song.id))}
                className="px-3 py-2 text-[var(--text-faint)] transition-colors hover:text-[var(--accent)]"
              >
                <Heart
                  size={18}
                  fill={isLiked ? "var(--accent)" : "none"}
                  className={isLiked ? "text-[var(--accent)]" : ""}
                />
              </button>
            )}

            {onRemove && (
              <button
                aria-label="Remove from playlist"
                onClick={() => onRemove(song.id)}
                className="px-3 py-2 text-[var(--text-faint)] transition-colors hover:text-red-400"
              >
                <X size={17} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
