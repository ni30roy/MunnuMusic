"use client";

import { useEffect, useRef } from "react";
import type { Track } from "@/lib/store/playerStore";

interface UseMediaSessionOptions {
  track: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
}

// Tells the OS/browser this is a real "now playing" session — shows proper
// lock-screen/notification controls and, critically, is what lets playback
// keep going when the tab or installed PWA is backgrounded instead of the
// browser suspending it like an ordinary inactive page.
export function useMediaSession({
  track,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
}: UseMediaSessionOptions) {
  const handlersRef = useRef({ onPlay, onPause, onNext, onPrevious, onSeek });
  useEffect(() => {
    handlersRef.current = { onPlay, onPause, onNext, onPrevious, onSeek };
  }, [onPlay, onPause, onNext, onPrevious, onSeek]);

  // Register action handlers once.
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;

    session.setActionHandler("play", () => handlersRef.current.onPlay());
    session.setActionHandler("pause", () => handlersRef.current.onPause());
    session.setActionHandler("previoustrack", () => handlersRef.current.onPrevious());
    session.setActionHandler("nexttrack", () => handlersRef.current.onNext());
    try {
      session.setActionHandler("seekto", (details) => {
        if (typeof details.seekTime === "number") {
          handlersRef.current.onSeek(details.seekTime);
        }
      });
    } catch {
      // Some browsers don't support "seekto" — safe to skip.
    }

    return () => {
      session.setActionHandler("play", null);
      session.setActionHandler("pause", null);
      session.setActionHandler("previoustrack", null);
      session.setActionHandler("nexttrack", null);
      try {
        session.setActionHandler("seekto", null);
      } catch {
        // no-op
      }
    };
  }, []);

  // Metadata — what shows on the lock screen / media notification.
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist ?? "",
      artwork: track.coverArtUrl
        ? [
            { src: track.coverArtUrl, sizes: "96x96", type: "image/png" },
            { src: track.coverArtUrl, sizes: "512x512", type: "image/png" },
          ]
        : [],
    });
  }, [track]);

  // Playback state — keeps the lock-screen play/pause icon correct.
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);
}
