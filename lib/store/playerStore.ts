import { create } from "zustand";

export type PlayableSource = "library" | "upload" | "youtube";

export interface Track {
  id: string;
  title: string;
  artist?: string | null;
  coverArtUrl?: string | null;
  source: PlayableSource;
  // library/upload: Cloudinary-hosted audio URL. youtube: video id.
  streamUrl?: string | null;
  youtubeVideoId?: string | null;
}

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTrack: Track | null;
  // Distinguishes a user-initiated change from one applied by jam sync, so
  // the jam push effect doesn't echo a remote update straight back to the
  // server it just came from.
  origin: "local" | "remote";

  playQueue: (tracks: Track[], startIndex?: number) => void;
  playNow: (track: Track) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  next: () => void;
  previous: () => void;
  applyRemote: (track: Track, isPlaying: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTrack: null,
  origin: "local",

  playQueue: (tracks, startIndex = 0) => {
    set({
      queue: tracks,
      currentIndex: startIndex,
      currentTrack: tracks[startIndex] ?? null,
      isPlaying: tracks.length > 0,
      origin: "local",
    });
  },

  playNow: (track) => {
    set({ queue: [track], currentIndex: 0, currentTrack: track, isPlaying: true, origin: "local" });
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying, origin: "local" })),
  setIsPlaying: (playing) => set({ isPlaying: playing, origin: "local" }),

  next: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      set({ currentIndex: nextIndex, currentTrack: queue[nextIndex], isPlaying: true, origin: "local" });
    } else {
      set({ isPlaying: false, origin: "local" });
    }
  },

  previous: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      set({ currentIndex: prevIndex, currentTrack: queue[prevIndex], isPlaying: true, origin: "local" });
    }
  },

  // Applied by jam sync when the shared session's track/play-state differs
  // from ours. Tagged "remote" so we don't immediately push it right back.
  applyRemote: (track, isPlaying) => {
    set({ queue: [track], currentIndex: 0, currentTrack: track, isPlaying, origin: "remote" });
  },
}));
