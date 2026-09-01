"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}

interface UseYoutubePlayerOptions {
  containerId: string;
  videoId: string | null | undefined;
  isPlaying: boolean;
  volume: number;
  onEnded: () => void;
  // When set, the next video load starts at this position instead of 0 (used
  // for jam sync) — read and cleared once consumed.
  startSecondsRef?: React.RefObject<number | null>;
}

export function useYoutubePlayer({
  containerId,
  videoId,
  isPlaying,
  volume,
  onEnded,
  startSecondsRef,
}: UseYoutubePlayerOptions) {
  const playerRef = useRef<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  // Create the player once.
  useEffect(() => {
    let cancelled = false;

    loadYoutubeIframeApi().then(() => {
      if (cancelled || playerRef.current) return;
      playerRef.current = new window.YT.Player(containerId, {
        height: "0",
        width: "0",
        events: {
          onReady: () => {
            setIsReady(true);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEndedRef.current();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      setIsReady(false);
    };
  }, [containerId]);

  // Load the requested video. Play/pause effect below corrects the
  // playback state right after (loadVideoById always starts playback).
  useEffect(() => {
    if (!videoId || !isReady || !playerRef.current) return;
    const startSeconds = startSecondsRef?.current ?? undefined;
    if (startSecondsRef) startSecondsRef.current = null;
    playerRef.current.loadVideoById({ videoId, startSeconds });
  }, [videoId, isReady, startSecondsRef]);

  // Play/pause.
  useEffect(() => {
    if (!isReady || !playerRef.current || !videoId) return;
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, isReady, videoId]);

  // Volume.
  useEffect(() => {
    playerRef.current?.setVolume(Math.round(volume * 100));
  }, [volume]);

  // Poll progress while playing.
  useEffect(() => {
    if (!isPlaying || !videoId) return;
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime());
      setDuration(player.getDuration());
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, videoId]);

  function seekTo(seconds: number) {
    playerRef.current?.seekTo(seconds, true);
    setCurrentTime(seconds);
  }

  return { currentTime, duration, seekTo };
}
