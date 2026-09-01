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
        height: "200",
        width: "200",
        events: {
          onReady: (event: YT.PlayerEvent) => {
            // Browsers require a genuine click before allowing sound; a jam
            // sync switching tracks later is a programmatic call, not a
            // click, and YouTube's embed silently falls back to muted
            // playback unless it's explicitly told otherwise up front.
            event.target.unMute();
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

  // Volume — also explicitly (un)mute, since a video that fell back to
  // muted autoplay stays muted until something calls unMute() regardless of
  // what setVolume() reports.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.setVolume(Math.round(volume * 100));
    if (volume > 0) {
      player.unMute();
    } else {
      player.mute();
    }
  }, [volume, isReady]);

  // Belt-and-suspenders: re-assert unmuted right when (re)play is requested,
  // since this is exactly the moment autoplay-policy muting kicks in for a
  // programmatic (non-click) play call.
  useEffect(() => {
    if (!isReady || !playerRef.current || !isPlaying) return;
    if (volume > 0) playerRef.current.unMute();
  }, [isPlaying, isReady, volume]);

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
