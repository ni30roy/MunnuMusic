"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/lib/store/playerStore";
import { useYoutubePlayer } from "@/lib/hooks/useYoutubePlayer";

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

  function handleSeek(t: number) {
    if (isYoutube) {
      youtube.seekTo(t);
    } else if (audioRef.current) {
      audioRef.current.currentTime = t;
      setAudioProgress(t);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0">
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
          autoPlay
        />
      )}

      {currentTrack && (
        <div className="flex items-center gap-4 border-t border-neutral-800 bg-neutral-950 px-4 py-3 text-white">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {currentTrack.coverArtUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.coverArtUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded bg-neutral-800" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{currentTrack.title}</p>
              <p className="truncate text-xs text-neutral-400">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="flex items-center gap-4">
              <button onClick={previous} aria-label="Previous" className="text-neutral-300 hover:text-white">
                ⏮
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button onClick={next} aria-label="Next" className="text-neutral-300 hover:text-white">
                ⏭
              </button>
            </div>
            <div className="flex w-full max-w-md items-center gap-2 text-xs text-neutral-400">
              <span>{formatTime(progress)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-green-500"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 accent-green-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
