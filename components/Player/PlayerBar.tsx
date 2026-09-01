"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from "lucide-react";
import { usePlayerStore } from "@/lib/store/playerStore";
import { useYoutubePlayer } from "@/lib/hooks/useYoutubePlayer";
import CoverArt from "@/components/CoverArt";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function PlayerBar() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const isYoutube = currentTrack?.source === "youtube";
  const isAudioSource = !!currentTrack && !isYoutube;

  const youtube = useYoutubePlayer({
    containerId: "youtube-player-container",
    videoId: isYoutube ? currentTrack.youtubeVideoId : null,
    isPlaying: isPlaying && isYoutube,
    volume,
    onEnded: next,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAudioSource) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, isAudioSource, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const progress = isYoutube ? youtube.currentTime : audioProgress;
  const duration = isYoutube ? youtube.duration : audioDuration;
  const progressPct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  function handleSeek(t: number) {
    if (isYoutube) {
      youtube.seekTo(t);
    } else if (audioRef.current) {
      audioRef.current.currentTime = t;
      setAudioProgress(t);
    }
  }

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 md:inset-x-auto md:bottom-0 md:left-64 md:right-0">
      <div
        id="youtube-player-container"
        className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-px w-px overflow-hidden"
      />

      {isAudioSource && currentTrack.streamUrl && (
        <audio
          ref={audioRef}
          src={currentTrack.streamUrl}
          onTimeUpdate={(e) => setAudioProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
          onEnded={next}
        />
      )}

      {currentTrack && (
        <div className="glass border-t border-[var(--border)] px-3 py-2.5 text-[var(--text)] md:px-5 md:py-3">
          {/* mobile progress hairline */}
          <div className="mb-2 h-[3px] w-full overflow-hidden rounded-full bg-[var(--surface)] md:hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <CoverArt src={currentTrack.coverArtUrl} size={48} playing={isPlaying} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{currentTrack.title}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{currentTrack.artist}</p>
              </div>
            </div>

            {/* mobile: play/pause + next only */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] active:scale-95"
              >
                {isPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" className="ml-0.5" />
                )}
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="flex h-10 w-10 items-center justify-center text-[var(--text-muted)]"
              >
                <SkipForward size={20} fill="currentColor" />
              </button>
            </div>

            {/* desktop: full transport + seek */}
            <div className="hidden flex-1 flex-col items-center gap-1.5 md:flex">
              <div className="flex items-center gap-5">
                <button
                  onClick={previous}
                  aria-label="Previous"
                  className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                >
                  <SkipBack size={18} fill="currentColor" />
                </button>
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <button
                  onClick={next}
                  aria-label="Next"
                  className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                >
                  <SkipForward size={18} fill="currentColor" />
                </button>
              </div>
              <div className="flex w-full max-w-md items-center gap-2 text-[11px] tabular-nums text-[var(--text-faint)]">
                <span>{formatTime(progress)}</span>
                <div className="group relative flex h-4 w-full items-center">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--surface)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={progress}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    aria-label="Seek"
                    className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
              <VolumeIcon size={18} className="text-[var(--text-faint)]" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="w-24 accent-[var(--accent)]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
