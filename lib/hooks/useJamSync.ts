"use client";

import { useEffect, useRef } from "react";
import { useJamStore } from "@/lib/store/jamStore";
import { usePlayerStore, type Track } from "@/lib/store/playerStore";

interface JamApiResponse {
  track: Track | null;
  isPlaying: boolean;
  positionSeconds: number;
  updatedAt: string;
  participantCount: number;
}

const POLL_MS = 2500;
const HEARTBEAT_MS = 8000;
const DRIFT_THRESHOLD_SECONDS = 4;

async function pushState(
  jamCode: string,
  positionSeconds: number,
  lastKnownUpdatedAtRef: React.RefObject<string | null>
) {
  const state = usePlayerStore.getState();
  try {
    const res = await fetch(`/api/jam/${jamCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        track: state.currentTrack,
        isPlaying: state.isPlaying,
        positionSeconds,
      }),
    });
    if (!res.ok) return;
    const data: JamApiResponse = await res.json();
    // Our own write is now the newest known state — remember its timestamp
    // so a slightly-delayed poll response (fetched before this write landed)
    // doesn't come back and undo it.
    lastKnownUpdatedAtRef.current = data.updatedAt;
  } catch {
    // transient network hiccup — next heartbeat/change will retry
  }
}

// Keeps this player in sync with a shared jam session: polls for the other
// participant's changes, and pushes ours. Callbacks are read via refs (not
// effect deps) so the poll/subscribe loops don't restart every time
// playback position ticks. Incoming state only ever applies if it's newer
// than the last state we know about (ours or theirs) — a classic
// last-write-wins guard against a stale poll response undoing a fresher
// local push.
export function useJamSync({
  getPosition,
  onRemoteSeek,
  onTrackChangeSeek,
}: {
  getPosition: () => number;
  // Same track, just corrects drift — safe to apply to the element right away.
  onRemoteSeek: (seconds: number) => void;
  // Track just changed — the new source hasn't loaded yet, so this only
  // records where to seek once it has (the caller applies it on load).
  onTrackChangeSeek: (seconds: number) => void;
}) {
  const jamCode = useJamStore((s) => s.jamCode);
  const lastKnownUpdatedAtRef = useRef<string | null>(null);

  // Picks up a jam code persisted from a previous visit.
  useEffect(() => {
    useJamStore.getState().hydrate();
  }, []);

  // Reset staleness tracking whenever we (re)join a jam.
  useEffect(() => {
    lastKnownUpdatedAtRef.current = null;
  }, [jamCode]);

  const getPositionRef = useRef(getPosition);
  const onRemoteSeekRef = useRef(onRemoteSeek);
  const onTrackChangeSeekRef = useRef(onTrackChangeSeek);
  useEffect(() => {
    getPositionRef.current = getPosition;
    onRemoteSeekRef.current = onRemoteSeek;
    onTrackChangeSeekRef.current = onTrackChangeSeek;
  }, [getPosition, onRemoteSeek, onTrackChangeSeek]);

  useEffect(() => {
    if (!jamCode) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/jam/${jamCode}`);
        if (!res.ok || cancelled) return;
        const data: JamApiResponse = await res.json();
        if (!data.track) return;

        if (
          lastKnownUpdatedAtRef.current !== null &&
          data.updatedAt <= lastKnownUpdatedAtRef.current
        ) {
          return;
        }
        lastKnownUpdatedAtRef.current = data.updatedAt;

        const local = usePlayerStore.getState();
        const trackChanged = data.track.id !== local.currentTrack?.id;
        const playStateChanged = data.isPlaying !== local.isPlaying;

        if (trackChanged || playStateChanged) {
          usePlayerStore.getState().applyRemote(data.track, data.isPlaying);
        }

        const elapsed = data.isPlaying
          ? Math.max(0, (Date.now() - new Date(data.updatedAt).getTime()) / 1000)
          : 0;
        const expectedPosition = data.positionSeconds + elapsed;

        if (trackChanged) {
          onTrackChangeSeekRef.current(expectedPosition);
        } else if (Math.abs(expectedPosition - getPositionRef.current()) > DRIFT_THRESHOLD_SECONDS) {
          onRemoteSeekRef.current(expectedPosition);
        }
      } catch {
        // transient network hiccup — next poll will retry
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [jamCode]);

  useEffect(() => {
    if (!jamCode) return;

    const unsubscribe = usePlayerStore.subscribe((state, prevState) => {
      if (state.origin !== "local") return;
      const trackChanged = state.currentTrack?.id !== prevState.currentTrack?.id;
      const playChanged = state.isPlaying !== prevState.isPlaying;
      if (!trackChanged && !playChanged) return;
      // Set synchronously, before the (async) push even starts — a poll
      // response that was already in flight when this change happened
      // carries an older timestamp and must lose to this one.
      lastKnownUpdatedAtRef.current = new Date().toISOString();
      pushState(jamCode, getPositionRef.current(), lastKnownUpdatedAtRef);
    });

    const heartbeat = setInterval(() => {
      if (usePlayerStore.getState().isPlaying) {
        lastKnownUpdatedAtRef.current = new Date().toISOString();
        pushState(jamCode, getPositionRef.current(), lastKnownUpdatedAtRef);
      }
    }, HEARTBEAT_MS);

    return () => {
      unsubscribe();
      clearInterval(heartbeat);
    };
  }, [jamCode]);

  function pushSeek(seconds: number) {
    if (!jamCode) return;
    lastKnownUpdatedAtRef.current = new Date().toISOString();
    pushState(jamCode, seconds, lastKnownUpdatedAtRef);
  }

  return { inJam: !!jamCode, pushSeek };
}
